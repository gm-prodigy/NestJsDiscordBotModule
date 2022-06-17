import { ArgNum, ArgRange, Param } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';
import { IsAlphanumeric, IsPhoneNumber, IsEmail, Contains, IsBoolean } from 'class-validator';
export class ServerManage {
  @ArgNum(() => ({ position: 0 }))
  @Transform(({ value }) => value.toUpperCase())
  @IsAlphanumeric()
  @Param({
    name: 'command',
    description:
      'Available commands: add, remove, edit, enable, disable, view',
    required: true,
  })
  command: string;

  @ArgNum(() => ({ position: 1 }))
  @Param({
    name: 'ip',
    description:
      'The IP of the server to add or remove.',
    required: true,
  })
  serverIp: string;

  @ArgNum(() => ({ position: 2 }))
  @Param({
    name: 'active',
    description:
      'Change wheather the server is active or not.',
    required: false,
  })
  active: boolean;
}
