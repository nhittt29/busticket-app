
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');
    if (cloudinaryUrl) {
      // Regex to parse: cloudinary://<api_key>:<api_secret>@<cloud_name>
      const matches = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^]+)$/);
      if (matches) {
        cloudinary.config({
          cloud_name: matches[3],
          api_key: matches[1],
          api_secret: matches[2],
        });
      } else {
        this.logger.error('Invalid CLOUDINARY_URL format');
      }
    } else {
      this.logger.error('CLOUDINARY_URL not found in .env');
    }
  }

  async uploadAvatar(file: Express.Multer.File, userId: number): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'bus-tickets/avatars',
          public_id: `avatar_user_${userId}`,
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' }, // Optimize for avatar
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(`Image upload failed: ${error.message}`));
          if (!result) return reject(new BadRequestException('Image upload failed - No result'));
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadReviewImage(file: Express.Multer.File): Promise<string> {
    if (!file) throw new BadRequestException('File is required');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'bus-tickets/reviews',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }], // Optimize only
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(`Image upload failed: ${error.message}`));
          if (!result) return reject(new BadRequestException('Image upload failed - No result'));
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
