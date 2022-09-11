const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection, MessageEmbed, discord, MessageButton, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, Permissions, CommandInteraction, Options, Client, CommandInteractionOptionResolver, ButtonInteraction } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;
let noblox = require('noblox.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testshout')
        .setDescription('Run a test shout!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The "shout"\'s message. **DOES NOT CENSOR**')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('userid')
                .setDescription('The ROBLOX UserId of the "shout" poster.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('groupid')
                .setDescription('The GroupId  of the group the "shout" is from.')
                .setRequired(true)
        )
        .setDMPermission(false),

    loadData: {
        // Is command restricted to set guilds?
        lockedToGuilds: false,
        guildIds: []
    },
    /**
     * @param {CommandInteraction} interaction 
     * @param {CommandInteractionOptionResolver} options 
     * @param {Client} client
     */
    async run(interaction, client, userVars) {
        let options = interaction.options
        let db = userVars[0]
        let admin = userVars[1]
        noblox = userVars[2]
        db.ref('override-api').once('value', (overrideApi) => {
            if (interaction.memberPermissions.has('MANAGE_GUILD', true) === false && (interaction.user.id === '364569809146347520' && overrideApi.val().command === true) === false) return interaction.reply({ embeds: [new MessageEmbed()
                .setTitle('/setup')
                .setColor("RED")
                .addField(`:no_entry: Unauthorized :no_entry:`, `You are not authorized to run /setting action:Set! If you think this is a mistake request an administrator to give you a role with the permission \`Manage Server\`!`)], ephemeral: true })
            noblox.getPlayerInfo(options.getInteger('userid')).then((plr) => {
                db.ref(`main-api/guild-api/setup/${interaction.guildId}`).once('value', (snapshot) => {
                    if (snapshot.exists() === false || snapshot.hasChildren() === false) return interaction.reply({
                        content: ':no_entry: Error 404 : No guild database',
                        ephemeral: true
                    })
                    if (snapshot.val().channels.shouts.active === false) return interaction.reply({
                        content: 'Group shout notifications are disabled in this server',
                        ephemeral: true
                    })
                    const guild = interaction.guild
                    if (guild.channels.cache.has(snapshot.val().channels.shouts.id) === false) return interaction.reply({
                        content: 'The shout channel for this server was either never set or has been deleted!',
                        ephemeral: true
                    })
                    noblox.getGroup(options.getInteger('groupid')).then((group) => {
                        noblox.getPlayerThumbnail(options.getInteger('userid'), '720x720', 'png', false, 'headshot').then((userPhoto) => {
                            const shout = options.getString('message')
                            db.ref('main-api/ping-api').once('value', (trigsnapshot) => {
                                const shoutMsgData = {
                                    ['Type']: 0,
                                    ['Ping']: false,
                                }
                                for (const element in trigsnapshot.val()['normalTrigs']) {
                                    if (shout.toLowerCase().includes(trigsnapshot.val()['normalTrigs'][element])) shoutMsgData['Type'] = 1
                                };
                                for (const element in trigsnapshot.val()['patrolTrigs']) {
                                    if (shout.toLowerCase().includes(trigsnapshot.val()['patrolTrigs'][element])) shoutMsgData['Type'] = 2
                                };
                                for (const element in trigsnapshot.val()['startTrigs']) {
                                    if (shout.toLowerCase().includes(trigsnapshot.val()['startTrigs'][element])) shoutMsgData['Ping'] = true
                                };
                                for (const element in trigsnapshot.val()['endTrigs']) {
                                    if (shout.toLowerCase().includes(trigsnapshot.val()['endTrigs'][element])) shoutMsgData['Ping'] = false
                                };
                                const embed = new MessageEmbed()
                                    .setTitle(`${group.name}`)
                                    .setThumbnail(userPhoto[0].imageUrl)
                                    .setURL(`https://www.roblox.com/groups/${group.id}/ISGS-Group-Shout-Embed-Title-Link`)
                                    .setAuthor({ name: `${plr.displayName} (@${plr.username})` })
                                    .setFooter({ text: 'ISGS is developed by @ezekieltem#3012! You can join the ISGS server here: https://discord.gg/uBw7CCTA8h' })
                                if (shout === '<null>') {
                                    embed.setDescription('Shout cleared')
                                } else {
                                    embed.setDescription(shout)
                                } let messageToSend = 'TBD'
                                let actionRow = null
                                if (shoutMsgData['Ping'] === true) {
                                    if (shoutMsgData['Type'] == 0) {
                                        messageToSend = 'A shout for something other than a patrol of training has been sent!'
                                    } else if (shoutMsgData['Type'] == 1) {
                                        messageToSend = 'A training is starting!'
                                        actionRow = new MessageActionRow()
                                            .addComponents(new MessageButton()
                                                .setStyle('LINK')
                                                .setLabel('Training Facility')
                                                .setURL('https://www.roblox.com/games/8232411/')
                                            )
                                    } else if (shoutMsgData['Type'] == 2) {
                                        messageToSend = 'A patrol is being hosted!'
                                    }
                                } else {
                                    if (shoutMsgData['Type'] == 0) {
                                        messageToSend = 'A shout for something other than a patrol of training has been sent!'
                                    } else if (shoutMsgData['Type'] == 1) {
                                        messageToSend = 'A training has ended!'
                                    } else if (shoutMsgData['Type'] == 2) {
                                        messageToSend = 'A patrol has ended!'
                                    }
                                }
                                const channel = guild.channels.cache.get(snapshot.val().channels.shouts.id)
                                if (guild.roles.cache.has(snapshot.val().roles.pingRoleId) && shoutMsgData['Ping'] === true) {
                                    const newMsg = `(Ping Here), ${messageToSend}`
                                    messageToSend = newMsg
                                }
                                if (actionRow !== null) {
                                    channel.send({
                                        content: messageToSend,
                                        embeds: [embed],
                                        components: [actionRow]
                                    }).then((msg) => {
                                        interaction.reply({
                                            content: 'Shout send!',
                                            ephemeral: true
                                        })
                                    }).catch((err) => {
                                        interaction.reply({
                                            content: 'Unable to send shout noti',
                                            ephemeral: true
                                        })
                                        console.error(err)
                                    })
                                } else {
                                    channel.send({
                                        content: messageToSend,
                                        embeds: [embed]
                                    }).then((msg) => {
                                        interaction.reply({
                                            content: 'Shout send!',
                                            ephemeral: true
                                        })
                                    }).catch((err) => {
                                        interaction.reply({
                                            content: 'Unable to send shout noti',
                                            ephemeral: true
                                        })
                                        console.error(err)
                                    })
                                }
                            })
                        })
                    }).catch((err) => {
                        interaction.reply({
                            content: 'Failed to get group.',
                            ephemeral: true
                        })
                        console.error(err)
                    })
                })
            }).catch((err) => {
                interaction.reply({
                    content: 'Failed to get user.',
                    ephemeral: true
                })
                console.error(err)
            })
        })
    },
    /**
     * @param {ButtonInteraction} interaction 
     * @param {Client} client
     */
    async runButton(interaction, customIdArray, client, userVars) {
    },
    /**
     * @param {SelectMenuInteraction} interaction 
     * @param {Client} client
     */
    async runMenu(interaction, customIdArray, selected, client, userVars) {
    }
};
