import { SetMetadata } from '@nestjs/common';

export const Authorization = (
  ...roles: Array<'admin' | 'user' | 'volunteer' | '*'>
) => SetMetadata('roles', roles);
