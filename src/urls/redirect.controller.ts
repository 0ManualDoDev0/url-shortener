import { Controller, Get, Param, Res, Req, NotFoundException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { UrlsService } from './urls.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller()
@SkipThrottle()
export class RedirectController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get(':code')
  async redirect(@Param('code') code: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.urlsService.resolve(code);

    if (result.ok === false) {
      throw new NotFoundException('URL not found or expired');
    }

    this.analyticsService.track(result.urlId, req).catch(() => {});

    return res.redirect(301, result.originalUrl);
  }
}
