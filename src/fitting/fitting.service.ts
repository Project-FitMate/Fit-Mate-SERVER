import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile, rename } from 'fs/promises';
import { extname, join } from 'path';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { FittingResponseDto } from './dto/fitting-response.dto';

@Injectable()
export class FittingService {
  constructor(private readonly configService: ConfigService) {}

  async createFitting(dto: CreateFittingDto): Promise<FittingResponseDto> {
    const userImageBase64 = await this.encodeUserImage(dto.userImageName);
    const outfitImageBase64 = await this.encodeOutfitImage(dto.outfitImageUrl);

    // TODO: 가드에서 디바이스 ID 주입 후 아래 주석 해제
    // await this.moveToUserDir(dto.userImageName, deviceId);

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
      body: JSON.stringify({ userImage: userImageBase64, outfitImage: outfitImageBase64 }),
    });
    return response.json() as Promise<FittingResponseDto>;
  }

  private async moveToUserDir(userImageName: string, deviceId: string): Promise<void> {
    const ext = extname(userImageName);
    const srcPath = join(process.cwd(), 'public', 'temp', userImageName);
    const destPath = join(process.cwd(), 'public', 'user', `${deviceId}${ext}`);
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
