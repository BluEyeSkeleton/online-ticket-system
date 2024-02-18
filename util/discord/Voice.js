// Imports

const {
  joinVoiceChannel,
  createAudioResource,
  getVoiceConnection,
  createAudioPlayer,
  NoSubscriberBehavior,
} = require("@discordjs/voice");

const noVal = require("../noVal");

/**
 * Utility class for Discord voice
 */
class Voice {
  /**
   * Returns default JoinVoiceChannelOptions for the voice channel given.
   * @param {VoiceChannel} channel
   * @return {JoinVoiceChannelOptions}
   */
  static getDefaultJoinVoiceChannelOptions(channel) {
    return {
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    };
  }

  /**
   * Joins or moves to another voice channel.
   * @param {VoiceChannel} channel Voice channel to be joined.
   * @return {VoiceConnection} Voice connection of the corresponding guild.
   */
  static join(channel) {
    const conn = getVoiceConnection(channel.guildId);
    // If not in a voice channel yet
    if (noVal(conn)) {
      return joinVoiceChannel(this.getDefaultJoinVoiceChannelOptions(channel));
    }
    // If attempting to join the same voice channel
    if (conn.joinConfig.channelId === channel.id) return conn;
    // Moves to another voice channel
    conn.destroy();
    return joinVoiceChannel(this.getDefaultJoinVoiceChannelOptions(channel));
  }

  /**
   * Plays audio to the target voice connection(s).
   * @param {internal.Readable} stream Readable stream.
   * @param {...VoiceConnection} conns VoiceConnection to play audio to.
   */
  static play(stream, ...conns) {
    const audioResource = createAudioResource(stream);
    const audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });
    for (const conn of conns) {
      conn.subscribe(audioPlayer);
    }
    audioPlayer.play(audioResource);
  }
}

module.exports = Voice;
