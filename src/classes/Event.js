exports.Event = class Event {
    constructor(options) {
        this.name = options.name;
        this.once = options.once || false;
    }

    hasPermission(options) {
        const { member, permission } = options;
        return member.guild.members.me.permissions.has(permission)
    }

    isDMChat(channel) {
        return this.directChatId === channel.id
    }
}
