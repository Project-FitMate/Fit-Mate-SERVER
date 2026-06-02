import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { basename, isAbsolute, relative, resolve } from 'path';
import { firstValueFrom } from 'rxjs';
import { GetOutfitDto } from './dto/get-outfit.dto';
import { OutfitItemDto } from './dto/outfit-item.dto';

const USER_IMAGE_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9]{13}\.(jpe?g|png|webp)$/i;
const AI_MODEL_REQUEST_TIMEOUT_MS = 30000;

@Injectable()
export class OutfitService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getOutfits(dto: GetOutfitDto): Promise<OutfitItemDto[]> {
    const url = this.configService.get<string>('AI_MODEL_URL');
    const outfitUrl = this.createAiModelUrl(url, 'outfit');
    const userImageBase64 = await this.encodeUserImage(dto.userImageName);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<OutfitItemDto[]>(
          outfitUrl,
          {
            parts: dto.parts,
            minPrice: dto.minPrice,
            maxPrice: dto.maxPrice,
            userImage: userImageBase64,
          },
          {
            timeout: AI_MODEL_REQUEST_TIMEOUT_MS,
          },
        ),
      );

      return data;
    } catch {
      throw new BadGatewayException('AI 옷 추천 서버 요청에 실패했습니다.');
    }
  }

  private async encodeUserImage(userImageName: string): Promise<string> {
    const filePath = this.createTempImagePath(userImageName);
    const file = await readFile(filePath);
    return file.toString('base64');
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

    const relativePath = relative(tempDir, filePath);
    if (
      relativePath.startsWith('..') ||
      relativePath === '..' ||
      isAbsolute(relativePath)
    ) {
      throw new BadRequestException('파일 경로가 올바르지 않습니다.');
    }

    return filePath;
  }

  private createAiModelUrl(baseUrl: string, path: string): string {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return new URL(path, normalizedBaseUrl).toString();
  }
}
