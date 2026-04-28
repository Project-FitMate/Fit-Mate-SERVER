import { Body, Controller, Post } from '@nestjs/common';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { FittingService } from './fitting.service';

@Controller('fitting')
export class FittingController {
  constructor(private readonly fittingService: FittingService) {}

  @Post()
  createFitting(@Body() body: CreateFittingDto) {
    return this.fittingService.createFitting(body);
  }
}
