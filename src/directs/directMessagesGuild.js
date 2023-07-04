const { Direct } = require(`../classes/direct`)
const { ThreadAutoArchiveDuration, ChannelType } = require(`discord.js`);

module.exports = class DirectMessagesGuild extends Direct {
    constructor() {
        super({ type: [ChannelType.DM] });
        this.hookProfile = {
            name: `Direct Messages`,
            avatar: `https://media.discordapp.net/attachments/761694168758091797/1066049588433264772/pngaaa.com-1423371.png`,
            reason: `Created direct messages chats`
        }
        this.threadOptions = {
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            reason: 'A new DM channel'
        }
    }
    async typing(typing) {
        const { client, user } = typing;
        const dmChannel = await client.channels.fetch(process.env.DM_CHANNEL_ID);
        const threads = this.getThreads(dmChannel);
        const dmThread = threads.get('active')?.find(thread => thread.name === user.id) || threads.get('archived')?.find(thread => thread.name === user.id);

        return dmThread?.sendTyping().catch();
    }

    async execute(message) {
        const { author, client, attachments, stickers } = message;

        if (author.bot) return;

        const dmGuildChannel = await client.channels.fetch(this.directChatId);
        const threads = await this.getDMThreads({ channel: dmGuildChannel });
        const dmThread = threads.get('active').find(thread => thread.name === author.id) || threads.get('archived').find(thread => thread.name === author.id) || await dmChannel.threads.create({ name: author.id, ...this.threadOptions })
        const hook = await this.getHook({ channel: dmGuildChannel }) || await this.createHook({ channel: dmGuildChannel });
        const { username } = author;


        return hook.send({
            username,
            avatarURL: author.avatarURL({ format: 'png', size: 4096, dynamic: true }),
            threadId: dmThread.id,
            content: message.content.length === 0 ? undefined : message.content,
            files: [...attachments.values()],
            stickers
        })
    }
}