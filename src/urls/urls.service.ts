import { Injectable, ConflictException, NotFoundException, GoneException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';
import * as QRCode from 'qrcode';

type CachedUrl = { urlId: string; originalUrl: string };
type ResolveResult =
  | { ok: true; urlId: string; originalUrl: string }
  | { ok: false; reason: 'not_found' | 'expired' };

const CACHE_KEY = (code: string) => `url:${code}`;
const DEFAULT_TTL = 86400; // 24h

@Injectable()
export class UrlsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateUrlDto) {
    const shortCode = dto.customCode ?? nanoid(8);

    const existing = await this.prisma.url.findUnique({ where: { shortCode } });
    if (existing) throw new ConflictException('Short code already in use');

    const url = await this.prisma.url.create({
      data: {
        originalUrl: dto.originalUrl,
        shortCode,
        title: dto.title ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        maxClicks: dto.maxClicks ?? null,
      },
    });

    // Only cache URLs without a maxClicks limit to avoid serving stale click counts
    if (!dto.maxClicks) {
      const ttl = dto.expiresAt
        ? Math.floor((new Date(dto.expiresAt).getTime() - Date.now()) / 1000)
        : DEFAULT_TTL;
      if (ttl > 0) {
        await this.redis.setex(CACHE_KEY(shortCode), ttl, JSON.stringify({ urlId: url.id, originalUrl: url.originalUrl } as CachedUrl));
      }
    }

    return url;
  }

  async findAll() {
    return this.prisma.url.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { clicks: true } } },
    });
  }

  async findByCode(shortCode: string) {
    const url = await this.prisma.url.findUnique({
      where: { shortCode },
      include: {
        _count: { select: { clicks: true } },
        clicks: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!url) throw new NotFoundException('URL not found');
    return url;
  }

  async resolve(shortCode: string): Promise<ResolveResult> {
    const cached = await this.redis.get(CACHE_KEY(shortCode));
    if (cached) {
      const { urlId, originalUrl } = JSON.parse(cached) as CachedUrl;
      return { ok: true, urlId, originalUrl };
    }

    const url = await this.prisma.url.findUnique({
      where: { shortCode },
      include: { _count: { select: { clicks: true } } },
    });

    if (!url || !url.isActive) return { ok: false, reason: 'not_found' };

    if (url.expiresAt && url.expiresAt < new Date()) return { ok: false, reason: 'expired' };
    if (url.maxClicks && url._count.clicks >= url.maxClicks) return { ok: false, reason: 'expired' };

    if (!url.maxClicks) {
      const ttl = url.expiresAt
        ? Math.floor((url.expiresAt.getTime() - Date.now()) / 1000)
        : DEFAULT_TTL;
      if (ttl > 0) {
        await this.redis.setex(CACHE_KEY(shortCode), ttl, JSON.stringify({ urlId: url.id, originalUrl: url.originalUrl } as CachedUrl));
      }
    }

    return { ok: true, urlId: url.id, originalUrl: url.originalUrl };
  }

  async remove(shortCode: string) {
    const url = await this.prisma.url.findUnique({ where: { shortCode } });
    if (!url) throw new NotFoundException('URL not found');
    await this.redis.del(CACHE_KEY(shortCode));
    return this.prisma.url.delete({ where: { shortCode } });
  }

  async generateQr(shortCode: string, baseUrl: string): Promise<Buffer> {
    const url = await this.prisma.url.findUnique({ where: { shortCode } });
    if (!url) throw new NotFoundException('URL not found');
    return QRCode.toBuffer(`${baseUrl}/${shortCode}`);
  }
}
