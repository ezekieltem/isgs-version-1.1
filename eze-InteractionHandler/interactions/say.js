const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { Collection, MessageEmbed, discord, MessageButton, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, Permissions, CommandInteraction, Options, Client, CommandInteractionOptionResolver, ButtonInteraction, MessageFlags } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something! Possibly even as a reply *this part isnt finished*!')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('What the bot should say')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reply')
                .setDescription('The message ID of the message to reply to! *(Must be in this channel)*')
        )
        .setDMPermission(true),

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
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({
            content:'You need to have the `Manage Messages` permission to use this here.',
            ephemeral: true
        })
        const options = interaction.options
        if (options.getString('reply')) {
            const msg = interaction.channel.messages.cache.get(options.getString('reply'))
            if (msg) {
                msg.reply({
                    content: options.getString('text')
                }).catch(() => {
                    interaction.channel.send({
                        content: options.getString('text')
                    })
                })
            } else {
                interaction.channel.send({
                    content: options.getString('text')
                })
            }
        } else {
            interaction.channel.send({
                content: options.getString('text')
            })
        }
        interaction.reply({
            content: 'Message sent',
            ephemeral: true
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
