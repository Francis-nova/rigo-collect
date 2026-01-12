import { BadRequestException, Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors, ParseFilePipe, FileTypeValidator } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadFileDto, UploadProvider } from '@pkg/dto';
import { UtilitiesService } from './utilities.service';
import { readFile } from 'fs/promises';
import { ApiParam } from '@nestjs/swagger';

@ApiTags('Utilities')
@Controller('v1/utils')
export class UtilitiesController {
  constructor(private readonly utils: UtilitiesService) { }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to Cloudinary or S3' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Allowed types: pdf, png, jpg, jpeg',
        },
        provider: { type: 'string', enum: ['cloudinary', 's3'] },
        folder: { type: 'string' },
        acl: { type: 'string', enum: ['private', 'public-read'] },
      },
      required: ['file', 'provider'],
    },
  })
  async upload(
    @UploadedFile(new ParseFilePipe({ validators: [new FileTypeValidator({ fileType: /(pdf|png|jpe?g)$/ })] })) file: Express.Multer.File,
    @Body() payload: UploadFileDto,
    @Req() req: any,
  ) {
    if (!file) throw new Error('File is required');
    const provider = payload.provider as UploadProvider;
    const buffer = file.buffer ?? (file.path ? await readFile(file.path) : undefined);
    if (!buffer) throw new Error('Unable to read file buffer');
    const res = await this.utils.upload(provider, {
      buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      folder: payload.folder,
      acl: payload.acl,
    });
    return res;
  }

  @Get('industries')
  @ApiOperation({ summary: 'List industries' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  listIndustries() {
    return this.utils.listIndustries();
  }

  @Get('countries')
  @ApiOperation({ summary: 'List countries' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  listCountries() {
    return this.utils.listCountries();
  }

  @Get('states/:countryId')
  @ApiOperation({ summary: 'List states by country ID' })
  @ApiParam({ name: 'countryId', description: 'Country UUID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  listStates(@Req() req: any) {
    const countryId = req.params?.countryId;
    if (!countryId) throw new Error('countryId is required');
    return this.utils.listStatesByCountry(countryId);
  }
}
