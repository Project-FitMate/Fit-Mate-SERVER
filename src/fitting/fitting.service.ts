import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { CreateFittingDto } from './dto/create-fitting.dto';

@Injectable()
export class FittingService {
  async createFitting(dto: CreateFittingDto): Promise<unknown> {
    const userImageBase64 = await this.encodeUserImage(dto.userImageName);
    const outfitImageBase64 = await this.encodeOutfitImage(dto.outfitImageUrl);

    // TODO: temp → public 이동 (디바이스 ID 기반, 가드 구현 후 추가)

    // TODO: AI 서버로 _userImageBase64, _outfitImageBase64 전송 (인터페이스 협의 후 구현)

    return {};
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
