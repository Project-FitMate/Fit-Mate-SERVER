import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { rename } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserImagePipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  private readonly MAX_SIZE_MB = 10;
  private readonly ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

  async transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    this.assertFileExists(file);
    this.assertFileSize(file);
    this.assertMimeType(file);
    return await this.rename(file);
  }

  private assertFileExists(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('image 필드는 필수입니다.');
    }
  }

  private assertFileSize(file: Express.Multer.File) {
    const maxSizeInByte = this.MAX_SIZE_MB * 1000000;
    if (file.size > maxSizeInByte) {
      throw new BadRequestException(
        `${this.MAX_SIZE_MB}MB 이하의 파일만 업로드 가능합니다.`,
      );
    }
  }

  private assertMimeType(file: Express.Multer.File) {
    if (!this.ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'jpeg, png, webp 형식만 업로드 가능합니다.',
      );
    }
  }

  private async rename(file: Express.Multer.File) {
    const extension = file.originalname.split('.').pop();
    const filename = `${uuidv4()}_${Date.now()}.${extension}`;
    const newPath = join(file.destination, filename);

    await rename(file.path, newPath);

    return { ...file, filename, path: newPath };
  }
}
