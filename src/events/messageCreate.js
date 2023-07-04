const { Events, ChannelType } = require('discord.js');
const { Event } = require('../classes/event');

module.exports = class MessageCreateEvent extends Event {
    constructor() {
        super({ name: Events.MessageCreate, once: false })
    }

    async execute(message) {
        const { channel, client, guild } = message;

        const chat = client.direct.get(channel.type);
        if ((chat?.type.includes(channel.type) && chat?.isDMChat(channel)) || chat?.type.includes(ChannelType.DM)) return chat.execute(message);
        return;
    }
}