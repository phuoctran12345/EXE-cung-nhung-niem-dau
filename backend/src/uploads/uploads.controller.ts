import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // API Upload file (ảnh, PDF giấy phép kinh doanh, ...)
  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    console.log(`>>> [BACKEND] Nhận yêu cầu upload ${files.length} file`);
    const urls = await this.cloudinaryService.uploadImages(files);
    return {
      success: true,
      data: urls,
    };
  }
}
