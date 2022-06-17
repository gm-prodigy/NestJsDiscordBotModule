import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';

import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';
import { defaultThrottleConfig } from 'rxjs/internal/operators/throttle';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { ManageDevs } from '../dto/manageDevs.dto';



@Command({
  name: 'dev',
  description: 'Adds or removes a dev',
  defaultPermission: true,
  type: ApplicationCommandTypes.CHAT_INPUT
})
@UsePipes(TransformPipe, ValidationPipe)

export class ManageDevCommand implements DiscordTransformedCommand<ManageDevs> {
    constructor(@InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService) {}
  async handler(
    @Payload() dto: ManageDevs,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<string> {

    if(dto.command != 'ADD' && dto.command != 'REMOVE'){
        return 'Invalid command, please use add or remove';
    }

    const response = await axios.get(`${this.configService.get<string>('websiteBaseURL')}/api/accounts/user/?email=${dto.email}&apikey=${process.env.clientexec}`);
    if(response.data.email != dto.email )
    {
        return 'User does not exist';
    }
    
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if(dto.command == 'ADD'){

      if(!user){
        let createUser = this.userRepository.create({ email: response.data.email, userid: response.data.userid, dev: true });
        await this.userRepository.save(createUser);
        return 'User added to Dev list';
      }

      if (user.dev) {
        return 'User is already a dev!';
      }

      await this.userRepository.update({email: dto.email }, {dev: true});
      return 'User added to Dev list';
    }
    
    if(dto.command == 'REMOVE'){

      if(!user){
        return 'User is already not a dev!';
      }

      if (!user.dev) {
        return 'User is already not a dev!';
      }
      
      await this.userRepository.update({email: dto.email }, {dev: false});
      return 'User removed from Dev list';
    }
  }
}
