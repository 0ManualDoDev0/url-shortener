import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as UAParser from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async track(urlId: string, req: Request): Promise<void> {
    const ua = req.headers['user-agent'] ?? '';
    const parser = new (UAParser as any)(ua);
    const result = parser.getResult();

    const ip =
      ((req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()) ??
      req.socket?.remoteAddress ??
      '';

    const geo = geoip.lookup(ip);

    await this.prisma.click.create({
      data: {
        urlId,
        device: result.device?.type ?? 'desktop',
        browser: result.browser?.name ?? 'unknown',
        referrer: (req.headers['referer'] as string) ?? null,
        country: geo?.country ?? null,
        ip,
      },
    });
  }
}
