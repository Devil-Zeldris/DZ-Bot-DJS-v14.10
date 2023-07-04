const { ThreadAutoArchiveDuration } = require('discord.js');
const { Command } = require('../classes/command');

module.exports = class EmbedCommand extends Command {
    constructor() {
        super({ cmd: `embed`, components: [], owner: true })
    }

    async commandExecute(interaction) {
        const { client, options } = interaction;
        const collection = client.database.getCollection({ collName: 'embeds' });

        await interaction.deferReply({ ephemeral: true });
        if (options.getBoolean('update')) {
            await this.#update({ interaction, collection, hook });
            return interaction.editReply({ content: `Message updated` })
        }
        await this.#put({ interaction, collection });
    }
    async componentExecute(interaction) { };

    async #update(data) {
        const { interaction, collection } = data;
        const { options, channel } = interaction;
        const embed = await collection.findOne({ name: `${interaction.options.getString('name')}` }, { projection: { _id: 0, roles: 0, name: 0 } })

        if (!embed) return interaction.editReply({ content: `No embed found`, ephemeral: true });

        const message = await channel.messages.fetch(options.getString(`message_id`));
        const { content, embeds, components } = embed;

        if (!message.author.flags) return hook.editMessage(message, { content, embeds, components });

        await message.edit({ content, embeds, components });
        return interaction.editReply({ content: `Done!`, ephemeral: true });
    }

    async #put(data) {
        const { interaction, collection } = data;
        const { channel, options } = interaction;
        const embed = await collection.findOne({ name: `${options.getString('name')}` }, { projection: { _id: 0, roles: 0, name: 0 } })

        if (!embed) return interaction.editReply({ content: `No embed found`, ephemeral: true });

        const { username, avatarURL, content, embeds, components, thread } = embed;
        if (!username) {
            const message = await channel.send({ content, embeds, components });
            if (thread) {
                await message.startThread({
                    name: message.embeds[0].title,
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                    reason: `Created a new thread in ${message.channel.name} channel`
                })
            }
            return interaction.editReply({ content: `Done`, ephemeral: true });

        }
        const hook = await this.getHook(channel) || await this.createHook(channel);
        const hookedMessage = await hook.send({ username, avatarURL, content, embeds, components })
        if (thread) await hookedMessage.startThread({
            name: hookedMessage.embeds[0].title,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            reason: `Created a new thread in ${hookedMessage.channel.name} channel`
        })
        return interaction.editReply({ content: `Done`, ephemeral: true });
    }
}