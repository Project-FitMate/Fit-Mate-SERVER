import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserImagePipe } from './pipe/user-image.pipe';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  postUserImage(
    @UploadedFile(new UserImagePipe())
    image: Express.Multer.File,
  ) {
    return this.userService.saveUserImage(image);
  }
}
