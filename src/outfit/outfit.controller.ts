import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { OutfitItemResponseDto } from './dto/outfit-item-response.dto';
import { GetOutfitDto } from './dto/get-outfit.dto';
import { OutfitService } from './outfit.service';

@Controller('outfit')
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Get()
  @SerializeOptions({ type: OutfitItemResponseDto })
  getOutfits(@Query() query: GetOutfitDto) {
    return this.outfitService.getOutfits(query);
  }
}
