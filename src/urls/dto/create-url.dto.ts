import { IsUrl, IsOptional, IsString, IsDateString, IsInt, Min, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUrlDto {
  @IsUrl({ require_protocol: true })
  originalUrl: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  customCode?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  maxClicks?: number;
}
