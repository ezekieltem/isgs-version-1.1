const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection, MessageEmbed, Client, Intents, discord, Message } = require("discord.js")
const noblox = require('noblox.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roles')
        .setDMPermission(false)
		.setDescription('Manages the ISGS related roles for yourself in this server!')
		.addBooleanOption(option =>
			option.setName('secrole')
				.setDescription('The security role in this server')
				.setRequired(false),
		)
		.addBooleanOption(option =>
			option.setName('pingrole')
				.setDescription('The training notification role in this server')
				.setRequired(false),
		)
		.addBooleanOption(option =>
			option.setName('patrolrole')
				.setDescription('The patrol notification role in this server')
				.setRequired(false),
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
		db.ref('main-api/verify-api/links').once('value', (snapshot) => {
			if (typeof (snapshot.val()[interaction.user.id]) !== typeof (abc)) {
				noblox.getRankInGroup(901313, parseInt(snapshot.val()[interaction.user.id])).then((rankNumber) => {
					if (rankNumber === 0) {
						interaction.reply({
							embeds: [
								new MessageEmbed()
									.setTitle('/roles')
									.setDescription(`:no_entry: It appears as if you are not in IS! If you believe this is an issue please try \`/verify\` again!\n If that doesn't work please contact \`@ezekieltem#3012\`!`)
							],
							ephemeral: true
						})
					} else {
						const linked = options.getBoolean('secrole')
						const ping = options.getBoolean('pingrole') || false
						const patrol = options.getBoolean('patrolrole') || false

						const guild = interaction.guild

						db.ref(`main-api/guild-api/setup/${guild.id}`).once('value', (snapshot) => {
							if (snapshot.hasChildren() === false || snapshot.exists() === false || snapshot.val() === null) {
								interaction.reply({
									embeds: [
										new MessageEmbed()
											.setTitle(`Role failure in \`${guild.name}\``)
											.addField('Reason', `No guild database`)
											.setFooter({ text: `Developed by @ezekieltem#3012. Main Server: https://discord.gg/uBw7CCTA8h` })

									],
									ephemeral: true
								})
								return guild.members.cache.get(guild.ownerId).send(
									{
										embeds: [
											new MessageEmbed()
												.setTitle(`Role failure in \`${guild.name}\``)
												.addField('Short Reason', `No guild database`)
												.addField(`Detailed Reason`, `The ISGS database for your server \`${guild.name}\` doesn't exist!\nPlease run the \`/setup\` command!\nIf the issue persists please contact \`@ezekieltem#3012\``)
												.setFooter({ text: `Developed by @ezekieltem#3012. Main Server: https://discord.gg/uBw7CCTA8h` })

										]
									})
							}

							guild.roles.fetch(snapshot.val().roles.linkedRoleId).then((linkedRole) => {
								guild.roles.fetch(snapshot.val().roles.pingRoleId).then((pingRole) => {
									guild.roles.fetch(snapshot.val().roles.patrolRoleId).then((patrolRole) => {
										const respondEmbed = new MessageEmbed()
											.setTitle('/roles')
										if (linkedRole) {
											if (linked === true) {
												respondEmbed.addField('Security Role', `Added <@&${snapshot.val().roles.linkedRoleId}>`)
												interaction.member.roles.add(linkedRole, 'Adding Security Role')
											} else {
												respondEmbed.addField('Security Role', `Removed <@&${snapshot.val().roles.linkedRoleId}>`)
												interaction.member.roles.remove(linkedRole, 'Removing Security Role')
											}
										} else {
											respondEmbed.addField('Security Role', 'There is no security role for this server!')
										}
										if (pingRole) {
											if (ping === true) {
												respondEmbed.addField('Ping Role', `Added <@&${snapshot.val().roles.pingRoleId}>`)
												interaction.member.roles.add(pingRole, 'Adding Training Ping Role')
											} else {
												respondEmbed.addField('Ping Role', `Removed <@&${snapshot.val().roles.pingRoleId}>`)
												interaction.member.roles.remove(pingRole, 'Removing Training Ping Role')
											}
										} else {
											respondEmbed.addField('Ping Role', 'There is no Ping role for this server!')
										}
										if (patrolRole) {
											if (patrol === true) {
												respondEmbed.addField('Patrol Role', `Added <@&${snapshot.val().roles.patrolRoleId}>`)
												interaction.member.roles.add(patrolRole, 'Adding Patrol Ping Role')
											} else {
												respondEmbed.addField('Patrol Role', `Removed <@&${snapshot.val().roles.patrolRoleId}>`)
												interaction.member.roles.remove(patrolRole, 'Removing Patrol Ping Role')
											}
										} else {
											respondEmbed.addField('Patrol Role', 'There is no patrol role for this server!')
										}
										if (interaction.replied || interaction.deferred) {
											interaction.editReply({
												embeds: [respondEmbed],
												ephemeral: true
											})
										} else {
											interaction.reply({
												embeds: [respondEmbed],
												ephemeral: true
											})
										}

									}).catch((error) => {
										client.users.cache.get('364569809146347520').send({ content: `Failed to get role.\nError:\n${error.message}`, ephemeral: true })
									})
								}).catch((error) => {
									client.users.cache.get('364569809146347520').send({ content: `Failed to get role.\nError:\n${error.message}`, ephemeral: true })
								})
							}).catch((error) => {
								client.users.cache.get('364569809146347520').send({ content: `Failed to get role.\nError:\n${error.message}`, ephemeral: true })
							})
						})
					}
				})
			} else {
				interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle('/roles')
							.setDescription(`:warning: You don't appear to be verified with ISGS! Please run \`/verify\`!\nIf you are sure this is an error please contact \`@ezekieltem#3012\`!`)
					],
					ephemeral: true
				})
			}
		})
	},
};