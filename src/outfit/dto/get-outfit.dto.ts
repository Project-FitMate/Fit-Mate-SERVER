import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { OutfitPart } from '../const/outfit-part.const';

export class GetOutfitDto {
  @IsEnum(OutfitPart)
  part: OutfitPart;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice: number;

  @Type(() => Number)
  @IsInt()
  @Max(500000)
  maxPrice: number;
}
