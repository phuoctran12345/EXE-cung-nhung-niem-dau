import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
const toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // Cấu hình Cloudinary từ biến môi trường
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  // Hàm upload hình ảnh từ buffer (dùng Multer)
  async uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('>>> [BACKEND] Đang upload ảnh lên Cloudinary...');
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }

  // Hàm upload nhiều ảnh cùng lúc
  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    const results = await Promise.all(uploadPromises);
    return results.map((result) => result.secure_url);
  }
}
