import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

const USER_IMAGE_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9]{13}\.(jpe?g|png|webp)$/i;

export class CreateFittingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Matches(/^[^/\\]+$/, {
    message: 'userImageName에는 경로 구분자를 사용할 수 없습니다.',
  })
  @Matches(USER_IMAGE_NAME_PATTERN, {
    message: 'userImageName 형식이 올바르지 않습니다.',
  })
  userImageName: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  outfitImageUrls: string[];
}
