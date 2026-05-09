import { Controller, Post, Get, Delete, Body, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Controller('api/urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post()
  create(@Body() dto: CreateUrlDto) {
    return this.urlsService.create(dto);
  }

  @Get()
  findAll() {
    return this.urlsService.findAll();
  }

  @Get(':shortCode/qr')
  async qr(@Param('shortCode') shortCode: string, @Req() req: Request, @Res() res: Response) {
    const baseUrl = process.env.BASE_URL ?? `${req.protocol}://${req.get('host')}`;
    const buffer = await this.urlsService.generateQr(shortCode, baseUrl);
    res.set({ 'Content-Type': 'image/png', 'Content-Length': buffer.length });
    res.end(buffer);
  }

  @Get(':shortCode')
  findOne(@Param('shortCode') shortCode: string) {
    return this.urlsService.findByCode(shortCode);
  }

  @Delete(':shortCode')
  remove(@Param('shortCode') shortCode: string) {
    return this.urlsService.remove(shortCode);
  }
}
