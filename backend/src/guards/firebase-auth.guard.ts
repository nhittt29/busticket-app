
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { auth } from '../config/firebase';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    private logger = new Logger(FirebaseAuthGuard.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token is missing');
        }

        try {
            const decodedToken = await auth.verifyIdToken(token);
            request.user = decodedToken; // Attach Firebase user

            // Fetch DB user using UID
            const user = await this.userRepository.findOne({ where: { uid: decodedToken.uid } });

            if (user) {
                request.user.dbUser = user;
                request.user.id = user.id;
            } else {
                throw new UnauthorizedException('User not found in database');
            }

            return true;
        } catch (error) {
            this.logger.error(`Auth failed: ${error.message}`);
            throw new UnauthorizedException('Invalid token or expired');
        }
    }
}
