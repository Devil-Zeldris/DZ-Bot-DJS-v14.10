const { Events } = require('discord.js');
const { Event } = require('../classes/event');

module.exports = class TypingStartEvent extends Event {
    constructor() {
        super({ name: Events.TypingStart, once: false })
    }
    execute(typing) {
        const { channel, client } = typing;
        const chat = client.direct.get(channel.type);

        if (chat && chat?.isDMChat(channel)) return chat.execute(typing);
        return;
    }
}