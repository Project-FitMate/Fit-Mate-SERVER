import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  saveUserImage(image: Express.Multer.File) {
    return { filename: image.filename };
  }
}
