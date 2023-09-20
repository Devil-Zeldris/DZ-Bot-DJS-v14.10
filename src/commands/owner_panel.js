const { Collection } = require("discord.js");
const { Command } = require("../classes/Command");

module.exports = class OwnerPanelCommand extends Command {
    constructor() {
        super({ cmd: 'panel', components: ['updateGuildCommands', 'updateGlobalCommands', 'resetCommands', 'createGuildCommands', 'createGlobalCommands'], owner: true });
        this.actions = new Collection()
            .set('updateGuildCommands', this.#updateGuildCommands)
            .set('updateGlobalCommands', this.#updateGlobalCommands)
            .set('resetCommands', this.#resetCommands)
            .set('createGuildCommands', this.#createGuildCommands);
    }

    async commandExecute(interaction) {
        await interaction.deferReply({ ephemeral: true })

        const { client } = interaction;
        const collection = await client.database.getCollection({ collName: 'embeds' })
        const { embeds, components } = await collection.findOne({ name: `Owner Panel` }, { projection: { _id: 0 } })
        // this.actions.get(commandName)(interaction)
        return interaction.editReply({ embeds, components, ephemeral: true })
    };

    async componentExecute(interaction) {
        const { customId } = interaction;
        this.actions.get(customId)(interaction)
        return;
    };

    #createGuildCommands = async interaction => {
        const { client, guild } = interaction;
        const collection = await client.database.getCollection({ collName: 'commands' });
        const commands = await collection.find({ $or: [{ guildsIds: guild.id }, { guildsIds: `any` }] }, { projection: { _id: 0, scope: 0, guildsIds: 0 } })

        await guild.commands.set(commands);
        return interaction.editReply({ content: `Commands created in ${guild.name}, ID: ${guild.id}` })
    }

    #updateGuildCommands = async (interaction) => {
        await interaction.deferReply({ ephemeral: true })
        const { client, guild } = interaction;
        const collection = await client.database.getCollection({ collName: `commands` })
        const commands = await collection.find({ $or: [{ guildIds: guild.id }, { guildIds: "any" }] }, { projection: { _id: 0, guildIds: 0 } }).toArray();

        await guild.commands.set(commands, guild.id);
        return interaction.editReply({ content: `Commands updated successfully`, ephemeral: true });
    }

    #updateGlobalCommands = async (interaction) => {
        await interaction.deferReply({ ephemeral: true })
        const { client } = interaction;
        const collection = await client.database.getCollection({ collName: `commands` })
        const commands = await collection.find({ scope: `GLOBAL` }, { projection: { _id: 0, guildsIds: 0 } });

        await client.application.commands.set(commands);
        return interaction.editReply({ content: `Global commands updated successfully`, ephemeral: true });
    }

    #resetCommands = async (interaction) => {
        await interaction.deferReply({ ephemeral: true })
        const { client } = interaction;
        const guilds = await client.guilds.fetch();

        await client.application.commands.set([]);
        for (const guild of guilds) {
            const { id, name } = guild
            await client.application.commands.set([], id);
            console.log(`[PANEL]`, `Commands deleted from guild with id ${name}`)
        }
        return interaction.editReply({ content: `Commands deleted successfully`, ephemeral: true });
    }

}