import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OutfitController } from './outfit.controller';
import { OutfitService } from './outfit.service';

@Module({
  imports: [HttpModule],
  controllers: [OutfitController],
  providers: [OutfitService],
})
export class OutfitModule {}
