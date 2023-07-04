require('dotenv').config()
const { intents, partials } = require('./config.json')
const { DevilClient } = require('./classes/Client');

const client = new DevilClient({
    intents,
    partials,
    token: process.env.TOKEN,
    url: process.env.DB_URL,
    failIfNotExists: false
})

client.init()
    .then(() => console.log(`[INIT]`, `All systems initialized`))
    .catch((err) => console.log(`[INIT]`, `Failed to initialize`, err))