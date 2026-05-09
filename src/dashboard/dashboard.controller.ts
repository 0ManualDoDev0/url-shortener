import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type GroupRow = { label: string | null; clicks: bigint };

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
        this.prisma.$queryRaw<GroupRow[]>`
          SELECT device AS label, COUNT(*)::bigint AS clicks
          FROM "Click"
          GROUP BY device
          ORDER BY clicks DESC
        `,
        this.prisma.$queryRaw<GroupRow[]>`
          SELECT browser AS label, COUNT(*)::bigint AS clicks
          FROM "Click"
          GROUP BY browser
          ORDER BY clicks DESC
        `,
        this.prisma.$queryRaw<GroupRow[]>`
          SELECT country AS label, COUNT(*)::bigint AS clicks
          FROM "Click"
          GROUP BY country
          ORDER BY clicks DESC
          LIMIT 10
        `,
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
      clicksByDevice: byDevice.map((r) => ({ device: r.label ?? 'unknown', clicks: Number(r.clicks) })),
      clicksByBrowser: byBrowser.map((r) => ({ browser: r.label ?? 'unknown', clicks: Number(r.clicks) })),
      clicksByCountry: byCountry.map((r) => ({ country: r.label ?? 'unknown', clicks: Number(r.clicks) })),
    };
  }
}
