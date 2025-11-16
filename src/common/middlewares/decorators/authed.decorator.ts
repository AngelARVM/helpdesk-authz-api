import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const Authed = () => {
  return applyDecorators(UseGuards(AuthGuard('jwt')));
};
