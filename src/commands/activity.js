const { Command } = require(`../classes/command`);

module.exports = class ActivityCommand extends Command {
    constructor() {
        super({ cmd: `activity`, components: [], owner: true })
    }
    async commandExecute(interaction) {
        const { options, client } = interaction;

        client.user.setActivity({ name: options.getString(`title`), url: options.getString(`url`), type: Number(options.getString(`type`)) })
        return interaction.reply({ content: `Activity updated`, ephemeral: true })
    };
    async componentExecute(interaction) { }
}