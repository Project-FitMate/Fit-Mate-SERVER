import { Injectable } from '@nestjs/common';
import { CreateUserImageDto } from './dto/create-user-image.dto';
import { UserImageResponseDto } from './dto/user-image-response.dto';

@Injectable()
export class UserService {
  saveUserImage(dto: CreateUserImageDto): UserImageResponseDto {
    return { filename: dto.image.filename };
  }
}
