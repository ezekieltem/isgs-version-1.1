const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong as well as the bot\'s ping'),

		loadData: {
			// Is command restricted to set guilds?
			lockedToGuilds: false,
			guildIds: []
		},
	async run(interaction,client,userVars) {
        if (!interaction) return
        let options = interaction.options
		interaction.reply(`Pong\nPing: ${client.ws.ping} ms.`);
		const msg = await interaction.fetchReply()

		interaction.editReply(
			`Pong\nPing: ${client.ws.ping} ms.\nMessage Ping: ${
				msg.createdTimestamp - interaction.createdTimestamp
			}`
		);
	},
};