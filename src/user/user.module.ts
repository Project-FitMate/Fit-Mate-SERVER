import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TasksService } from './tasks.service';

const TEMP_DIR = join(process.cwd(), 'public', 'temp');
const MAX_IMAGE_SIZE_IN_BYTES = 10 * 1000 * 1000;

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: MAX_IMAGE_SIZE_IN_BYTES,
      },
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          mkdirSync(TEMP_DIR, { recursive: true });
          callback(null, TEMP_DIR);
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, TasksService],
})
export class UserModule {}
