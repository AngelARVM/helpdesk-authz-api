import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from './roles.decorator';
import { RolesCatalog } from '../../types/user-role.catalog';
import { RolesGuard } from '../guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export const Authed = (roles?: RolesCatalog[]) => {
  return applyDecorators(
    ApiBearerAuth(),
    SetMetadata(ROLES_KEY, roles || []),
    UseGuards(AuthGuard('jwt'), RolesGuard),
  );
};
