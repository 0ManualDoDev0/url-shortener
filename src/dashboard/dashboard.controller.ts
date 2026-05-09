import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async overview() {
    const [totalUrls, totalClicks, topUrls, byDevice, byBrowser, byCountry] =
      await Promise.all([
        this.prisma.url.count({ where: { isActive: true } }),
        this.prisma.click.count(),
        this.prisma.url.findMany({
          where: { isActive: true },
          orderBy: { clicks: { _count: 'desc' } },
          take: 10,
          include: { _count: { select: { clicks: true } } },
        }),
        this.prisma.click.groupBy({
          by: ['device'],
          _count: { _all: true },
          orderBy: { _count: { _all: 'desc' } },
        }),
        this.prisma.click.groupBy({
          by: ['browser'],
          _count: { _all: true },
          orderBy: { _count: { _all: 'desc' } },
        }),
        this.prisma.click.groupBy({
          by: ['country'],
          _count: { _all: true },
          orderBy: { _count: { _all: 'desc' } },
          take: 10,
        }),
      ]);

    return {
      totalUrls,
      totalClicks,
      topUrls: topUrls.map((u) => ({
        shortCode: u.shortCode,
        originalUrl: u.originalUrl,
        title: u.title,
        clicks: u._count.clicks,
        createdAt: u.createdAt,
      })),
      clicksByDevice: byDevice.map((r) => ({ device: r.device ?? 'unknown', clicks: r._count._all })),
      clicksByBrowser: byBrowser.map((r) => ({ browser: r.browser ?? 'unknown', clicks: r._count._all })),
      clicksByCountry: byCountry.map((r) => ({ country: r.country ?? 'unknown', clicks: r._count._all })),
    };
  }
}
