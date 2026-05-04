import { Expose } from 'class-transformer';

export class FittingResponseDto {
  @Expose()
  image: string;
}
