require('dotenv').config();
import { Client, CommandInteraction } from 'discord.js';
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

const handleOnboard = async (
  // @ts-ignore
  leon: Client,
  // @ts-ignore
  larry: Client,
  interaction: CommandInteraction
) => {
  const userId = interaction.options.data[0]?.user?.id;

  if (!userId) {
    await interaction.reply(`Couldn't find that user`);
    return;
  }

  const adminRoleId = '953406880095555585';
  // @ts-ignore
  const admin = interaction.member?.roles.cache.get(adminRoleId);

  if (!admin) {
    await interaction.reply('This MF does NOT have permission to onboard');
  }

  await interaction.reply(`Fine! I'll onboard <@${userId}>`);
  await onboard(leon, larry, userId);
};

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

      switch (interaction.commandName) {
        case 'onboard': {
          await handleOnboard(leon, larry, interaction);
          break;
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
};

export default initCommands;
