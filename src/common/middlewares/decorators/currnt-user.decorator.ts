/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      const logger = new Logger();
      logger.warn(
        'User is not present on request. Did you forget to add @Authed() decorator to parent method?',
      );
    }

    return user;
  },
);
