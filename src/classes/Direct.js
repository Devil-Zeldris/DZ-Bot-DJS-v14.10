const { Collection } = require("discord.js");

exports.Direct = class Direct {
    constructor(options) {
        this.type = [].concat(options.type);
        this.directChatId = process.env.DM_CHANNEL_ID;
        this.DMThreads = new Collection()
    };

    isDMChat(channel) {
        return this.directChatId === channel.id
    };

    async getDMThreads(options) {
        const { channel } = options;
        const activeThreads = await channel.threads.fetchActive();
        const archivedThreads = await channel.threads.fetchArchived();
        const threads = new Collection()
        // console.log(`THREADS`, activeThreads.threads, archivedThreads);
        threads
            .set('active', activeThreads.threads)
            .set('archived', archivedThreads.threads)
        // console.log(`GET THREADS`, threads);

        return threads;
    }
    async getHook(options) {
        const { channel } = options;
        const { client } = channel;
        const hooks = await channel.fetchWebhooks();
        const hook = hooks.find(hook => hook.owner.id === client.user.id)

        return hook;
    }
    async createHook(options) {
        const { channel } = options
        return channel.createWebhook(this.hookProfile)
    }
}