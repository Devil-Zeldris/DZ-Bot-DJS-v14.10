const { SlashCommandBuilder, Events, ActivityType, } = require('discord.js');
const { Event } = require('../classes/event');

module.exports = class ReadyEvent extends Event {
    constructor() {
        super({ name: Events.ClientReady, once: true })
    }
    async execute(client) {
        const { user, guilds } = client;
        const guild = await guilds.fetch(client.guildId);
        const panelCommand = new SlashCommandBuilder().setName(`panel`).setDescription(`[OWNER] Panel for settings`);

        await guild.invites.fetch();
        await client.application.commands.set([panelCommand]);
        client.user.setPresence({ activities: [{ name: `Your consequences...`, type: ActivityType.Playing, }], status: 'dnd', afk: false })
        console.log(`[EVENT]`, `${this.name} as ${user.username}`);
        return;
    }
}