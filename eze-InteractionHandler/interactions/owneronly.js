const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection, MessageEmbed, discord, MessageButton, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, Permissions, CommandInteraction, Options, Client, CommandInteractionOptionResolver, ButtonInteraction } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;
const { inspect } = require('util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('owneronly')
        .setDescription('Contains all commands that can only be ran by ezekieltem#3012 the owner of the ISGS bot.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to run.')
                .setChoices(
                    {
                        name: 'terminate',
                        value: '1'
                    },
                    {
                        name: 'eval',
                        value: '2'
                    }
                )
        )
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The code to run thru `eval`')
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
        let options = interaction.options
        if (interaction.user.id !== '364569809146347520') return interaction.reply({ 'content': ':no_entry: **__You are not authorized to preform this!__** :no_entry:' })
        if (options.getString('command') === '1') {
            const ButtonRow = new MessageActionRow()
    
            const Yes = new MessageButton()
                .setLabel('YES')
                .setStyle('DANGER')
                .setCustomId(`${this.data.name}-2-Confirm-1`)
    
            const No = new MessageButton()
                .setLabel('NO')
                .setStyle('SUCCESS')
                .setCustomId(`${this.data.name}-2-2-Deny`)
            ButtonRow.setComponents([Yes, No])
    
            interaction.reply({
                content: 'Are you positive you wish to preform this action?',
                ephemeral: true,
                components: [ButtonRow]
            })
        } else if (options.getString('command') === '2') {
            let evaled;
            try {
                evaled = await eval(options.getString('code'));
                console.log(inspect(evaled));
                let success = new MessageEmbed()
                    .setDescription(":white_check_mark: Code has been successfully Evaluated/ran!")
                    .setTimestamp();
                if (interaction.replied === true || interaction.deferred === true) {
                    interaction.followUp({ embeds: [success], ephemeral: true });
                } else {
                    interaction.reply({ embeds: [success], ephemeral: true });
                }
            }
            catch (error) {
                console.error(error);
                let errorEmbed = new MessageEmbed()
                    .setDescription("There was a problem evaluating/running this code.")
                    .addField(`Error Information:`, toString(error.message) + ' | Keep a string here')
                    .setColor('#ff0000');
                if (interaction.replied === true || interaction.deferred === true) {
                    try {
                        interaction.followUp({
                            content: 'The code encountered an error.',
                            embeds: [errorEmbed],
                            ephemeral: true
                        });
                    } catch (error) {
                        try {
                            interaction.editReply({
                                content: 'The code encountered an error.',
                                embeds: [errorEmbed],
                                ephemeral: true
                            });
                        } catch (error) {
                            interaction.channel.send(`<@${interaction.user.id}> unable to reply! some error occured!`)
                        }
                    }
                } else {

                    interaction.channel.send({
                        content: 'The code encountered an error.' + `<@${interaction.user.id}> unable to reply! some error occured!`,
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                }
            }
        } else {
            interaction.reply({
                content: 'Unknown command',
                ephemeral: true
            })
        }
    },
    /**
     * @param {ButtonInteraction} interaction 
     * @param {Client} client
     */
    async runButton(interaction, customIdArray, client, userVars) {
        if (customIdArray[1] === '1') {

        } else if (customIdArray[1] === '2') {
            if (customIdArray[2] === 'Confirm') {
                if (customIdArray[3] === '1') {
                    const ButtonRow = new MessageActionRow()
    
                    const Yes = new MessageButton()
                        .setLabel('YES')
                        .setStyle('DANGER')
                        .setCustomId(`${this.data.name}-2-Confirm-2`)
            
                    const No = new MessageButton()
                        .setLabel('NO')
                        .setStyle('SUCCESS')
                        .setCustomId(`${this.data.name}-2-Deny-1`)
                    ButtonRow.setComponents([Yes, No])
    
                    interaction.update({
                        content: 'Now do you really want to terminate ISGS?',
                        ephemeral: true,
                        components: [ButtonRow]
                    })
                } else if (customIdArray[3] === '2') {
                    console.log('ISGS Terminated')
                    interaction.update({
                        content: 'ISGS Terminated',
                        ephemeral: true,
                        components: []
                    }).then((APIMessage) => {
                        client.destroy()
                        process.exit()
                    })
                }
            } else if (customIdArray[2] === 'Deny') {
                interaction.update({
                    content: 'Termination canceled',
                    ephemeral: true,
                    components: []
                })
            }
        }
    },
    /**
     * @param {SelectMenuInteraction} interaction 
     * @param {Client} client
     */
    async runMenu(interaction, customIdArray, selected, client, userVars) {
    }
};