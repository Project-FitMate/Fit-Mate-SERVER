import { OutfitPart } from '../const/outfit-part.const';

export class GetOutfitDto {
  part: OutfitPart;
  minPrice: number; // 최소 0
  maxPrice: number; // 최대 500000
}
