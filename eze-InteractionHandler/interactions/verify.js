const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection, MessageEmbed, discord, MessageButton, MessageActionRow } = require("discord.js");
const { securityRules } = require('firebase-admin');
const noblox = require('noblox.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verify ownership of a roblox account!')
		.addIntegerOption(option =>
			option.setName('userid')
				.setDescription('The userid to attempt to verify ownership of!')
				.setMinValue(1)
				.setRequired(true)
		)
        .setDMPermission(true),

		loadData: {
			// Is command restricted to set guilds?
			lockedToGuilds: false,
			guildIds: []
		},
	async run(interaction, client, userVars) {
		let options = interaction.options
		if (options.getInteger('userid') > 18446744073709551615) return interaction.reply({
			content: 'This integer cannot exceed the 64bit Integer limit',
			ephemeral: true
		})
		let db = userVars[0]
		let admin = userVars[1]
		let noblox = userVars[2]
		const UserNamePromise = noblox.getUsernameFromId(options.getInteger('userid'))
		UserNamePromise.then(username => {
			let embed = new MessageEmbed()
				.setTitle('/verify')
				.setDescription(`Are you trying to link with the account \`${username}\``)
				.addField('Entered userid:', options.getInteger('userid').toString())
				.setFooter({ "text": "This prompt will cancel 5 minutes after the command!" })

			let buttonYes = new MessageButton()
				.setLabel('Yes')
				.setStyle('SUCCESS')
				.setCustomId('verify-CorrectAccount')

			let buttonNo = new MessageButton()
				.setLabel('No')
				.setStyle('DANGER')
				.setCustomId('verify-WrongAccount')

			let row = new MessageActionRow()
				.addComponents([buttonYes, buttonNo])

			interaction.reply({
				embeds: [embed],
				components: [row],
				ephemeral: true
			})
			setTimeout(() => {
				if (interaction.content !== ':white_check_mark: Account linked! Please remove the code as to not risk anyone getting the same code and claiming to be you!' && interaction.content !== ':white_check_mark: Account linked!') {
					interaction.editReply({
						content: ':no_entry: Verification process canceled.',
						embeds: [],
						components: [],
					})
					db.ref(`main-api/verify-api/inProgressGame/${options.getInteger('userid')}`).remove()
				}
			}, 300 * 1000)
		}).catch(errormsg => {
			console.error(errormsg)
			let embed = new MessageEmbed()
				.setTitle('/verify')
				.setDescription(`There is no user with the id \`${options.getInteger('userid').toString()}\``)

			interaction.reply({

				embeds: [embed],
				ephemeral: true
			})
		})
	},
	async runButton(interaction, customidTable, client, userVars) {
		let db = userVars[0]
		let admin = userVars[1]
		let noblox = userVars[2]
		if (!interaction.isButton) return
		// customidTable[0] is this command's name
		if (customidTable[1] == "CorrectAccount") {
			let intmsg = interaction.message
			let intmsgembed = intmsg.embeds[0]
			let intmsgembedfield = intmsgembed.fields[0]
			let userid = parseInt(intmsgembedfield.value)
			let UserNamePromise = noblox.getUsernameFromId(userid)
			UserNamePromise.then(username => {

				let embed = new MessageEmbed()
					.setTitle('/verify')
					.addField('Entered userid:', userid.toString())
					.addField('Linking with account:', `${username}`)
					.setFooter({ "text": "This prompt will cancel 5 minutes after the command!" })

				let buttonGame = new MessageButton()
					.setLabel('Game Verification')
					.setStyle('PRIMARY')
					.setCustomId('verify-GameVerify')

				let buttonCode = new MessageButton()
					.setLabel('Code Verification')
					.setStyle('SECONDARY')
					.setCustomId('verify-CodeVerify')

				let row = new MessageActionRow()
					.addComponents([buttonGame, buttonCode])

				interaction.update({

					embeds: [embed],
					components: [row],
					ephemeral: true
				})
			})
		} else if (customidTable[1] == "WrongAccount") {
			interaction.update({
				content: ':no_entry: Verification process canceled.',
				embeds: [],
				components: [],
			})
		} else if (customidTable[1] == "CodeVerify") {
			let verifyCode = null
			db.ref('main-api/verify-api/descCodes').once('value', (snapshot) => {
				const allCodes = snapshot.val()
				let i = 0
				for (const element in allCodes) {
					i += 1
				}
				let ranNum = Math.floor(Math.random() * i)
				if (ranNum === 0) ranNum += 1
				let selected = null
				let i2 = 0
				for (const element in allCodes) {
					i2 += 1
					if (i2 == ranNum) {
						selected = allCodes[element]
					}
				}
				verifyCode = selected
				let intmsg = interaction.message
				let intmsgembed = intmsg.embeds[0]
				let intmsgembedfield = intmsgembed.fields[0]
				let userid = parseInt(intmsgembedfield.value)
				let UserNamePromise = noblox.getUsernameFromId(userid)
				UserNamePromise.then(username => {

					let embed = new MessageEmbed()
						.setTitle('/verify')
						.addField('Entered userid:', userid.toString())
						.addField('Linking with account:', `${username}`)
						.addField(`Please put the following somewhere in your \`About Me\``, `\`${verifyCode}\``)
						.setFooter({ "text": "This prompt will cancel 5 minutes after the command!" })

					let buttonVerify = new MessageButton()
						.setLabel('Verify')
						.setStyle('SUCCESS')
						.setCustomId('verify-RunVerification-CodeVerify')

					let row = new MessageActionRow()
						.addComponents([buttonVerify])

					interaction.update({

						embeds: [embed],
						components: [row],
						ephemeral: true
					})
				})
			})
		} else if (customidTable[1] === "GameVerify") {
			let intmsg = interaction.message
			let intmsgembed = intmsg.embeds[0]
			let intmsgembedfield = intmsgembed.fields[0]
			let intmsgembedfield2 = intmsgembed.fields[1]
			let userid = parseInt(intmsgembedfield.value)
			let username = intmsgembedfield2.value

			const ranCode1 = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 4);

			const ranCode2 = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 4);

			const verifyCode = `${ranCode1}-${ranCode2}`

			db.ref(`main-api/verify-api/inProgressGame/${userid}`).set(
				JSON.parse(
					JSON.stringify({
						"code": `${ranCode1}-${ranCode2}`,
						"UId": `${interaction.user.id}`,
						"confirmed": false
					})
				)
			).then(() => {

				let embed = new MessageEmbed()
					.setTitle('/verify')
					.addField('Entered userid:', userid.toString())
					.addField('Linking with account:', `${username}`)
					.addField(`Please join the Verification game and enter this code:`, `${verifyCode}`)
					.setFooter({ "text": "This prompt will cancel 5 minutes after the command!" })

				let buttonVerify = new MessageButton()
					.setLabel('Verify')
					.setStyle('SUCCESS')
					.setCustomId('verify-RunVerification-GameVerify')

				let gameLink = new MessageButton()
					.setLabel('Verification Game')
					.setStyle('LINK')
					.setURL('https://www.roblox.com/games/9439947016/ISGS-Game-Verification')

				let row = new MessageActionRow()
					.addComponents([buttonVerify, gameLink])

				interaction.update({

					embeds: [embed],
					components: [row],
					ephemeral: true
				})
			})
		} else if (customidTable[1] === "RunVerification") {
			if (customidTable[2] === "CodeVerify") {
				db.ref('main-api/verify-api/descCodes').once('value', (snapshot) => {
					let intmsg = interaction.message
					let intmsgembed = intmsg.embeds[0]
					let intmsgembedfield = intmsgembed.fields[0]
					let userid = parseInt(intmsgembedfield.value)
					let codeembedfield = intmsgembed.fields[2]
					let code = codeembedfield.value.substring(1, codeembedfield.value.length - 1)
					let PlayerInfoPromise = noblox.getPlayerInfo(userid)
					PlayerInfoPromise.then(player => {
						if (player.blurb.includes(code)) {
							let embed = new MessageEmbed()
								.setTitle('/verify')
								.addField('Entered userid:', userid.toString())
								.addField('Linking with account:', `${player.username}`)
								.addField(`Please put the following somewhere in your \`About Me\``, `\`${code}\``)
								.setFooter({ "text": "This prompt will cancel 5 minutes after the command!" })

							let buttonVerify = new MessageButton()
								.setLabel('Verify')
								.setStyle('SUCCESS')
								.setCustomId('verify-RunVerification-CodeVerify')

							let row = new MessageActionRow()
								.addComponents([buttonVerify])

							db.ref(`main-api/verify-api/links/${interaction.user.id}`).set(userid)

							interaction.update({
								content: ':white_check_mark: Account linked! Please remove the code as to not risk anyone getting the same code and claiming to be you!',
								embeds: [],
								components: [],
								ephemeral: true
							})

						} else {

							let embed = new MessageEmbed()
								.setTitle('/verify')
								.addField('Entered userid:', userid.toString())
								.addField('Linking with account:', `${player.username}`)
								.addField(`Please put the following somewhere in your \`About Me\``, `\`${code}\``)
								.setFooter({ "text": "This prompt will cancel 5 minutes after the command!" })

							let buttonVerify = new MessageButton()
								.setLabel('Verify')
								.setStyle('SUCCESS')
								.setCustomId('verify-RunVerification-CodeVerify')

							let row = new MessageActionRow()
								.addComponents([buttonVerify])

							interaction.update({
								content: 'Hmm are you sure you added the code and saved it?',
								embeds: [embed],
								components: [row],
								ephemeral: true
							})
						}
					})
				})

			} else if (customidTable[2] === "GameVerify") {
				let intmsg = interaction.message
				let intmsgembed = intmsg.embeds[0]
				let intmsgembedfield = intmsgembed.fields[0]
				let userid = parseInt(intmsgembedfield.value)

				db.ref(`main-api/verify-api/inProgressGame/${userid}`).once('value', (snapshot) => {
					if (snapshot.val().confirmed === true) {
						db.ref(`main-api/verify-api/links/${interaction.user.id}`).set(userid)
						db.ref(`main-api/verify-api/inProgressGame/${userid}`).remove()
						interaction.update({
							content: ':white_check_mark: Account linked!',
							embeds: [],
							components: [],
							ephemeral: true
						})
					} else {
						interaction.update('Error: Account not confirmed! Please try to enter the code again!')
					}
				})
			}
		}
	}
}