
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    Req,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../services/upload.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';

@Controller('upload')
@UseGuards(FirebaseAuthGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        const userId = req.user?.id;

        if (!userId) {
            throw new BadRequestException('User ID not found');
        }

        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Basic validation
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            throw new BadRequestException('Only image files are allowed!');
        }

        const url = await this.uploadService.uploadAvatar(file, userId);
        return { url };
    }

    @Post('review')
    @UseInterceptors(FileInterceptor('file'))
    async uploadReviewImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file uploaded');
        const url = await this.uploadService.uploadReviewImage(file);
        return { url };
    }
}
