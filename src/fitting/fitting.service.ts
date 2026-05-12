import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LookupAddress } from 'dns';
import { lookup } from 'dns/promises';
import { mkdir, readFile, rename } from 'fs/promises';
import { isIP } from 'net';
import { basename, extname, isAbsolute, relative, resolve } from 'path';
import { firstValueFrom } from 'rxjs';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { FittingResponseDto } from './dto/fitting-response.dto';

const USER_IMAGE_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9]{13}\.(jpe?g|png|webp)$/i;
const AI_MODEL_REQUEST_TIMEOUT_MS = 10000;
const OUTFIT_IMAGE_REQUEST_TIMEOUT_MS = 10000;
const MAX_OUTFIT_IMAGE_SIZE_IN_BYTES = 10 * 1000 * 1000;
const ALLOWED_OUTFIT_IMAGE_PROTOCOLS = ['http:', 'https:'];
const ALLOWED_OUTFIT_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

@Injectable()
export class FittingService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createFitting(
    dto: CreateFittingDto,
    deviceId: string,
  ): Promise<FittingResponseDto> {
    const userImageBase64 = await this.encodeUserImage(dto.userImageName);
    const outfitImageBase64 = await this.encodeOutfitImage(dto.outfitImageUrl);
    const fitting = await this.requestFitting(
      userImageBase64,
      outfitImageBase64,
    );

    await this.moveToUserDir(dto.userImageName, deviceId);

    return fitting;
  }

  private async requestFitting(
    userImageBase64: string,
    outfitImageBase64: string,
  ): Promise<FittingResponseDto> {
    const url = this.configService.get<string>('AI_MODEL_URL');
    const fittingUrl = this.createUrl(url, 'fitting');

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<FittingResponseDto>(
          fittingUrl,
          {
            userImage: userImageBase64,
            outfitImage: outfitImageBase64,
          },
          {
            timeout: AI_MODEL_REQUEST_TIMEOUT_MS,
          },
        ),
      );

      return data;
    } catch {
      throw new BadGatewayException('AI 피팅 서버 요청에 실패했습니다.');
    }
  }

  private async moveToUserDir(
    userImageName: string,
    deviceId: string,
  ): Promise<void> {
    const srcPath = this.createTempImagePath(userImageName);
    const ext = extname(userImageName);
    const userDir = resolve(process.cwd(), 'public', 'user');
    const destPath = resolve(userDir, `${deviceId}${ext}`);

    this.assertPathInsideDir(userDir, destPath);
    await mkdir(userDir, { recursive: true });
    await rename(srcPath, destPath);
  }

  private async encodeUserImage(userImageName: string): Promise<string> {
    const filePath = this.createTempImagePath(userImageName);
    const file = await readFile(filePath);
    return file.toString('base64');
  }

  private async encodeOutfitImage(outfitImageUrl: string): Promise<string> {
    await this.assertOutfitImageUrl(outfitImageUrl);

    const { data, headers } = await this.downloadOutfitImage(outfitImageUrl);

    this.assertOutfitImageResponse(headers['content-type']);

    return Buffer.from(data).toString('base64');
  }

  private async downloadOutfitImage(outfitImageUrl: string) {
    try {
      return await firstValueFrom(
        this.httpService.get<ArrayBuffer>(outfitImageUrl, {
          responseType: 'arraybuffer',
          timeout: OUTFIT_IMAGE_REQUEST_TIMEOUT_MS,
          maxContentLength: MAX_OUTFIT_IMAGE_SIZE_IN_BYTES,
          maxBodyLength: MAX_OUTFIT_IMAGE_SIZE_IN_BYTES,
        }),
      );
    } catch {
      throw new BadRequestException('옷 이미지 다운로드에 실패했습니다.');
    }
  }

  private async assertOutfitImageUrl(outfitImageUrl: string): Promise<void> {
    let url: URL;

    try {
      url = new URL(outfitImageUrl);
    } catch {
      throw new BadRequestException('옷 이미지 URL 형식이 올바르지 않습니다.');
    }

    if (!ALLOWED_OUTFIT_IMAGE_PROTOCOLS.includes(url.protocol)) {
      throw new BadRequestException(
        'http 또는 https 이미지 URL만 사용할 수 있습니다.',
      );
    }

    let addresses: LookupAddress[];

    try {
      addresses = await lookup(url.hostname, { all: true });
    } catch {
      throw new BadRequestException('옷 이미지 URL을 확인할 수 없습니다.');
    }
    if (addresses.some(({ address }) => this.isPrivateAddress(address))) {
      throw new BadRequestException('허용되지 않은 옷 이미지 URL입니다.');
    }
  }

  private assertOutfitImageResponse(contentType: unknown): void {
    const normalizedContentType = Array.isArray(contentType)
      ? contentType[0]
      : contentType;

    if (
      typeof normalizedContentType !== 'string' ||
      !ALLOWED_OUTFIT_IMAGE_CONTENT_TYPES.some((allowedType) =>
        normalizedContentType.startsWith(allowedType),
      )
    ) {
      throw new BadRequestException('지원하지 않는 옷 이미지 형식입니다.');
    }
  }

  private createTempImagePath(userImageName: string): string {
    if (
      basename(userImageName) !== userImageName ||
      !USER_IMAGE_NAME_PATTERN.test(userImageName)
    ) {
      throw new BadRequestException('userImageName 형식이 올바르지 않습니다.');
    }

    const tempDir = resolve(process.cwd(), 'public', 'temp');
    const filePath = resolve(tempDir, userImageName);

    this.assertPathInsideDir(tempDir, filePath);
    return filePath;
  }

  private assertPathInsideDir(dirPath: string, targetPath: string): void {
    const relativePath = relative(dirPath, targetPath);

    if (
      relativePath.startsWith('..') ||
      relativePath === '..' ||
      isAbsolute(relativePath)
    ) {
      throw new BadRequestException('파일 경로가 올바르지 않습니다.');
    }
  }

  private createUrl(baseUrl: string, path: string): string {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return new URL(path, normalizedBaseUrl).toString();
  }

  private isPrivateAddress(address: string): boolean {
    if (isIP(address) === 4) {
      const [first, second] = address.split('.').map(Number);
      return (
        first === 10 ||
        first === 127 ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168) ||
        (first === 169 && second === 254)
      );
    }

    const normalizedAddress = address.toLowerCase();
    return (
      normalizedAddress === '::1' ||
      normalizedAddress === '::' ||
      normalizedAddress.startsWith('fc') ||
      normalizedAddress.startsWith('fd') ||
      normalizedAddress.startsWith('fe80:')
    );
  }
}
