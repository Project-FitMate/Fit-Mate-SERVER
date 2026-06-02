import { Exclude, Expose } from 'class-transformer';
import { OutfitPart } from '../const/outfit-part.const';

@Exclude()
export class OutfitItemResponseDto {
  @Expose()
  part: OutfitPart;

  @Expose()
  image: string;

  @Expose()
  brand: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  link: string;
}
