const { Event } = require('../classes/event');
const { Collection, GatewayDispatchEvents, Events } = require('discord.js');
const { commandments, rolesForGive } = require('../config.json');

module.exports = class GuildMemberUpdateEvent extends Event {
    constructor() {
        super({ name: Events.GuildMemberUpdate, once: false });
        this.commandments = new Collection(commandments.map(commandment => [commandment.id, { name: commandment.name, subrole: commandment.subrole }]))
    }
    async execute(oldMember, newMember) {
        if (!newMember.pending && oldMember.pending) {
            await this.#giveTraceFromCommandment(newMember);
            await this.#addMemberToDatabase(newMember);
        }
        return;
    }
    async #giveTraceFromCommandment(member) {
        const { client, guild, roles } = member;
        const invitedMember = client.invitedMembersCache.get(member.id);

        if (!invitedMember) return;

        const inviter = await guild.members.fetch(invitedMember.inviterId)
        const role = inviter.roles.cache.find(role => this.commandments.get(role.id));

        if (!role) return roles.add(rolesForGive);
        return roles.add([this.commandments.get(role.id).subrole, ...rolesForGive]);
    }

    async #addMemberToDatabase(member) {
        const { client, id, guild } = member;
        const users = client.database.getCollection({ collName: 'users' });
        const user = await users.findOne({ id, guildId: guild.id }, { projection: { id: 1, guildId: 1 } });

        if (!user && guild.id === client.guildId) return users.insertOne({ id, guildId: guild.id, coins: { name: 'Gold', count: 10000 }, premiumCoins: { name: 'Jewels', count: 100 }, inventory: [], status_effects: [], roles: [], expirience: { level: 1, count: 0 } })
        return;
    }

}