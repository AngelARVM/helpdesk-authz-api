import { SetMetadata } from '@nestjs/common';
import { RolesCatalog } from '@/common/types/user-role.catalog';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesCatalog[]) =>
  SetMetadata(ROLES_KEY, roles);
