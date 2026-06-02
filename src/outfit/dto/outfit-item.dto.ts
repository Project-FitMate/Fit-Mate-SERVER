import { OutfitPart } from '../const/outfit-part.const';

export class OutfitItemDto {
  part: OutfitPart;
  image: string;
  brand: string;
  name: string;
  price: number;
  link: string;
}
