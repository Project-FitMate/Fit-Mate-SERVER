import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';
import { GetOutfitDto } from './dto/get-outfit.dto';
import { OutfitItemDto } from './dto/outfit-item.dto';

@Injectable()
export class OutfitService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getOutfits(dto: GetOutfitDto): Promise<OutfitItemDto[]> {
    const url = this.configService.get<string>('AI_MODEL_URL');
    const userImage = await this.encodeUserImage(dto.userImageName);
    const { data } = await firstValueFrom(
      this.httpService.post<OutfitItemDto[]>(`${url}/outfit`, {
        part: dto.part,
        minPrice: dto.minPrice,
        maxPrice: dto.maxPrice,
        userImage,
      }),
    );
    return data;
  }

  private async encodeUserImage(userImageName: string): Promise<string> {
    const filePath = join(process.cwd(), 'public', 'temp', userImageName);
    const file = await readFile(filePath);
    return file.toString('base64');
  }
}
