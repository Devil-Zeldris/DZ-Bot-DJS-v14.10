const { PermissionFlagsBits, Events } = require('discord.js');
const { Event } = require('../classes/Event');

module.exports = class GuildMemberAddEvent extends Event {
    constructor() {
        super({ name: Events.GuildMemberAdd, once: false });
    }
    execute(member) {
        if (this.hasPermission({ permission: PermissionFlagsBits.ManageGuild, member })) return this.#getUsedInvite(member);
        return;
    }

    async #getUsedInvite(member) {
        const { guild, client } = member;
        const invites = {
            old: guild.invites.cache,
            new: await guild.invites.fetch({ cache: false })
        };
        const invite = invites.new.find(invite => invite.uses > invites.old.get(invite.code).uses);

        if (!invite) return;

        invites.old.set(invite.code, invite);

        if (!client.invitedMembersCache) await guild.invites.fetch()

        client.invitedMembersCache?.set(member.id, invite);
        return;
    }
}