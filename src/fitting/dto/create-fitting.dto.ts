import { IsString, IsUrl, Matches } from 'class-validator';

export class CreateFittingDto {
  @IsString()
  @Matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9]{13}\.(jpe?g|png|webp)$/i,
    {
      message: 'userImageName 형식이 올바르지 않습니다.',
    },
  )
  userImageName: string;

  @IsUrl()
  outfitImageUrl: string;
}
