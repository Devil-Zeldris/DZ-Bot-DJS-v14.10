const { GatewayDispatchEvents, Events } = require("discord.js");
const { Event } = require("../classes/event");

module.exports = class DebugEvent extends Event {
    constructor() {
        super({ name: Events.Debug, once: false });
    }
    execute() {
        return console.log
    }
}