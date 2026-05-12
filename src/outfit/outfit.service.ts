import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GetOutfitDto } from './dto/get-outfit.dto';
import { OutfitItemDto } from './dto/outfit-item.dto';

const AI_MODEL_REQUEST_TIMEOUT_MS = 10000;

@Injectable()
export class OutfitService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getOutfits(dto: GetOutfitDto): Promise<OutfitItemDto[]> {
    const url = this.configService.get<string>('AI_MODEL_URL');
    const outfitUrl = this.createAiModelUrl(url, 'outfit');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<OutfitItemDto[]>(outfitUrl, {
          params: dto,
          timeout: AI_MODEL_REQUEST_TIMEOUT_MS,
        }),
      );

      return data;
    } catch {
      throw new BadGatewayException('AI 옷 추천 서버 요청에 실패했습니다.');
    }
  }

  private createAiModelUrl(baseUrl: string, path: string): string {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return new URL(path, normalizedBaseUrl).toString();
  }
}
