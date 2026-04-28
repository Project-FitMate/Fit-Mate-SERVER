import { Controller, Get, Query } from '@nestjs/common';
import { GetOutfitDto } from './dto/get-outfit.dto';
import { OutfitService } from './outfit.service';

@Controller('outfit')
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Get()
  getOutfits(@Query() query: GetOutfitDto) {
    return this.outfitService.getOutfits(query);
  }
}
