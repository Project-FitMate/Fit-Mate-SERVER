import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { UserModule } from './user/user.module';
import { OutfitModule } from './outfit/outfit.module';
import { FittingModule } from './fitting/fitting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        AI_MODEL_URL: Joi.string().uri().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    OutfitModule,
    FittingModule,
  ],
})
export class AppModule {}
