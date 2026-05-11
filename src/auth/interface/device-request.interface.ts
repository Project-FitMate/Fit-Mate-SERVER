import { Request } from 'express';

export interface DeviceRequest extends Request {
  deviceId: string;
}
