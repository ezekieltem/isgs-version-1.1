const { Collection, MessageEmbed, Client, Intents, discord, Message, MessageButton, MessageSelectMenu, Permissions, MessageActionRow } = require("discord.js")
const Admin = require("firebase-admin");
const Noblox = require('noblox.js')
const fs = require('fs')

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Admin} admin 
     * @param {Noblox} noblox 
     */

    async init(client, admin, noblox) {
        const db = admin.database()
        db.ref('main-api/shout-api/groups').once('value', (snapshot) => {
            snapshot.forEach((groupData) => {
                const { id, listenfor } = groupData.val()
                if (listenfor === true) {
                    let lastShout = {
                        body: 'LAST SHOUT BODY FUCK YOU!!!!!!!'
                    }
                    const onShout = noblox.onShout(id)

                    onShout.on('data', (shout) => {
                        db.ref(`main-api/shout-api/groups/${groupData.key}`).once('value', (snapshot2) => {
                            const { enabled, neverping } = snapshot2.val()
                            if (enabled === false) return console.log('Listening for shout, but shout notis disabled for group')
                            if ((shout.body && shout.created && shout.poster && shout.updated)) {
                                if (shout.body === lastShout.body) return
                                lastShout = shout
                                noblox.getGroup(id).then((group) => {
                                    noblox.getPlayerThumbnail(shout.poster.userId, '720x720', 'png', false, 'headshot').then((userPhoto) => {
                                        const embed = new MessageEmbed()
                                            .setTitle(`${group.name}`)
                                            .setThumbnail(userPhoto[0].imageUrl)
                                            .setURL(`https://www.roblox.com/groups/${group.id}/ISGS-Group-Shout-Embed-Title-Link`)
                                            .setAuthor({ name: `${shout.poster.displayName} (@${shout.poster.username})` })
                                            .setFooter({ text: 'ISGS is developed by @ezekieltem#3012! You can join the ISGS server here: https://discord.gg/uBw7CCTA8h' })
                                        if (shout.body === '' || shout.body === ' ') {
                                            embed.setDescription('Shout cleared')
                                        } else {
                                            embed.setDescription(shout.body)
                                        }
                                        /*
                                            shoutMsgData['Type'] Typing
                                            0 = Unknown
                                            1 = Training
                                            2 = Patrol
                                        */
                                        const shoutMsgData = {
                                            ['Type']: 0,
                                            ['Ping']: false,
                                        }
                                        db.ref('main-api/ping-api').once('value', (trigsnapshot) => {
                                            for (const element in trigsnapshot.val()['normalTrigs']) {
                                                if (shout.body.toLowerCase().includes(trigsnapshot.val()['normalTrigs'][element])) shoutMsgData['Type'] = 1
                                            };
                                            for (const element in trigsnapshot.val()['patrolTrigs']) {
                                                if (shout.body.toLowerCase().includes(trigsnapshot.val()['patrolTrigs'][element])) shoutMsgData['Type'] = 2
                                            };
                                            for (const element in trigsnapshot.val()['startTrigs']) {
                                                if (shout.body.toLowerCase().includes(trigsnapshot.val()['startTrigs'][element])) shoutMsgData['Ping'] = true
                                            };
                                            for (const element in trigsnapshot.val()['endTrigs']) {
                                                if (shout.body.toLowerCase().includes(trigsnapshot.val()['endTrigs'][element])) shoutMsgData['Ping'] = false
                                            };
                                            client.guilds.cache.forEach((guild, id, map) => {
                                                db.ref(`main-api/guild-api/setup/${id}`).once('value', (guildData) => {
                                                    if (guildData.exists() === false || guildData.hasChildren() === false) return
                                                    if (guildData.val().channels.shouts.active === false) return
                                                    if (guild.channels.cache.has(guildData.val().channels.shouts.id) === false) { return guild.members.cache.get(guild.ownerId).send(`Unable to get the shout channel in ${guild.name}! It may have been deleted, never set (/settings), or the server database was never setup (/setup)!`) }
                                                    let messageToSend = 'TBD'
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
                                                                    .setURL('https://www.roblox.com/games/8232411/ISGS-URL-Button-Link')
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
                                                    const channel = guild.channels.cache.get(guildData.val().channels.shouts.id)
                                                    if (guild.roles.cache.has(guildData.val().roles.pingRoleId) && shoutMsgData['Ping'] === true) {
                                                        if (neverping === true) {
                                                            const newMsg = `ISGS set to never ping for group ${group.name}, ${messageToSend}`
                                                            messageToSend = newMsg
                                                        } else {
                                                            const newMsg = `<@&${guildData.val().roles.pingRoleId}>, ${messageToSend}`
                                                            messageToSend = newMsg
                                                        }
                                                    }
                                                    if (actionRow !== null) {
                                                        channel.send({
                                                            content: messageToSend,
                                                            embeds: [embed],
                                                            components: [actionRow]
                                                        })
                                                    } else {
                                                        channel.send({
                                                            content: messageToSend,
                                                            embeds: [embed]
                                                        })
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            }
                        })
                    })

                    onShout.on('error', (err) => {
                        console.error(err.message)
                    })
                }
            })
        })
    }
}