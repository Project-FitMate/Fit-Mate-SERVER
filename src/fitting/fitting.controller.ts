import {
  Body,
  Controller,
  Post,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { DeviceId } from '../auth/decorator/device-id.decorator';
import { DeviceAuthGuard } from '../auth/guard/device-auth.guard';
import { FittingResponseDto } from './dto/fitting-response.dto';
import { CreateFittingDto } from './dto/create-fitting.dto';
import { FittingService } from './fitting.service';

@Controller('fitting')
export class FittingController {
  constructor(private readonly fittingService: FittingService) {}

  @Post()
  @UseGuards(DeviceAuthGuard)
  @SerializeOptions({ type: FittingResponseDto })
  createFitting(@Body() body: CreateFittingDto, @DeviceId() deviceId: string) {
    return this.fittingService.createFitting(body, deviceId);
  }
}
