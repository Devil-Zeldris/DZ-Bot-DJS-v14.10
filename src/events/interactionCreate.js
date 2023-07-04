const { GatewayDispatchEvents, Events, Collection, Locale } = require("discord.js");
const { Event } = require("../classes/event");
const localizations = new Collection()
localizations
    .set(Locale.EnglishGB, {
        NoInfoText: "No information found.",
        NoPermissionsText: "You do not have permissions for use.",
    })
    .set(Locale.EnglishUS, {
        NoInfoText: "No information found.",
        NoPermissionsText: "You do not have permissions for use."
    })
    .set(Locale.Russian, {
        NoInfoText: "Информация не найдена.",
        NoPermissionsText: "Нет прав на использование."
    })
    .set(Locale.Ukrainian, {
        NoInfoText: "Інформація не знайдена",
        NoPermissionsText: "Немає прав на використання."
    });

module.exports = class InteractionCreateEvent extends Event {
    constructor() {
        super({ name: Events.InteractionCreate, once: false })
    }

    async execute(interaction) {
        const { commandName, customId, client, member, locale } = interaction;
        const command = client.commands.get(commandName || customId);
        const localeTexts = localizations.get(locale)
        if (interaction.isCommand()) {
            if (!command?.isOwner(member) && command?.owner) return interaction.reply({ content: `${localeTexts.NoPermissionsText}`, ephemeral: true });
            return command?.commandExecute(interaction);
        };
        if (interaction.isButton() || interaction.isAnySelectMenu()) {
            if (!command) return interaction.reply({ content: `${localeTexts.NoInfoText}`, ephemeral: true });
            return command?.componentExecute(interaction)
        }
        return;
    }
}