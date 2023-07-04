exports.EmbedUpdaterBuilder = class EmbedUpdaterBuilder {
    constructor(data = {}) {
        this.data = data
    };

    setEmbeds(embeds) {
        this.data.embeds = [...embeds];
        return this;
    }
    setComponents(actionRows) {
        this.data.components = [...actionRows];
        return this;
    }
    async componentExecute(interaction) {
        return interaction.update({ embeds: this.data.embeds, components: this.data.components });
    }
}