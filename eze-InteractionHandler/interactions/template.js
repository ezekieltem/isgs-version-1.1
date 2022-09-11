const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection, MessageEmbed, discord, MessageButton, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, Permissions, CommandInteraction, Options, Client, CommandInteractionOptionResolver, ButtonInteraction } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('template')
        .setDescription('The template command for eze-InteractionHandler')
        .setDMPermission(true),
    /**
     * @param {CommandInteraction} interaction 
     * @param {CommandInteractionOptionResolver} options 
     * @param {Client} client
     */

    loadData: {
        // Is command restricted to set guilds?
        lockedToGuilds: false,
        guildIds: []
    },
    async run(interaction, options, client, userVars) {
        const ButtonRow = new MessageActionRow()
        const MenuRow = new MessageActionRow()
        
        const Button = new MessageButton()
            .setLabel('Button')
            .setStyle('PRIMARY')
            .setCustomId(`${this.data.name}-Button`)

        const Menu = new MessageSelectMenu()
            .setOptions([
                {
                    label: 'Option 1',
                    value: 'Opt1'
                },
                {
                    label: 'Option 2',
                    value: 'Opt2'
                }
            ])
            .setCustomId(`${this.data.name}-Menu`)
            .setPlaceholder('Click me')
        ButtonRow.setComponents([Button])
        MenuRow.setComponents([Menu])

        interaction.reply({
            content: 'This is a template',
            ephemeral: true,
            components: [ButtonRow,MenuRow]
        })
    },
    /**
     * @param {ButtonInteraction} interaction 
     * @param {Client} client
     */
    async runButton(interaction, customIdArray, client, userVars) {
        interaction.update({
            content: 'You have clicked the button :D',
        })
    },
    /**
     * @param {SelectMenuInteraction} interaction 
     * @param {Client} client
     */
    async runMenu(interaction, customIdArray, selected, client, userVars) {
        interaction.update({
            content: 'You have selected '+selected[0],
        })
    }
};