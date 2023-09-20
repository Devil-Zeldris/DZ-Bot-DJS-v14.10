const { ChannelType } = require('discord.js');
const { Direct } = require('../classes/Direct');

module.exports = class DirectMessagesChat extends Direct {
    constructor() {
        super({ type: [ChannelType.PublicThread, ChannelType.PrivateThread] })
    }

    async typing(typing) {
        const { user, client, channel } = typing;
        if (user.bot) return;
        const userDM = await client.users.fetch(channel.name);
        if (!user.dmChannel) return userDM.createDM()
        return userDM.dmChannel.sendTyping().catch();
    }

    async execute(message) {
        const { author, channel, client, content, attachments, stickers } = message;
        const user = await client.users.fetch(channel.name);

        if (author.bot) return;
        if (!user.dmChannel) return user.createDM();

        return user?.send({ content, files: [...attachments.values()], stickers }).catch();
    }
}