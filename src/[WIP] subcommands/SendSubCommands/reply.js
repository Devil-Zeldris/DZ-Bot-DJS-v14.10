const { TextInputStyle } = require('discord.js')
const { SendCommand } = require(`../../commands/send`)

module.exports = class ReplyCommand extends SendCommand {
    construector() {
        super({ cmd: 'reply', owner: true })
    }

    async execute(interaction) {
        const { channel } = interaction;
        const replyInput = new ActionRowBuilder()
            .addComponents(new TextInputBuilder()
                .setCustomId('reply')
                .setLabel(`Message for sending to ${channel.name}`)
                .setStyle(TextInputStyle.Paragraph)
                .setMinLength(1)
                .setMaxLength(4000)
            );
        const replyModal = new ModalBuilder()
            .setCustomId(`replyToMessage`)
            .setTitle(`Reply to message`)
            .addComponents(replyInput)

        await interaction.showModal(replyModal);

        const replyModalInteraction = await interaction.awaitModalSubmit({ filter: (interaction) => interaction.customId === 'replyToMessage', time: 600000 });
        const { channel: targetChannel, fields } = replyModalInteraction;

        await replyModalInteraction.deferReply({ ephemeral: true });
        await this.typingDelay(targetChannel)

        await channel.send({ content: fields.getTextInputValue(`reply`), reply: { messageReference: targetMessage?.id } });
        await replyModalInteraction.editReply({ content: `Message replied`, ephemeral: true })
    }
}