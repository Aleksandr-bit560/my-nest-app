import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesSeed } from './roles.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesSeed],
  exports: [TypeOrmModule],
})
export class RolesModule {}
