import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FittingController } from './fitting.controller';
import { FittingService } from './fitting.service';

@Module({
  imports: [HttpModule],
  controllers: [FittingController],
  providers: [FittingService],
})
export class FittingModule {}
