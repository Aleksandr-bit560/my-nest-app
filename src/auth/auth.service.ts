import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

type AuthenticatedUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['roles'],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: AuthenticatedUser) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles?.map((role) => role.name) || [],
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const { username, email, password } = userData;

    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userRole = await this.rolesRepository.findOne({
      where: { name: 'user' },
    });

    if (!userRole) {
      this.logger.log('Role "user" not found, creating it...');
      userRole = this.rolesRepository.create({ name: 'user' });
      userRole = await this.rolesRepository.save(userRole);
      this.logger.log(`Role "user" created with id: ${userRole.id}`);
    }

    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      roles: [userRole],
    });

    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`User ${username} registered with role: ${userRole.name}`);

    return savedUser;
  }
}
