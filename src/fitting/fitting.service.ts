import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, rename } from 'fs/promises';
import { extname, join } from 'path';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { FittingResponseDto } from './dto/fitting-response.dto';

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
    const ext = extname(userImageName);
    const srcPath = join(process.cwd(), 'public', 'temp', userImageName);
    const userDir = join(process.cwd(), 'public', 'user');
    const destPath = join(userDir, `${deviceId}${ext}`);
    await mkdir(userDir, { recursive: true });
    await rename(srcPath, destPath);
  }

  private async encodeUserImage(userImageName: string): Promise<string> {
    const filePath = join(process.cwd(), 'public', 'temp', userImageName);
    const file = await readFile(filePath);
    return file.toString('base64');
  }

  private async encodeOutfitImage(outfitImageUrl: string): Promise<string> {
    const response = await fetch(outfitImageUrl);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  }
}
