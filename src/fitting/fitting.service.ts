import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, rename } from 'fs/promises';
import { basename, extname, isAbsolute, relative, resolve } from 'path';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { FittingResponseDto } from './dto/fitting-response.dto';

const USER_IMAGE_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9]{13}\.(jpe?g|png|webp)$/i;

@Injectable()
export class FittingService {
  constructor(private readonly configService: ConfigService) {}

  async createFitting(
    dto: CreateFittingDto,
    deviceId: string,
  ): Promise<FittingResponseDto> {
    const userImageBase64 = await this.encodeUserImage(dto.userImageName);
    const outfitImageBase64 = await this.encodeOutfitImage(dto.outfitImageUrl);

    await this.moveToUserDir(dto.userImageName, deviceId);

    return await this.requestFitting(userImageBase64, outfitImageBase64);
  }

  private async requestFitting(
    userImageBase64: string,
    outfitImageBase64: string,
  ): Promise<FittingResponseDto> {
    const url = this.configService.get<string>('AI_MODEL_URL');
    const response = await fetch(`${url}/fitting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userImage: userImageBase64,
        outfitImage: outfitImageBase64,
      }),
    });
    return response.json() as Promise<FittingResponseDto>;
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
    const response = await fetch(outfitImageUrl);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
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
}
