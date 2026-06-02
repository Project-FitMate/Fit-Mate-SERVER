import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  Matches,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { OutfitPart } from '../const/outfit-part.const';

const USER_IMAGE_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9]{13}\.(jpe?g|png|webp)$/i;

// 각 옷은 0~500,000원. 전체 예산 상한은 선택한 부위 수만큼 비례한다.
const MAX_PRICE_PER_PART = 500000;

@ValidatorConstraint({ name: 'IsValidPriceRange', async: false })
class IsValidPriceRangeConstraint implements ValidatorConstraintInterface {
  validate(maxPrice: number, args: ValidationArguments): boolean {
    const object = args.object as GetOutfitDto;
    const { minPrice, parts } = object;

    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
      return false;
    }

    const partCount = Array.isArray(parts) ? parts.length : 0;
    const budget = MAX_PRICE_PER_PART * partCount;

    return minPrice <= maxPrice && maxPrice <= budget;
  }

  defaultMessage(): string {
    return 'maxPrice는 minPrice 이상이며 (500000 × 선택 부위 수) 이하여야 합니다.';
  }
}

export class GetOutfitDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(OutfitPart, { each: true })
  parts: OutfitPart[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Validate(IsValidPriceRangeConstraint)
  maxPrice: number;

  @Matches(USER_IMAGE_NAME_PATTERN, {
    message: 'userImageName 형식이 올바르지 않습니다.',
  })
  userImageName: string;
}
