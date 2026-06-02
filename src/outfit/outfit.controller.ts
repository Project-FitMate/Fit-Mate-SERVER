import { Body, Controller, Post, SerializeOptions } from '@nestjs/common';
import { OutfitItemResponseDto } from './dto/outfit-item-response.dto';
import { GetOutfitDto } from './dto/get-outfit.dto';
import { OutfitService } from './outfit.service';

@Controller('outfit')
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Post()
  @SerializeOptions({
    type: OutfitItemResponseDto,
    excludeExtraneousValues: true,
  })
  getOutfits(@Body() body: GetOutfitDto) {
    return this.outfitService.getOutfits(body);
  }
}
