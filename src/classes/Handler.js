const { readdirSync, lstatSync } = require('node:fs')
const { join } = require('node:path')
const { Collection } = require('discord.js')

exports.Handler = class Handler {
    constructor(client) {
        this.client = client
    }

    #walkSync(dir) {
        const files = readdirSync(dir);
        let paths = [];
        for (const file of files) {
            if (!lstatSync(join(dir, file)).isDirectory()) {
                paths.push(join(dir, file));
            }
        }
        return paths;
    }
    get events() {
        const events = this.#walkSync(join(__dirname, `../events`));
        events.map(event => new (require(event)))
            .forEach(event => {
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args));
                    console.log(`[EVENT]`, `${event.name} is loaded`)
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args))
                    console.log(`[EVENT]`, `${event.name} is loaded`)
                }
            });
        return;
    }

    get commands() {
        const files = this.#walkSync(join(__dirname, '../commands'))
        const commands = new Collection();

        for (const file of files) {
            const command = new (require(file));

            command.cmd.forEach(cmd => commands.set(cmd, command));
            command.components.forEach(component => {
                commands.set(component, command)
                console.log(`[COMMAND COMPONENT]`, `${component} is loaded`);
            });

            console.log(`[COMMAND]`, `${command.cmd} is loaded`);
        };

        return commands;
    }
    get direct() {
        const files = this.#walkSync(join(__dirname, '../directs'));
        const directs = new Collection()

        for (const file of files) {
            let directChat = new (require(file));
            directChat.type.forEach(type => directs.set(type, directChat));
        }
        return directs
    }
    //experimental features
    // getSubCommands(dir) {
    //     const paths = this.#walkSync(dir)
    //     const subcommands = new Collection()

    //     for (const path of paths) {
    //         let command = new (require(path))
    //         command.subCmd.forEach(cmd => this.commands.set(cmd, command))
    //     }
    //     return subcommands;
    // }

}
