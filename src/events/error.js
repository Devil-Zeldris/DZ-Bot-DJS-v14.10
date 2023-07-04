const { Events } = require('discord.js');
const { Event } = require('../classes/event');

module.exports = class ErrorEvent extends Event {
    constructor() {
        super({ name: Events.Error, once: false });
    }

    async execute(error) {
        const { stack } = error;
        console.log(`[ERROR]`, stack);
    }
}