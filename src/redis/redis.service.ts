import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL');
    if (url) {
      super(url);
    } else {
      super({
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: +config.get<string>('REDIS_PORT', '6379'),
        password: config.get<string>('REDIS_PASSWORD'),
        lazyConnect: false,
      });
    }
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
