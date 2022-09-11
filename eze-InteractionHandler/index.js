const { Client, Interaction, MessageEmbed, CommandInteraction, ButtonInteraction, SelectMenuInteraction } = require('discord.js')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

let initalized = false

module.exports = {
    /**
     * @name initalize
     * @description Loads all of the commands in .../eze-InteractionHandler/interactions as global Application Commands.
     * 
     * @param {Client} client
     * 
     * @returns {void}
     */
    async LoadAsApp(client) {

        const commands = [];
        const commandFiles = fs.readdirSync('./eze-InteractionHandler/interactions').filter(file => file.endsWith('.js'));

        const clientId = client.application.id;
        for (const file of commandFiles) {
            const command = require(`./interactions/${file}`);
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: '9' }).setToken(client.token);

        (async () => {
            try {
                console.log(':: eze-InteractionHandler ::\nStarted refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commands },
                );

                console.log(':: eze-InteractionHandler ::\nSuccessfully reloaded application (/) commands.');
            } catch (error) {
                console.error(`:: eze-InteractionHandler ::\n${error}`)
            }
        })();
        initalized = true
    },
    async ClearFromAp(client) {

        const commands = [];

        const clientId = client.application.id;

        const rest = new REST({ version: '9' }).setToken(client.token);

        (async () => {
            try {
                console.log(':: eze-InteractionHandler ::\nStarted refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commands },
                );

                console.log(':: eze-InteractionHandler ::\nSuccessfully reloaded application (/) commands.');
            } catch (error) {
                console.error(`:: eze-InteractionHandler ::\n${error}`)
            }
        })();
        initalized = true
    },
    /**
     * @name LoadInGuild
     * @description loads all of the commands in .../eze-InteractionHandler/interactions to a specific guild
     * 
     * @param {Client} client
     * 
     * @param {string} guildId
     * 
     * @returns {void}
     */
    async LoadInGuild(client, guildId) {

        const commands = [];
        const commandFiles = fs.readdirSync('./eze-InteractionHandler/interactions').filter(file => file.endsWith('.js'));

        const clientId = client.application.id;
        for (const file of commandFiles) {
            const command = require(`./interactions/${file}`);
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: '9' }).setToken(client.token);

        (async () => {
            try {
                console.log(':: eze-InteractionHandler ::\nStarted refreshing public application (/) commands in guild with the id ' + guildId + '.');

                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );

                console.log(':: eze-InteractionHandler ::\nSuccessfully reloaded public application (/) commands in guild with the id ' + guildId + '.');
            } catch (error) {
                console.error(`:: eze-InteractionHandler ::\n${error}`)
            }
        })();
    },
    /**
     * @name ClearFromGuild
     * @description Clears all of the commands loaded in a specific guild by the provided client
     * 
     * @param {Client} client
     * 
     * @param {string} guildId
     * 
     * @returns {void}
     */
    async ClearFromGuild(client, guildId) {

        const commands = [];

        const clientId = client.application.id;

        const rest = new REST({ version: '9' }).setToken(client.token);

        (async () => {
            try {
                console.log(':: eze-InteractionHandler ::\nStarted clearing application (/) commands from guild with the id ' + guildId + '.');

                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: [] },
                );

                console.log(':: eze-InteractionHandler ::\nSuccessfully cleared application (/) commands in guild with the id ' + guildId + '.');
            } catch (error) {
                console.error(`:: eze-InteractionHandler ::\n${error}`)
            }
        })();
    },

    /**
     * @name runInteraction
     * @description Runs the code linked to the provided interaction
     * 
     * @param {SelectMenuInteraction} interaction
     * 
     * @param {Client} client
     * 
     * @returns {void}
     */
    async runInteraction(interaction, client, ...userVars) {
        if (fs.existsSync(`./eze-InteractionHandler/interactions/${interaction.commandName}.js`) || fs.existsSync(`./eze-InteractionHandler/interactions/${interaction.customId.split('-')[0]}.js`)) {
            try {
                if (interaction.isCommand()) {
                    require(`./interactions/${interaction.commandName}.js`).run(interaction,client,userVars)
                } else if (interaction.isButton()) {
                    const customIdArray = interaction.customId.split('-')
                    if (customIdArray[0] === 'DONT RUN') return
                    require(`./interactions/${customIdArray[0]}.js`).runButton(interaction, customIdArray, client, userVars)
                } else if (interaction.isSelectMenu()) {
                    const customIdArray = interaction.customId.split('-')
                    if (customIdArray[0] === 'DONT RUN') return
                    const selected = interaction.values
                    require(`./interactions/${customIdArray[0]}.js`).runMenu(interaction, customIdArray, selected, client, userVars)
                } else {
                    console.warn(`:: eze-InteractionHandler ::\n${interaction.type} is currently not supported by 'eze-InteractionHandler'`)
                }
            } catch (error) {
                console.error(`:: eze-InteractionHandler ::\n${error}`)
            }
        } else {
            try {
                let embed = new MessageEmbed()
                    .setTitle('Interaction Error')
                    .addField('Error Information:', `File \`./interactions/${(interaction.commandName || interaction.customId.split('-')[0])}.js\` does not exist!\nPlease contact the bot developers about this error!`)
                    .setColor('RED')
                if (interaction.isButton() || interaction.isSelectMenu()) embed.addField(`Button/SelectMenu Information`,`All Buttons & SelectMenu interactions `)
                interaction.reply({
                    embeds: [
                    ],
                    ephemeral: true
                })
            } catch (error) {
                console.error(`:: eze-InteractionHandler ::\n${error}`)
            }
        }
    }
}
