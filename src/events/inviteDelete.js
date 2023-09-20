const { Events } = require('discord.js');
const { Event } = require('../classes/Event');

module.exports = class InviteDeleteEvent extends Event {
    constructor() {
        super({ name: Events.InviteDelete, once: false });
    }

    execute(invite) {
        const { guild, code } = invite;
        guild.invites.cache.delete(code);
        return console.log(`[INVITE]`, `Invite ${code} deleted from cache`);
    }
}