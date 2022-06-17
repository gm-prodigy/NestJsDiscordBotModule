import { ArgNum, ArgRange, Param } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';
import { IsAlphanumeric, IsPhoneNumber, IsEmail, Contains } from 'class-validator';
export class ManageDevs {
  @ArgNum(() => ({ position: 0 }))
  @Transform(({ value }) => value.toUpperCase())
  @IsAlphanumeric()
  @Param({
    name: 'command',
    description:
      'Add or remove a dev. Available commands: add, remove',
    required: true,
  })
  command: string;

  @ArgNum(() => ({ position: 1 }))
  @IsEmail()
  @Param({
    name: 'email',
    description:
      'The email of the dev to add or remove.',
    required: true,
  })
  email: string;
}
