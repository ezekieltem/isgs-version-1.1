const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');
const { Collection, MessageEmbed, Client, Intents, discord, Permissions } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Manages server settings')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action to run')
                .setChoices(
                    {
                        value: 'Get',
                        name: "Get"
                    },
                    {
                        value: 'Set',
                        name: 'Set'
                    }
                )
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('path')
                .setDescription('The path to run through!')
                .addChoices(
                    {name:'global-messages/Enabled | Boolean', value:'channels/global-messages/active|Boolean'},
                    {name:'global-messages/Channel : defaults to shout/Channel | Channel', value:'channels/global-messages/id|Channel'},
                    {name:'isgs-info/Enabled | Boolean', value:'channels/isgs-info/active|Boolean'},
                    {name:'isgs-info/Channel | Channel', value:'channels/isgs-info/id|Channel'},
                    {name:'shouts/Enabled | Boolean', value:'channels/shouts/active|Boolean'},
                    {name:'shouts/Channel | Channel', value:'channels/shouts/id|Channel'},
                    {name:'roles/Linked Role | Role', value:'roles/linkedRoleId|Role'},
                    {name:'roles/Patrol Pings | Role', value:'roles/patrolPingsId|Role'},
                    {name:'roles/Ping Role | Role', value:'roles/pingRoleId|Role'},
                )
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('boolean')
                .setDescription('The value to assign to this boolean position!')
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The value to assign to this channel position!')
                .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The value to assign to this role position!')
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
        db.ref(`main-api/guild-api/setup/${interaction.guild.id}`).once('value', (snapshot) => {
            if (snapshot.hasChildren() === false || snapshot.exists() === false || snapshot.val() === null) {
                interaction.guild.members.cache.get(interaction.guild.ownerId).send(
                    {
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`Shout failure in \`${interaction.guild.name}\``)
                                .addField('Short Reason', `No guid database`)
                                .addField(`Detailed Reason`, `The ISGS database for your server \`${interaction.guild.name}\` doesn't exist!\nPlease run the \`/setup\` command!\nIf the issue persists please contact \`@ezekieltem#3012\``)
                                .setFooter({ text: `Developed by @ezekieltem#3012. Main Server: https://discord.gg/uBw7CCTA8h` })

                        ]
                    })
                return interaction.reply({
                    content: 'There is no database for this server, the owner has been contacted.',
                    ephemeral: true
                })
            }
            const _msgs = JSON.stringify(JSON.parse(JSON.stringify(snapshot.toJSON())), null, 2);
            if (options.getString('action') === 'Get') {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('/settings')
                            .addField('Data:', `
                    global-messages:{
                      -Enabled: ${snapshot.val().channels['global-messages'].active},
                      -Channel: <#${snapshot.val().channels['global-messages'].id}>,
                    },
                    ISGS-Info:{
                      -Enabled: ${snapshot.val().channels['isgs-info'].active},
                      -Channel: <#${snapshot.val().channels['isgs-info'].id}>,
                    },
                    Shouts:{
                      -Enabled: ${snapshot.val().channels.shouts.active},
                      -Channel: <#${snapshot.val().channels.shouts.id}>,
                    },
                    Roles:{
                      -Linked Role: <@&${snapshot.val().roles.linkedRoleId}>,
                      -Patrol Pings: <@&${snapshot.val().roles.patrolPingsId}>,
                      -Ping Role: <@&${snapshot.val().roles.pingRoleId}>
                    }
                    `)
                            .addField('Raw JSON:', '```json\n' + _msgs + '\n```')
                    ],
                    ephemeral: true
                })
            } else if (options.getString('action') === 'Set') {
                db.ref('override-api/settings').once('value', (override) => {
                    if (interaction.memberPermissions.has("MANAGE_GUILD", true) || (interaction.user.id === '364569809146347520' && override.val() === true)) {
                        if (options.getString('path') !== null) {
                            if (options.getBoolean('boolean') === null && options.getChannel('channel') === null && options.getRole('role') === null) {
                                return interaction.reply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setColor('RED')
                                            .setTitle('/settings')
                                            .addField('Argument Error:', 'No new value was called.')
                                    ],
                                    ephemeral: true
                                })
                            }
                            const pathString = options.getString('path')
                            if (pathString.includes('Boolean') === true) {
                                const opt = options.getBoolean('boolean')
                                if (opt !== null) {
                                    db.ref(`main-api/guild-api/setup/${interaction.guild.id}/${pathString.split('|')[0]}`).set(opt).then((newValue) => {
                                        interaction.reply({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setTitle('/settings')
                                                    .setColor('GREEN')
                                                    .addField('Value Set:', `.../${pathString.split('|')[0]} = ${opt}`)
                                            ],
                                            ephemeral: true
                                        })
                                    }).catch(err => {
                                        interaction.reply({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setTitle('/settings')
                                                    .setColor('RED')
                                                    .addField('Error:', `Uh oh! It appears there was an error setting the given path to the requested value! Please try again! If the error continues please report it to the ISGS server!`)
                                                    .addField('Error Msg:', `${err.message}`)
                                            ],
                                            ephemeral: true
                                        })
                                    })
                                } else {
                                    interaction.reply({
                                        embeds: [
                                            new MessageEmbed()
                                                .setColor('RED')
                                                .setTitle('/settings')
                                                .addField('Argument Error:', 'The boolean option was not set.')
                                        ],
                                        ephemeral: true
                                    })
                                }
                            } else if (pathString.includes('Role') === true) {
                                const opt = options.getRole('role')
                                if (opt.id === interaction.guild.roles.everyone.id) {
                                    return interaction.reply({
                                        embeds: [
                                            new MessageEmbed()
                                                .setTitle('/settings')
                                                .setColor('RED')
                                                .addField('Invalid Role:', `The role cannot be @everyone`)
                                        ],
                                        ephemeral: true
                                    })
                                }
                                if (opt !== null) {
                                    db.ref(`main-api/guild-api/setup/${interaction.guild.id}/${pathString.split('|')[0]}`).set(opt.id).then(newValue => {
                                        interaction.reply({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setTitle('/settings')
                                                    .setColor('GREEN')
                                                    .addField('Value Set:', `.../${pathString.split('|')[0]} = ${opt}`)
                                            ],
                                            ephemeral: true
                                        })
                                    }).catch(err => {
                                        interaction.reply({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setTitle('/settings')
                                                    .setColor('RED')
                                                    .addField('Error:', `Uh oh! It appears there was an error setting the given path to the requested value! Please try again! If the error continues please report it to the ISGS server!`)
                                                    .addField('Error Msg:', `${err.message}`)
                                            ],
                                            ephemeral: true
                                        })
                                    })
                                } else {
                                    interaction.reply({
                                        embeds: [
                                            new MessageEmbed()
                                                .setColor('RED')
                                                .setTitle('/settings')
                                                .addField('Argument Error:', 'The role option was not set.')
                                        ],
                                        ephemeral: true
                                    })
                                }
                            } else if (pathString.includes('Channel') === true) {
                                const opt = options.getChannel('channel')
                                if (opt !== null) {
                                    db.ref(`main-api/guild-api/setup/${interaction.guild.id}/${pathString.split('|')[0]}`).set(opt.id).then(newValue => {
                                        interaction.reply({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setTitle('/settings')
                                                    .setColor('GREEN')
                                                    .addField('Value Set:', `.../${pathString.split('|')[0]} = ${opt}`)
                                            ],
                                            ephemeral: true
                                        })
                                    }).catch(err => {
                                        interaction.reply({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setTitle('/settings')
                                                    .setColor('RED')
                                                    .addField('Error:', `Uh oh! It appears there was an error setting the given path to the requested value! Please try again! If the error continues please report it to the ISGS server!`)
                                                    .addField('Error Msg:', `${err.message}`)
                                            ],
                                            ephemeral: true
                                        })
                                    })
                                } else {
                                    interaction.reply({
                                        embeds: [
                                            new MessageEmbed()
                                                .setColor('RED')
                                                .setTitle('/settings')
                                                .addField('Argument Error:', 'The channel option was not set.')
                                        ],
                                        ephemeral: true
                                    })
                                }
                            } else {
                                console.log('Is false what???')
                            }
                        } else {
                            interaction.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor('RED')
                                        .setTitle('/settings')
                                        .addField('Argument Error:', 'No path value was called.')
                                ],
                                ephemeral: true
                            })
                        }
                    } else {
                        let ReplyEmbed = new MessageEmbed()
                            .setTitle('/setup')
                            .setColor("RED")
                            .addField(`:no_entry: Unauthorized :no_entry:`, `You are not authorized to run /setting action:Set! If you think this is a mistake request an administrator to give you a role with the permission \`Manage Server\`!`)
                        interaction.reply({ embeds: [ReplyEmbed], ephemeral: true })
                    }
                })
            }
        })
    },
};