const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection, MessageEmbed, Client, Intents, discord, Message, MessageButton, MessageSelectMenu } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dmowners')
		.setDescription('Sends a Global Message to all server owners with dms enabled!')
        .setDMPermission(true)
		.addStringOption(option =>
			option.setName('title')
				.setDescription('The title of the global embed.')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('description')
				.setDescription('The description of the global embed.')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('fields')
				.setDescription('The fields of the global embed. (Example: Title,Value|Title2,Value2)')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('footer')
				.setDescription('The footer of the global embed.')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('author')
				.setDescription('The author of the global embed.')
				.setRequired(false)
		),

		loadData: {
			// Is command restricted to set guilds?
			lockedToGuilds: false,
			guildIds: []
		},
	async run(interaction, client, userVars) {
        let options = interaction.options
		let db = userVars[0]
		let admin = userVars[1]
		let noblox = userVars[2]
		if (interaction.user.id !== '364569809146347520') {
			let ReplyEmbed = new MessageEmbed()
				.setTitle('/setup')
				.setColor("RED")
				.addField(`:no_entry: Unauthorized :no_entry:`, `You are not authorized to run /dmowners!`)
			interaction.reply({
				embeds: [ReplyEmbed],
				ephemeral: true
			})
		} else {
			let ownerssent = {}
			let i = 1
			client.guilds.cache.forEach(guild => {
				db.ref(`main-api/guild-api/setup/${guild.id}`).once('value', (snapshot2) => {
					const globalShoutEmbed = new MessageEmbed()
						.setTitle(options.getString('title'))

					if (options.getString('description')) globalShoutEmbed.setDescription(options.getString('description'))
					if (options.getString('fields')) {
						const fieldStringArrays = options.getString('fields').split('|')
						fieldStringArrays.forEach((string) => {
							const namevalue = string.split(',')
							globalShoutEmbed.addField(namevalue[0], namevalue[1])
						})
					}
					if (options.getString('footer')) globalShoutEmbed.setFooter({ text: options.getString('footer') })
					if (options.getString('author')) globalShoutEmbed.setAuthor({ name: options.getString('author') })
					const localShoutEmbed = globalShoutEmbed
					const shoutchannel = guild.members.cache.get(guild.ownerId)
					let ownerIsIn = false
					for (const ownerNum in ownerssent) {
						if (ownerssent[ownerNum] === shoutchannel.user.tag) ownerIsIn = true
					}
					if (!ownerIsIn) {
						ownerssent[`Owner${i}`] = shoutchannel.user.tag
						shoutchannel.send({
							content: `Automated message from ${interaction.user.tag}:`,
							embeds: [localShoutEmbed]
						}).catch(error => {
							console.log(`Failed to DM ${guild.members.cache.get(guild.ownerId).user.tag}`)
							console.error(error)
						})
						i += 1
					}
				})
			})
			interaction.reply({
				content: 'Owners dmed!',
				ephemeral: true
			})
		}
	},
};