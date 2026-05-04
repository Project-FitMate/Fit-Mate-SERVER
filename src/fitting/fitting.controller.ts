import { Body, Controller, Post, SerializeOptions } from '@nestjs/common';
import { FittingResponseDto } from './dto/fitting-response.dto';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { FittingService } from './fitting.service';

@Controller('fitting')
export class FittingController {
  constructor(private readonly fittingService: FittingService) {}

  @Post()
  @SerializeOptions({ type: FittingResponseDto })
  createFitting(@Body() body: CreateFittingDto) {
    return this.fittingService.createFitting(body);
  }
}
