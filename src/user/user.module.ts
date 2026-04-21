import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'temp'),
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, TasksService],
})
export class UserModule {}
