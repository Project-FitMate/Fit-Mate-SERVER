import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DeviceRequest } from '../interface/device-request.interface';

const DEVICE_ID_HEADER = 'device-id';
const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<DeviceRequest>();
    const deviceId = request.headers[DEVICE_ID_HEADER];

    if (Array.isArray(deviceId) || !deviceId) {
      throw new UnauthorizedException('device-id 헤더는 필수입니다.');
    }

    if (!DEVICE_ID_PATTERN.test(deviceId)) {
      throw new UnauthorizedException('device-id 형식이 올바르지 않습니다.');
    }

    request.deviceId = deviceId;
    return true;
  }
}
