import { RolesCatalog } from './user-role.catalog';

export interface UserContext {
  sub: string;
  userId: string;
  role: RolesCatalog;
  email: string;
}
