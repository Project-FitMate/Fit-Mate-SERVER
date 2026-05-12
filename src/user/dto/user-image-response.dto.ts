import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserImageResponseDto {
  @Expose()
  filename: string;
}
