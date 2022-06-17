import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';

import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import { defaultThrottleConfig } from 'rxjs/internal/operators/throttle';
import { Server } from 'src/entity/server.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { ManageDevs } from '../dto/manageDevs.dto';
import { ServerManage } from '../dto/serverManage.dto';

import { ServerService } from "./../../modules/server/server.service";

@Command({
  name: 'server',
  description: 'Adds, removes, or edits a server',
})
@UsePipes(TransformPipe, ValidationPipe)

export class ServerManageCommand implements DiscordTransformedCommand<ServerManage> {
    constructor(@InjectRepository(Server) private serverRepository: Repository<Server>) {}
  async handler(
    @Payload() dto: ServerManage,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<string> {

    const serverExists: Server | null = await this.serverRepository.findOne({ where: { serverIp: dto.serverIp }});
    
    switch (dto.command) {
        
        case 'ADD':         
            if (!serverExists) {
                const newServer = await this.serverRepository.create({ ...dto});
                await this.serverRepository.save(newServer);

                const ipDetails = await axios.get('http://ip-api.com/json/' + dto.serverIp);
                if(ipDetails.data.status === 'success') {
                    newServer.countryCode = ipDetails.data.countryCode;
                    newServer.country = ipDetails.data.country;
                    newServer.city = ipDetails.data.city;
                    newServer.region = ipDetails.data.region;
                    newServer.latitude = ipDetails.data.lat;
                    newServer.longitude = ipDetails.data.lon;
                    newServer.name = ipDetails.data.city;
                    await this.serverRepository.save(newServer);
                }

                if(dto.active) {
                    newServer.active = true;
                    await this.serverRepository.save(newServer);
                }

                return 'Server added successfully';
            }
            return 'Server already exists!';
        case 'REMOVE':
            if (serverExists) {
                await this.serverRepository.delete(serverExists.id);
                return 'Server removed successfully';
            }
            return 'Server does not exist!';
        case 'EDIT':
            if (serverExists) {
                await this.serverRepository.update(serverExists.id, {...dto});
                return 'Server edited successfully';
            }
            return 'Server does not exist!';
        case 'ENABLE':
            if (serverExists) {
                if(serverExists.active) {
                    return 'Server is already enabled!';
                }

                serverExists.active = true;
                await this.serverRepository.save(serverExists);
                return 'Server enabled successfully!';
            }
            return 'Server does not exist!';
        case 'DISABLE':
            if (serverExists) {
                if(!serverExists.active) {
                    return 'Server is already disabled!';
                }

                serverExists.active = false;
                await this.serverRepository.save(serverExists);
                return 'Server disabled successfully!';
            }
            return 'Server does not exist!';
        case 'VIEW':
            if (serverExists) {
            const embed = new MessageEmbed({
                title: 'Server Details',
                description: 'Server Details',
                fields: [
                    { name: 'Server IP', value: serverExists.serverIp, inline: true },
                    { name: 'Server Name', value: serverExists.name, inline: true  },
                    { name: 'Server Country', value: serverExists.country, inline: true  },
                    { name: 'Server City', value: serverExists.city, inline: true  },
                    { name: 'Server Region', value: serverExists.region, inline: true  },
                    { name: 'Server Latitude', value: serverExists.latitude, inline: true  },
                    { name: 'Server Longitude', value: serverExists.longitude, inline: true  },
                    { name: 'Server Country Code', value: serverExists.countryCode, inline: true  },
                    { name: 'Server Active', value: serverExists.active ? 'Yes' : 'No', inline: true  },
                ],
              });

              interaction.reply({ embeds: [embed], fetchReply: false });
              return
            }
            return 'Server does not exist!';
        default:
            return 'Invalid command';
    }
  }
}
