import { Injectable } from '@nestjs/common';
import { GetOutfitDto } from './dto/get-outfit.dto';

export interface OutfitItem {
  image: string;
  brand: string;
  name: string;
  price: number;
  link: string;
  [key: string]: unknown; // 추가 필드 여지
}

@Injectable()
export class OutfitService {
  async getOutfits(_dto: GetOutfitDto): Promise<OutfitItem[]> {
    // TODO: 외부 쇼핑 API 연동 (native fetch)
    return [];
  }
}
