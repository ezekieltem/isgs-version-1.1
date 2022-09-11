const test = false

// Node Modules
const { Collection, MessageEmbed, Client, Intents, discord, Message, MessageButton, MessageSelectMenu, Permissions } = require("discord.js")
const admin = require("firebase-admin");
const noblox = require('noblox.js')
const fs = require('fs')

// Files
const config = require('./jsons/config.json')
const FirebaseCredentials = require('./jsons/isgs-maindatabase-firebase-adminsdk-k4esd-2b3f11c7b1.json')

// Setup
admin.initializeApp({
    credential: admin.credential.cert(FirebaseCredentials),
    databaseURL: "https://isgs-maindatabase-default-rtdb.firebaseio.com/"
})

// Constants
const client = new Client({
    intents: 32767
})
const database = admin.database()
const InterationHandler = require('./eze-InteractionHandler/index')

// Program

const shouts = require('./shouts.js');

client.on('ready', () => {
    console.log('Bot Online')
    client.user.setActivity({ name: 'the IS group shout.', type: 'WATCHING' })
    InterationHandler.LoadAsApp(client)
    noblox.setCookie(config.Cookie).then(() => {
        console.log('Logged in')
        shouts.init(client, admin, noblox)

    }).catch((err) => {
        client.guilds.cache.get('955551850864730182').members.cache.get('364569809146347520').user.send({
            content: 'Failed to set noblox cookie! All roblox functions are likely to be unresponsive!',
            embeds: [
                new MessageEmbed()
                    .setTitle('Error Information')
                    .setDescription(err.message + ' | This is most likely due to an invalid cookie!')
                    .setColor('RED')
            ]
        })
    })
})

client.on('interactionCreate', (interaction) => {
    if (interaction.user.bot === true) return interaction.reply({
        content: 'No.',
        ephemeral: true
    })
    InterationHandler.runInteraction(interaction, client, database, admin, noblox)
})
client.on('guildCreate', (guild) => {
    guild.fetchAuditLogs({
        type: 'BOT_ADD'
    }).then((auditLogs) => {
        let icon = guild.iconURL()
        let botAddLog = auditLogs.entries.first()
        client.guilds.cache.get('955551850864730182').channels.cache.get('989571901548535828').send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`ISGS joined a guild`)
                    .addField('Guild Info', 'Basic information regarding the guild')
                    .addField('Guild Name', guild.name)
                    .addField('Guild ID', guild.id)
                    .addField('IconURL', icon || 'No icon')
                    .addField('----------------\nUser Info', 'Basic information regarding the user that added ISGS')
                    .addField('Username', botAddLog.executor.username + '#' + botAddLog.executor.discriminator)
                    .addField('UserId', botAddLog.executor.id)
            ]
        })


    }).catch((err) => {
        console.error(err)
    })
})

client.on('guildDelete', (guild) => {
    database.ref(`main-api/guild-api/setup/${guild.id}`).remove().then(() => {
        let icon = guild.iconURL()
        client.guilds.cache.get('955551850864730182').channels.cache.get('989571901548535828').send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`ISGS was removed a guild`)
                    .addField('Guild Info', 'Basic information regarding the guild')
                    .addField('Guild Name', guild.name)
                    .addField('Guild ID', guild.id)
                    .addField('IconURL', icon || 'No icon')
            ]
        })

    })
})
// Initalize
client.login(test === true && config.test || config.main)
