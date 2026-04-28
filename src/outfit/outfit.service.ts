import { Injectable } from '@nestjs/common';
import { GetOutfitDto } from './dto/get-outfit.dto';
import { OutfitItemDto } from './dto/outfit-item.dto';

@Injectable()
export class OutfitService {
  async getOutfits(_dto: GetOutfitDto): Promise<OutfitItemDto[]> {
    // TODO: 외부 쇼핑 API 연동 (native fetch)
    return [];
  }
}
