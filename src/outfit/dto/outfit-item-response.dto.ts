import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OutfitItemResponseDto {
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
