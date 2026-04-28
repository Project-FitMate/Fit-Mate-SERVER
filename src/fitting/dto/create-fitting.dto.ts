import { IsString, IsUrl } from 'class-validator';

export class CreateFittingDto {
  @IsString()
  userImageName: string;

  @IsUrl()
  outfitImageUrl: string;
}
