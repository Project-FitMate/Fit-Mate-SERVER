import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  Max,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { OutfitPart } from '../const/outfit-part.const';

@ValidatorConstraint({ name: 'IsValidPriceRange', async: false })
class IsValidPriceRangeConstraint implements ValidatorConstraintInterface {
  validate(maxPrice: number, args: ValidationArguments): boolean {
    const object = args.object as GetOutfitDto;
    const { minPrice } = object;

    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
      return false;
    }

    return minPrice <= maxPrice;
  }

  defaultMessage(): string {
    return 'maxPrice는 minPrice보다 크거나 같아야 합니다.';
  }
}

export class GetOutfitDto {
  @IsEnum(OutfitPart)
  part: OutfitPart;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(500000)
  @Validate(IsValidPriceRangeConstraint)
  maxPrice: number;
}
