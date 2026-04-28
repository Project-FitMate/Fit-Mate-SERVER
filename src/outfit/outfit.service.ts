import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    const { data } = await firstValueFrom(
      this.httpService.get<OutfitItemDto[]>(`${url}/outfit`, { params: dto }),
    );
    return data;
  }
}
