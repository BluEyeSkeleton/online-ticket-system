// Imports

const fs = require("fs");
const path = require("path");

const { GatewayIntentBits } = require("discord.js");
// const {getVoiceConnection,createAudioResource} = require('@discordjs/voice');
const { Collection } = require("@discordjs/collection");

const noVal = require("../noVal");
// const RNG = require('./RNG');

/**
 * Utility class for configuring StepOneTwo Discord bot.
 */
class DiscordBot {
  /**
   * Options for StepOneTwo Discord bot client.
   */
  static clientOptions = {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
    ],
  };

  /**
   * Loads commands and assigns event listeners.
   * @param {Client} client Discord client to be configured.
   * @param {string} commandsPath Path to folder containing command files.
   * @param {Function} callback Callback after configuration finishes.
   */
  static configClient(client, commandsPath, callback) {
    // Collection of command name corresponding to its function
    client.commands = new Collection();
    const filenames = fs
      .readdirSync(commandsPath)
      .filter((filename) => filename.endsWith(".js"));

    for (const filename of filenames) {
      const filePath = path.join(commandsPath, filename);
      const command = require(filePath);
      client.commands.set(command.data.name, command);
      console.log(`Command loaded: ${filename}`);
    }

    // Once client is ready
    client.once("ready", () => {
      console.log("StepOneTwo bot is ready.");
    });

    // Event handler when a Discord interaction is created
    client.on("interactionCreate", async (interaction) => {
      // Make sure only ChatInputCommandInteraction is handled
      if (!interaction.isChatInputCommand()) return;

      const command = client.commands.get(interaction.commandName);
      if (noVal(command)) return; // Ignore non-existent command

      console.log(
        `${interaction.user.username} (${interaction.user.id}) ` +
          `used command ${interaction.commandName}`
      );
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.user.send({
          content: "There was an error while executing this command!",
          ephemeral: true,
        }); // Expandable
        await client.users.cache
          .get(process.env.USER_NM69)
          .send(`\`\`\`${String(error)}\`\`\``);
      }
    });

    // Event handler when a change in voice state occurs
    /*
    client.on('voiceStateUpdate', async (oldState, newState) => {
      // Ignore if the member involved is StepOneTwo bot
      if (newState.id === process.env.USER_STEP12) return;

      // Ignore voice state changes that don't involve channel changes
      if (oldState.channelId === newState.channelId) return;

      // Ignore if StepOneTwo bot is not in a voice channel
      const conn = getVoiceConnection(newState.guild.id);
      if (noVal(conn)) return;

      // Greet member who enters the voice channel
      if (newState.channelId === conn.joinConfig.channelId) {
        const filepath = util.audio.getPath(RNG.item([
          'aud_enter_vc.mp3',
          'aud_enter_vc_v2.mp3',
          'aud_enter_vc_v3.mp3',
          'aud_enter_vc_v4.mp3',
        ])); // RNG pick from these 4 files
        const player = util.voice.getAudioPlayer(conn.joinConfig.channelId);
        const resource = createAudioResource(util.audio.concat(
            util.audio.fromTTS(newState.member.displayName),
            util.audio.fromURL(filepath),
        ));

        console.log(`${newState.member.displayName} (${newState.member.id}) ` +
        'has entered voice channel ' +
        `#${newState.channel.name} (${newState.channelId})`);
        conn.subscribe(player);
        player.play(resource);

        // Update listening map if necessary
        if (util.voice.getListening().has(newState.guild.id)) {
          util.voice.addListening(newState.guild.id, newState.member);
        }
      }

      if (oldState.channelId === conn.joinConfig.channelId &&
      newState.channelId === null) {
        // Bid farewell to member who leaves the voice channel
        const player = util.voice.getAudioPlayer(conn.joinConfig.channelId);
        const resource = createAudioResource(
            util.audio.fromTTS(oldState.member.displayName +
            ' has left the voice channel'),
        );

        console.log(`${oldState.member.displayName} (${oldState.member.id}) ` +
        'has left voice channel ' +
        `#${oldState.channel.name} (${oldState.channelId})`);
        conn.subscribe(player);
        player.play(resource);

        // Update listening map if necessary
        if (util.voice.getListening().has(oldState.guild.id)) {
          util.voice.removeListening(oldState.guild.id, oldState.member);
        }
      } else if (oldState.channelId === conn.joinConfig.channelId &&
      newState.channelId === newState.guild.afkChannelId) {
        // Announce that a member is AFK
        const filepath = util.audio.getPath('aud_afk.mp3');
        const player = util.voice.getAudioPlayer(conn.joinConfig.channelId);
        const resource = createAudioResource(util.audio.concat(
            util.audio.fromTTS(newState.member.displayName),
            util.audio.fromURL(filepath),
        ));

        console.log(`${oldState.member.displayName} (${oldState.member.id}) ` +
      'has gone AFK ' +
      `from voice channel #${oldState.channel.name} (${oldState.channelId})`);
        conn.subscribe(player);
        player.play(resource);

        // Update listening map if necessary
        if (util.voice.getListening().has(oldState.guild.id)) {
          util.voice.removeListening(oldState.guild.id, oldState.member);
        }
      }
    });
    */
    callback(client);
  }
}

module.exports = DiscordBot;
