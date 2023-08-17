const { StringSelectMenuBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder, PermissionsBitField, ChannelType, ThreadAutoArchiveDuration, StringSelectMenuOptionBuilder, PermissionFlagsBits, Collection, EmbedBuilder } = require("discord.js");
const { Command } = require(`../classes/command`)
//experimental features
//const { Handler } = require('../classes/handler')

module.exports = class SendCommand extends Command {
    constructor() {
        super({ cmd: [`send`, `Actions With Message`,], components: [`actions`, `reply`, `pin`, `delete`, `edit`], owner: true });
        this.actions = new Collection()
            .set('send', this.#send)
            .set('Actions With Message', this.#actionsWithMessage)
            .set('pin', this.#pin)
            .set('reply', this.#reply)
            .set('delete', this.#delete)
            .set('edit', this.#edit);
        this.targetMessage;
        //experimental features
        // this.handler = new Handler()
        // this.subcommands = handler.getSubcommands(join(__dirname, `./SendSubcommands`))
    }

    async commandExecute(interaction) {
        const { commandName, targetMessage } = interaction;
        this.targetMessage = targetMessage
        this.actions.get(commandName)(interaction);
        return;
    }
    async componentExecute(interaction) {
        const { values } = interaction;

        this.actions.get(values[0])({ interaction, targetMessage: this.targetMessage });
    };

    #actionsWithMessage = async interaction => await interaction.reply({ components: [this.actionsMenu], ephemeral: true });

    #send = async interaction => {
        const { options, channel, guild } = interaction;
        const content = options.getString(`message`) || undefined
        const files = options.getAttachment(`file`);
        const user = options.getUser(`user`);

        await interaction.deferReply({ ephemeral: true });
        if (user) {
            if (!this.hasPermissions({ guild, permissions: PermissionFlagsBits.ManageWebhooks })) return interaction.editReply({ content: `Can't manage webhooks.`, ephemeral: true });

            const hook = await this.getHook(channel) || await this.createHook(channel);

            await hook.send({ username: user.username, avatarURL: user.avatarURL({ format: 'png', size: 4096, dynamic: true }), content, files: files ? [files] : [] });
            return interaction.editReply({ content: `Done!`, ephemeral: true })
        }
        if (channel.type === ChannelType.GuildAnnouncement) {
            const regexp = new RegExp('<@(.*?)>', 'g');
            const replacedContent = content?.replace(regexp, '') || `Comments`;

            await this.typingDelay(channel);

            const threadName = `${replacedContent?.substring(0, 40)}...`;
            const message = await channel.send({ content, files: files ? [files] : [] });

            await message.startThread({ name: threadName, autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek })
            return interaction.editReply({ content: `Done!`, ephemeral: true });
        }

        await this.typingDelay(channel);
        await channel.send({ content, files: files ? [files] : [] });

        return interaction.editReply({ content: `Done!`, ephemeral: true });
    };

    #reply = async options => {
        const { interaction, targetMessage } = options;
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

        const replyModalInteraction = await interaction.awaitModalSubmit({ filter: (interaction) => interaction.customId === 'replyToMessage', time: 600000 }).catch();
        const { channel: targetChannel, fields } = replyModalInteraction;

        await replyModalInteraction.deferReply({ ephemeral: true });
        await this.typingDelay(targetChannel)

        await channel.send({ content: fields.getTextInputValue(`reply`), reply: { messageReference: targetMessage?.id } });
        return replyModalInteraction.editReply({ content: `Message replied`, ephemeral: true });
    }

    #pin = async options => {
        const { interaction, targetMessage } = options
        const { guild } = interaction;
        if (!targetMessage || !this.hasPermissions({ guild, permissions: PermissionFlagsBits.ManageMessages })) return interaction.reply({ content: `You dont have a permissions: requires **Manage Messages** Permission or no message for pin/unpin`, ephemeral: true })
        if (!targetMessage.pinned) {
            await targetMessage.pin(`Pinned message: ${targetMessage.content.substring(0, 40)}...`)
            return interaction.reply({ content: `Pinned message: ${targetMessage.content.substring(0, 40)}...`, ephemeral: true })
        };

        await targetMessage.unpin(`Unpinned message: ${targetMessage.content.substring(0, 40)}...`);

        return interaction.reply({ content: `Unpinned message: ${targetMessage.content.substring(0, 40)}...`, ephemeral: true })
    };

    #delete = async options => {
        const { interaction, targetMessage } = options;

        if (!targetMessage) return interaction.reply({ content: `No message to delete`, ephemeral: true });

        const { content } = targetMessage;

        await targetMessage.delete();

        return interaction.reply({ content: `Deleted message: ${content.substring(0, 40)}...`, ephemeral: true })
    };

    #edit = async options => {
        const { interaction, targetMessage } = options;

        if (!targetMessage) return interaction.reply({ content: `No message to editing`, ephemeral: true });

        const { guild } = interaction
        const editInput = new ActionRowBuilder()
            .addComponents(new TextInputBuilder()
                .setCustomId('edit')
                .setLabel('Enter text to editing')
                .setStyle(TextInputStyle.Paragraph)
                .setMinLength(1)
                .setMaxLength(4000)
            )
        const editModal = new ModalBuilder()
            .setCustomId('editMessage')
            .setTitle('Edit Message')
            .addComponents(editInput)

        await interaction.showModal(editModal)

        const editModalInteraction = await interaction.awaitModalSubmit({ filter: (interaction) => interaction.customId === 'editMessage', time: 600000 });
        const { fields } = editModalInteraction;

        if (guild.members.me.id !== targetMessage.member.id) return interaction.reply({ content: `Cant edit this message`, ephemeral: true });

        const editedMessage = await targetMessage.edit({ content: fields.getTextInputValue('edit') }).catch(() => undefined);

        if (!editedMessage) return editModalInteraction.reply({ content: `No message to editing or message is not yours.`, ephemeral: true });

        return editModalInteraction.reply({ content: `Message edited.`, ephemeral: true });
    }

    get actionsMenu() {
        const options = [
            new StringSelectMenuOptionBuilder().setLabel(`Reply`).setDescription(`[OWNER] Reply to that message`).setValue(`reply`).setEmoji({ id: '1069665061318180934', name: 'reply' }),
            new StringSelectMenuOptionBuilder().setLabel(`Pin/Unpin`).setDescription(`[OWNER] Pin that message`).setValue(`pin`).setEmoji({ id: '1069665056444399626', name: 'pin' }),
            new StringSelectMenuOptionBuilder().setLabel(`Delete`).setDescription(`[OWNER] Delete that message`).setValue(`delete`).setEmoji({ id: '1069667300816466020', name: 'delete' }),
            new StringSelectMenuOptionBuilder().setLabel(`Edit`).setDescription(`[OWNER] Edit that message`).setValue(`edit`).setEmoji({ id: '1070412128592343130', name: 'edit' })
        ];
        const actions = new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId('actions')
                .setOptions(options)
                .setPlaceholder(`[OWNER] Choose an action`)
            );

        return actions;
    }
}