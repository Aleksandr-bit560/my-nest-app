import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesSeed implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    const roles = ['user', 'admin'];

    for (const roleName of roles) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: roleName },
      });
      if (!existingRole) {
        await this.rolesRepository.save({ name: roleName });
      }
    }
  }
}
