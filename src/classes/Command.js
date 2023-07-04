const { setTimeout } = require('timers/promises')

exports.Command = class Command {
    constructor(options) {
        this.cmd = [].concat(options.cmd);
        this.components = [].concat(options.components)
        this.ownerId = process.env.OWNER_ID;
        this.owner = options.owner || false
    }

    isOwner(member) {
        const { id } = member
        return id === this.ownerId
    }
    async typingDelay(channel) {
        await channel.sendTyping()
        return setTimeout(3000)
    }

    async getHook(channel) {
        const { client } = channel;
        const hooks = await channel.fetchWebhooks();
        const hook = hooks.find(hook => hook.owner.id === client.user.id);
        return hook;
    }

    async createHook(channel) {
        const hookOptions = {
            name: `Piety Curse`,
            avatar: `https://media.discordapp.net/attachments/761694168758091797/1065642907308134470/Piety_Purple-1024.png`,
            reason: `Someone has been cursed`
        };
        const hook = await channel.createWebhook(hookOptions);

        return hook;
    }

    hasPermissions(options) {
        const { guild, permissions } = options;

        return guild.members.me.permissions.has(permissions);
    }
}