const { Client, Collection } = require('discord.js');
const { Handler } = require('./Handler')
const { DevilClientDB } = require('./Database')

exports.DevilClient = class DevilClient extends Client {
    constructor(options) {
        super(options);
        this.handler = new Handler(this);
        this.database = new DevilClientDB(this.options.url);
        this.invitedMembersCache = new Collection();
        this.events = this.handler.events;
        this.commands = this.handler.commands;
        this.direct = this.handler.direct;
    };

    async init() {
        await this.database.connect(this.options.url)
            .then(() => console.log(`[MONGO_DB]`, `Connected to MongoDB`))
            .catch(err => console.error());
        await this.login(this.options.token)
            .then(() => console.log(`[LOGIN]`, `Logged in as ${this.user.username}`))
            .catch(err => console.error)
    };

    get ownerId() {
        return process.env.OWNER_ID;
    };

    get guildId() {
        return process.env.GUILD_ID;
    };

    getCollection(options) {
        const collection = this.database.db(options.dbName || process.env.DB_NAME).collection(options.collName);

        return collection
    }
}
