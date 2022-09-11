const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection, MessageEmbed, discord, MessageButton, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, Permissions } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('The server setup command')
        .setDMPermission(false),

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
        db.ref('override-api/setup').once('value', (override) => {
            if (interaction.memberPermissions.has("MANAGE_GUILD", true) || (interaction.user.id === '364569809146347520' && override.val() === true)) {
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId('setup-SelectMenu.SetupType')
                            .setPlaceholder('Nothing selected')
                            .addOptions([
                                {
                                    label: 'Auto',
                                    //description: 'Does the server setup for you.',
                                    value: 'Auto',
                                },
                                {
                                    label: 'Manual',
                                    //description: 'Setup the server manually.',
                                    value: 'Manual',
                                },
                            ]),
                    );
                const embed = new MessageEmbed()
                    .setTitle('/setup')
                    .addField('Auto:', 'Does the server setup for you!')
                    .addField('Manual:', 'Creates an empty database to allow you to setup the server manually with \`/settings\`')

                interaction.reply({ components: [row], embeds: [embed], ephemeral: true })
            } else {
                let ReplyEmbed = new MessageEmbed()
                    .setTitle('/setup')
                    .setColor("RED")
                    .addField(`:no_entry: Unauthorized :no_entry:`, `You are not authorized to run /setup! If you think this is a mistake request an administrator to give you a role with the permission \`Manage Server\`!`)
                interaction.reply({ embeds: [ReplyEmbed], ephemeral: true })
            }
        })
    },
    async runButton(interaction, customidTable, client, admin, db) {

    },
    async runMenu(interaction, customidTable, selected, client, userVars) {
        let db = userVars[0]
        let admin = userVars[1]
        let noblox = userVars[2]
        if (customidTable[1] === 'SelectMenu.SetupType') {
            if (selected[0] === 'Auto') {
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setDisabled(true)
                            .setCustomId('setup-SelectMenu.SetupType')
                            .setPlaceholder('Nothing selected')
                            .addOptions([
                                {
                                    label: 'Auto',
                                    //description: 'Does the server setup for you.',
                                    value: 'Auto',
                                },
                                {
                                    label: 'Manual',
                                    //description: 'Setup the server manually.',
                                    value: 'Manual',
                                },
                            ]),
                    );
                const em2bed = new MessageEmbed()
                    .setTitle('/setup')
                    .addField('Auto:', 'Does the server setup for you!')
                    .addField('Manual:', 'Creates an empty database to allow you to setup the server manually with \`/settings\`')

                await interaction.update({ components: [row], embeds: [em2bed], ephemeral: true })
                const embed = new MessageEmbed()
                    .setTitle('/setup')
                    .setDescription('Please stand by as the server is setup!')
                let msg = await interaction.followUp({ embeds: [embed], components: [], ephemeral: true })
                wait(500)
                interaction.guild.roles.create({
                    name: 'IS Member',
                    reason: 'Setting up the server for ISGS. Setup Type: Auto',
                })
                    .then((role) => {

                        const embedSuccess = new MessageEmbed()
                            .setTitle('/setup')
                            .setDescription('Please stand by as the server is setup!')
                            .addField('Role Created:', `<@&${role.id}>`)
                        interaction.followUp({ embeds: [embedSuccess], components: [], ephemeral: true })
                        wait(500)
                        interaction.guild.channels.create('ISGS', {
                            type: 'GUILD_CATEGORY',
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.roles.everyone.id,
                                    deny: [Permissions.FLAGS.VIEW_CHANNEL],
                                },
                                {
                                    id: role.id,
                                    allow: [
                                        Permissions.FLAGS.VIEW_CHANNEL,
                                        Permissions.FLAGS.READ_MESSAGE_HISTORY
                                    ],
                                    deny: [
                                        Permissions.FLAGS.SEND_MESSAGES
                                    ]
                                }
                            ],
                            reason: 'Setting up the server for ISGS. Setup Type: Auto'
                        })
                            .then((category) => {

                                const embedSuccess2 = new MessageEmbed()
                                    .setTitle('/setup')
                                    .setDescription('Please stand by as the server is setup!')
                                    .addField('Role Created:', `<@&${role.id}>`)
                                    .addField('Category Created:', `<#${category.id}>`)

                                interaction.followUp({ embeds: [embedSuccess2], components: [], ephemeral: true })

                                category.createChannel(
                                    'info',
                                    {
                                        reason: 'Setting up the server for ISGS. Setup Type: Auto'
                                    }
                                )
                                    .then((channelInfo) => {

                                        const embedSuccess3 = new MessageEmbed()
                                            .setTitle('/setup')
                                            .setDescription('Please stand by as the server is setup!')
                                            .addField('Role Created:', `<@&${role.id}>`)
                                            .addField('Category Created:', `<#${category.id}>`)
                                            .addField('Channel 1 Created:', `<#${channelInfo.id}>`)

                                        interaction.followUp({ embeds: [embedSuccess3], components: [], ephemeral: true })
                                        channelInfo.send({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setTitle('Information')
                                                    .addField('What is ISGS?', 'ISGS or Innovation Security Group Shouts, is a group shout notification discord bot for the ROBLOX group `Innovation Security`')
                                                    .addField('What is Innovation Security?', 'Innovation Security is a security group on ROBLOX.')
                                                    .addField('What is this category for?', 'This category is for ISGS related channels!')
                                            ]
                                        })
                                        category.createChannel(
                                            'shouts',
                                            {
                                                reason: 'Setting up the server for ISGS. Setup Type: Auto'
                                            }
                                        )
                                            .then((channelShout) => {

                                                const embedSuccess4 = new MessageEmbed()
                                                    .setTitle('/setup')
                                                    .setDescription('Please stand by as the server is setup!')
                                                    .addField('Role Created:', `<@&${role.id}>`)
                                                    .addField('Category Created:', `<#${category.id}>`)
                                                    .addField('Channel 1 Created:', `<#${channelInfo.id}>`)
                                                    .addField('Channel 2 Created:', `<#${channelShout.id}>`)

                                                interaction.followUp({ embeds: [embedSuccess4], components: [], ephemeral: true })
                                                db.ref(`main-api/guild-api/setup/${interaction.guild.id}`).set(JSON.parse(JSON.stringify(
                                                    {
                                                        "channels": {
                                                            "shouts": {
                                                                "id": channelShout.id,
                                                                "active": true
                                                            },
                                                            "isgs-info": {
                                                                "id": channelInfo.id,
                                                                "active": true
                                                            },
                                                            "global-messages": {
                                                                "id": "0",
                                                                "active": false
                                                            }
                                                        },
                                                        "roles": {
                                                            "linkedRoleId": role.id,
                                                            "pingRoleId": "0",
                                                            "patrolPingsId": "0"
                                                        }
                                                    })))
                                                    .then((value) => {
                                                        const embedFail = new MessageEmbed()
                                                            .setTitle('/setup')
                                                            .setDescription('Your server has been successfully setup! If you have anymore questions feel free to join our official discord server!')
                                                        interaction.followUp({ embeds: [embedFail], components: [], ephemeral: true })
                                                    })
                                                    .catch((error) => {
                                                        const embedFail = new MessageEmbed()
                                                            .setTitle('/setup')
                                                            .setDescription('Failed to write to the database! Please contact `@ezekieltem#3012` about this issue!')
                                                        channelInfo.delete()
                                                        category.delete()
                                                        role.delete()
                                                        interaction.followUp({ embeds: [embedFail], components: [], ephemeral: true })
                                                        console.error(error);
                                                    })
                                            })
                                            .catch((error) => {
                                                const embedFail = new MessageEmbed()
                                                    .setTitle('/setup')
                                                    .setDescription('Unable to create channel!\nDo I have sufficient permissions?')
                                                channelInfo.delete()
                                                category.delete()
                                                role.delete()
                                                interaction.followUp({ embeds: [embedFail], components: [], ephemeral: true })
                                                console.error(error);
                                            })
                                    })
                                    .catch((error) => {
                                        const embedFail = new MessageEmbed()
                                            .setTitle('/setup')
                                            .setDescription('Unable to create channel!\nDo I have sufficient permissions?')
                                        category.delete()
                                        role.delete()
                                        interaction.followUp({ embeds: [embedFail], components: [], ephemeral: true })
                                        console.error(error);
                                    })
                            })
                            .catch((error) => {

                                const embedFail = new MessageEmbed()
                                    .setTitle('/setup')
                                    .setDescription('Unable to create category!\nDo I have sufficient permissions?')
                                role.delete()
                                interaction.followUp({ embeds: [embedFail], components: [], ephemeral: true })
                                console.error(error);
                            })
                    })
                    .catch((error) => {

                        const embedFail = new MessageEmbed()
                            .setTitle('/setup')
                            .setDescription('Unable to create role!\nDo I have sufficient permissions?')
                        interaction.followUp({ embeds: [embedFail], components: [], ephemeral: true })
                        console.error(error);
                    });
            } else if (selected[0] == 'Manual') {
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setDisabled(true)
                            .setCustomId('setup-SelectMenu.SetupType')
                            .setPlaceholder('Nothing selected')
                            .addOptions([
                                {
                                    label: 'Auto',
                                    //description: 'Does the server setup for you.',
                                    value: 'Auto',
                                },
                                {
                                    label: 'Manual',
                                    //description: 'Setup the server manually.',
                                    value: 'Manual',
                                },
                            ]),
                    );

                const embed = new MessageEmbed()
                    .setTitle('/setup')
                    .addField('Auto:', 'Does the server setup for you!')
                    .addField('Manual:', 'Creates an empty database to allow you to setup the server manually with \`/settings\`')

                await interaction.update({ components: [row], embeds: [embed], ephemeral: true })

                db.ref(`main-api/guild-api/setup/${interaction.guild.id}`).set(JSON.parse(JSON.stringify(
                    {
                        "channels": {
                            "shouts": {
                                "id": "0",
                                "active": false
                            },
                            "isgs-info": {
                                "id": "0",
                                "active": false
                            },
                            "global-messages": {
                                "id": "0",
                                "active": false
                            }
                        },
                        "roles": {
                            "linkedRoleId": "0",
                            "pingRoleId": "0",
                            "patrolPingsId": "0"
                        }
                    })))
                    .then(() => {
                        const embedFail = new MessageEmbed()
                            .setTitle('/setup')
                            .setDescription('Your server has been successfully setup for manual setup! If you have anymore questions feel free to join our official discord server!')
                        interaction.followUp({ embeds: [embedFail], components: [], ephemeral: true })
                    })
                    .catch((error) => {
                        const embedFail = new MessageEmbed()
                            .setTitle('/setup')
                            .setDescription('Failed to write to the database! Please contact `@ezekieltem#3012` about this issue!')
                        interaction.followUp({ embeds: [embedFail], components: [], ephemeral: true })
                        console.error(error);
                    })
            }
        }
    }
};