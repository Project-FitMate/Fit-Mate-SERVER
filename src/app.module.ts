import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OutfitModule } from './outfit/outfit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        OPENAI_API_KEY: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    OutfitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
