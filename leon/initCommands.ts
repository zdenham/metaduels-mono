require('dotenv').config();
import { Client } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import onboard from './flows/onboard';

const onboardCommand = new SlashCommandBuilder()
  .setName('onboard')
  .setDescription('onboard a given user!')
  .addUserOption((option) =>
    option.setName('user').setDescription('The user').setRequired(true)
  );

const commands = [onboardCommand.toJSON()];

const rest = new REST({ version: '9' }).setToken(
  process.env.LEON_BOT_TOKEN || ''
);

const initCommands = async (leon: Client, larry: Client) => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APPLICATION_CLIENT_ID || '',
        process.env.DISCORD_GUILD_ID || ''
      ),
      {
        body: commands,
      }
    );

    console.log('Successfully reloaded application (/) commands.');

    // wait for commands to happen and react!!
    leon.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      if (interaction.commandName === 'onboard') {
        const userId = interaction.options.data[0]?.user?.id;
        if (!userId) {
          await interaction.reply(`Couldn't find that user`);
          return;
        }

        await interaction.reply(`Fine! I'll onboard <@${userId}>`);

        await onboard(leon, larry, userId);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

export default initCommands;
