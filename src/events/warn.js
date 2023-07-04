const { Events } = require('discord.js');
const { Event } = require('../classes/event');

module.exports = class WarnEvent extends Event {
    constructor() {
        super({ name: Events.Warn, once: false });
    }
    execute() {
        return console.log;
    }
}