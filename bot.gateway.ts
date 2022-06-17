import { PrefixCommandTransformPipe } from '@discord-nestjs/common';
import { DiscordModule, InjectDiscordClient, Once, Payload, PrefixCommand, TransformedCommandExecutionContext, UseCollectors, UsePipes } from '@discord-nestjs/core';
import { Injectable, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client, CommandInteraction, Message, MessageEmbed } from 'discord.js';
import { Server } from 'src/entity/server.entity';
import { User } from 'src/entity/user.entity';
import { ServerService } from 'src/modules/server/server.service';
import { ManageDevCommand } from './commands/manageDevs.command';
import { ServerManageCommand } from './commands/serverManage.command';



@Module({
  imports: [
    ConfigModule,
    DiscordModule.forFeature(),
    TypeOrmModule.forFeature([User, Server, ServerService]),
  ],
  providers: [ManageDevCommand, ServerManageCommand],
})


@Injectable()
export class BotGateway {
  private readonly logger = new Logger("EnRagedBot");
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  async onReady() {
    //check if in dev mode
    if(process.env.ENV_DEV) {
      this.logger.log('Bot is in development mode');
      this.client.user.setActivity('testing development', { type: 'WATCHING' });
    }

    this.logger.log(`Bot ${this.client.user.tag} has started!`);
  }

  @PrefixCommand('ping')
  @UsePipes(PrefixCommandTransformPipe)
  async onMessage( interaction: CommandInteraction): Promise<{}> {
    
    const ping = this.client.ws.ping;
    const embed = new MessageEmbed({
      title: 'Pong! 🏓',

      fields: [
        {
          name: 'Latency',
          //value: ping + 'ms',
          value: `
          \`\`\`css
[${ping}ms]\`\`\``,
          inline: true,
        },
        {
          name: 'Uptime',
          value: `${Math.floor(process.uptime() / 60)} mins`,
          inline: true,
        },
        {
          name: 'Memory Usage',
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          inline: true,
        },
        {
          name: 'CPU Usage',
          value: `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`,
          inline: true,
        }
      ],
      color: 0x00ff00,
      //Set the footer text
      footer: {
        text: `${new Date().toLocaleString()} | ${this.client.user.tag}`,
        //icon_url: '',
      },
    });

      return({ embeds: [embed], fetchReply: false });
  }
  
}
