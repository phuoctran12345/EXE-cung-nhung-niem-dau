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

  // Upload file — PDF dùng resource_type 'raw' để trình duyệt mở được
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname?.toLowerCase().endsWith('.pdf');

  console.log('[Cloudinary:Upload] Bắt đầu upload', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.buffer?.length,
      isPdf,
    });

    const options = isPdf
      ? { resource_type: 'raw' as const, folder: 'partner-documents' }
      : { resource_type: 'image' as const, folder: 'partner-documents' };

    const result = await new Promise<any>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(options, (error, res) => {
        if (error) {
          console.error('[Cloudinary:Upload] Lỗi upload_stream', error);
          return reject(error);
        }
        resolve(res);
      });
      toStream(file.buffer).pipe(upload);
    });

    console.log('[Cloudinary:Upload] Thành công', {
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
    });

    return result.secure_url as string;
  }

  /** Tải file từ Cloudinary (raw/image) */
  async downloadByUrl(fileUrl: string): Promise<Buffer> {
    console.log('[Cloudinary:Download] Bắt đầu tải', { fileUrl });

    // File upload public → fetch trực tiếp secure_url (ổn định nhất)
    const directResponse = await fetch(fileUrl);
    console.log('[Cloudinary:Download] Fetch trực tiếp', {
      ok: directResponse.ok,
      status: directResponse.status,
      contentType: directResponse.headers.get('content-type'),
    });

    if (directResponse.ok) {
      const buffer = Buffer.from(await directResponse.arrayBuffer());
      console.log('[Cloudinary:Download] OK qua secure_url', { bytes: buffer.length });
      return buffer;
    }

    // Fallback: signed URL khi file private/authenticated
    const parsed = this.parseCloudinaryUrl(fileUrl);
    if (!parsed) {
      throw new Error(
        `Không tải được file: HTTP ${directResponse.status} (URL không phải Cloudinary)`,
      );
    }

    console.log('[Cloudinary:Download] Fallback private_download_url', parsed);

    const downloadUrl = cloudinary.utils.private_download_url(
      parsed.publicId,
      parsed.format,
      {
        resource_type: parsed.resourceType,
        type: 'upload',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      },
    );

    const signedResponse = await fetch(downloadUrl);
    console.log('[Cloudinary:Download] Signed URL response', {
      ok: signedResponse.ok,
      status: signedResponse.status,
    });

    if (!signedResponse.ok) {
      throw new Error(
        `Không tải được file từ Cloudinary: direct=${directResponse.status}, signed=${signedResponse.status}`,
      );
    }

    const buffer = Buffer.from(await signedResponse.arrayBuffer());
    console.log('[Cloudinary:Download] OK qua signed URL', { bytes: buffer.length });
    return buffer;
  }

  private parseCloudinaryUrl(fileUrl: string): {
    publicId: string;
    format: string;
    resourceType: 'raw' | 'image';
  } | null {
    try {
      const url = new URL(fileUrl);
      if (!url.hostname.includes('cloudinary.com')) return null;

      const parts = url.pathname.split('/');
      const uploadIdx = parts.indexOf('upload');
      if (uploadIdx === -1 || uploadIdx >= parts.length - 1) return null;

      const resourceType = parts[uploadIdx - 1] as 'raw' | 'image';
      if (resourceType !== 'raw' && resourceType !== 'image') return null;

      let publicIdParts = parts.slice(uploadIdx + 1);
      while (
        publicIdParts.length > 0 &&
        (/^v\d+$/.test(publicIdParts[0]) || /^s--/.test(publicIdParts[0]))
      ) {
        publicIdParts = publicIdParts.slice(1);
      }

      const publicIdWithExt = publicIdParts.join('/');
      if (!publicIdWithExt) return null;

      const dot = publicIdWithExt.lastIndexOf('.');
      const format = dot > -1 ? publicIdWithExt.slice(dot + 1) : '';
      // private_download_url cần public_id KHÔNG có đuôi .pdf/.png
      const publicId =
        dot > -1 ? publicIdWithExt.slice(0, dot) : publicIdWithExt;

      return { publicId, format, resourceType };
    } catch {
      return null;
    }
  }

  // Hàm upload hình ảnh từ buffer (dùng Multer)
  async uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('>>> [BACKEND] Đang upload ảnh lên Cloudinary...');
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  // Hàm upload nhiều file cùng lúc (ảnh hoặc PDF)
  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }
}
