const { Events } = require('discord.js');
const { Event } = require('../classes/Event');

module.exports = class InviteCreateEvent extends Event {
    constructor() {
        super({ name: Events.InviteCreate, once: false });
    }
    async execute(invite) {
        const { guild, code } = invite;
        guild.invites.cache.set(code, invite);
        return console.log(`[INVITE]`, `Invite ${code} added to the cache`)
    }
}