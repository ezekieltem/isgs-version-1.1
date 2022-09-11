const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection, MessageEmbed, Client, Intents, discord, Message, MessageButton, MessageSelectMenu } = require("discord.js")
const noblox = require('noblox.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('globalmessage')
		.setDescription('Sends a Global Message to all servers with global messages enabled!')
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
		)
		.addBooleanOption(option =>
			option.setName('override')
				.setDescription('Override global disabled settings (Sends in group shout channel if it exists)')
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
				.addField(`:no_entry: Unauthorized :no_entry:`, `You are not authorized to run /globalmessage!`)
			interaction.reply({
				embeds: [ReplyEmbed],
				ephemeral: true
			})
		} else {
			client.guilds.cache.forEach(guild => {
				db.ref(`main-api/guild-api/setup/${guild.id}`).once('value', (snapshot2) => {
					if (snapshot2.hasChildren() === false || snapshot2.exists() === false || snapshot2.val() === null) {
						guild.members.cache.get(guild.ownerId).send(
							{
								embeds: [
									new MessageEmbed()
										.setTitle(`Global Message failure in \`${guild.name}\``)
										.addField('Short Reason', `No guid database`)
										.addField(`Detailed Reason`, `The ISGS database for your server \`${guild.name}\` doesn't exist!\nPlease run the \`/setup\` command!\nIf the issue persists please contact \`@ezekieltem#3012\``)
										.setFooter({ text: `Developed by @ezekieltem#3012. Main Server: https://discord.gg/uBw7CCTA8h` })

								]
							}).catch(error => {
								console.log(`Failed to DM ${guild.members.cache.get(guild.ownerId).user.tag}`)
								console.error(error)
							})
					} else {
						const globalShoutEmbed = new MessageEmbed()
							.setTitle(options.getString('title'))
						let description = options.getString('description') || null
						if (description) {
							let finaldescription = description
							while (description.includes('\\n')) {
								finaldescription = finaldescription.replace('\\n', '\n')
							}
							globalShoutEmbed.setDescription(finaldescription)
						}
						if (options.getString('fields')) {
							const fieldStringArrays = options.getString('fields').split('|')
							fieldStringArrays.forEach((string) => {
								const namevalue = string.split(',')
								globalShoutEmbed.addField(namevalue[0], namevalue[1])
							})
						}
						const footerText = options.getString('footer') || 'no footer text set'
						if (options.getString('footer')) globalShoutEmbed.setFooter({ text: footerText })
						if (options.getString('author')) globalShoutEmbed.setAuthor({ name: options.getString('author') })
						if (snapshot2.val().channels['global-messages'].active === true || options.getBoolean('override') === true) {
							const localShoutEmbed = globalShoutEmbed
							if (snapshot2.val().channels['global-messages'].active === false && options.getBoolean('override') === true) localShoutEmbed.setFooter({ text: `${footerText} | Global Messages setting overrode` })
							if (guild.channels.cache.has(snapshot2.val().channels['global-messages'].id)) {
								const shoutchannel = guild.channels.cache.get(snapshot2.val().channels['global-messages'].id)
								shoutchannel.send({
									content: 'Global Message:',
									embeds: [localShoutEmbed]
								})
							} else if (guild.channels.cache.has(snapshot2.val().channels['shouts'].id)) {
								const shoutchannel = guild.channels.cache.get(snapshot2.val().channels['shouts'].id)
								shoutchannel.send({
									content: 'Global Message:',
									embeds: [localShoutEmbed]
								})
							}
						}
					}
				})
			})
			interaction.reply({
				content: 'Global messages sent!',
				ephemeral: true
			})
		}
	},
};