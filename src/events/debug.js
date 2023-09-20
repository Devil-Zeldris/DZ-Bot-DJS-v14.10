const { Events } = require("discord.js");
const { Event } = require("../classes/Event");

module.exports = class DebugEvent extends Event {
    constructor() {
        super({ name: Events.Debug, once: false });
    }
    execute() {
        return console.log
    }
}