import { Expose } from 'class-transformer';

export class UserImageResponseDto {
  @Expose()
  filename: string;
}
