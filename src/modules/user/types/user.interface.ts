import { RolesCatalog } from '@/common/types/user-role.catalog';

export interface IUser {
  id: string;

  email: string;

  role: RolesCatalog;

  createdAt: Date;
}
