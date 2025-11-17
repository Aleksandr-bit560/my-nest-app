import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthenticatedRequest extends Request {
  user: Omit<User, 'password'>;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: RegisterData) {
    return this.authService.register(userData);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }
}
