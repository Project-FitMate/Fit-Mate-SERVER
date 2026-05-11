import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DeviceRequest } from '../interface/device-request.interface';

export const DeviceId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<DeviceRequest>();
    return request.deviceId;
  },
);
