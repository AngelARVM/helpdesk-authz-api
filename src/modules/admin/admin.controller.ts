import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Authed } from '../../common/middlewares/decorators/authed.decorator';
import { RolesCatalog } from '../../common/types/user-role.catalog';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Authed([RolesCatalog.ADMIN])
  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
