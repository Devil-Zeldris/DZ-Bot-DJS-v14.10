const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, Locale } = require('discord.js');
const { Command } = require('../classes/Command');
const { WarframeMarketService } = require('../classes/WarframeMarketService');
const { EmbedUpdaterBuilder } = require('../classes/EmbedUpdater');
const localizations = new Collection()
localizations
    .set(Locale.EnglishGB, {
        BuyOrdersText: 'Buy',
        SellOrdersText: 'Sell',
        RangeCostsText: 'Costs range',
        OrdersCountText: 'Orders count',
        ItemNotFoundText: 'No item found',
        DescriptionButtonText: 'Item description',
        OrdersButtonText: 'Item orders',
        TradeTaxText: 'Trade Tax',
        DucatCostText: 'Ducats',
        NoPrimeItemText: 'Not prime part',
        LinkToPageText: 'Market',
        CheckActualityText: 'Check costs actuality on market! Can be changed at any time',
        MasteryLevelText: 'Mastery level',
        ModMaxRankText: 'Mod max rank',
    })
    .set(Locale.EnglishUS, {
        BuyOrdersText: 'Buy',
        SellOrdersText: 'Sell',
        RangeCostsText: 'Costs range',
        OrdersCountText: 'Orders count',
        ItemNotFoundText: 'No item found',
        DescriptionButtonText: 'Item description',
        OrdersButtonText: 'Item orders',
        TradeTaxText: 'Trade Tax',
        DucatCostText: 'Ducats',
        NoPrimeItemText: 'Not prime part',
        LinkToPageText: 'Market',
        ActualityAtText: 'Actuality at moment of',
        CheckActualityText: 'Check costs actuality on market! Can be changed at any time',
        MasteryLevelText: 'Mastery level',
        ModMaxRankText: 'Mod max rank',
    })
    .set(Locale.Russian, {
        BuyOrdersText: 'Покупка',
        SellOrdersText: 'Продажа',
        RangeCostsText: 'Разброс цен',
        OrdersCountText: 'Количество предложений',
        ItemNotFoundText: 'Предмет не найден',
        DescriptionButtonText: 'Описание предмета',
        OrdersButtonText: 'Торговые предложения',
        TradeTaxText: 'Торговый налог',
        DucatCostText: 'Дукаты',
        NoPrimeItemText: 'Не прайм часть',
        LinkToPageText: 'Маркет',
        CheckActualityText: 'Проверяйте актуальность цен на маркете! Цены могут поменяться в любое время.',
        MasteryLevelText: 'Ранг мастерства',
        ModMaxRankText: 'Макс. ранг мода',
    })
    .set(Locale.Ukrainian, {
        BuyOrdersText: 'Покупка',
        SellOrdersText: 'Продажа',
        RangeCostsText: 'Діапазон',
        CountOrdersText: 'Кількість',
        ItemNotFoundText: 'Предмет не знайдено',
        DescriptionButtonText: 'Опис предмета',
        OrdersButtonText: 'Торгові пропозиції',
        TradeTaxText: 'Податок на торгівлю',
        DucatCostText: 'Дукати',
        NoPrimeItemText: 'Not prime part',
        LinkToPageText: 'Маркет',
        CheckActualityText: 'Check costs actuality on market! Can be changed at any time!',
        MasteryLevelText: 'Mastery level',
        ModMaxRankText: 'Mod max rank',
    })

module.exports = class MarketCommand extends Command {
    constructor() {
        super({ cmd: `market`, components: [], owner: false })
        this.market = new WarframeMarketService()
    }

    async commandExecute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const { options, locale, client } = interaction;
        const localeText = localizations.get(locale);
        const substringedLocale = locale.length > 2 ? locale.substring(0, 2) : locale;
        const items = await this.market.getItems({ language: locale });
        const item = items.get(options.getString('item_name'));

        if (!item) return interaction.editReply({ content: `${localeText.ItemNotFoundText}`, ephemeral: true });

        const itemOrders = await this.market.getOrdersByUrlName({ url_name: item.url_name, language: locale });
        const itemInfo = await this.market.getItemByUrlName({ url_name: item.url_name, language: locale });

        const itemBuyInPlatinumOrders = [...itemOrders.get('buy')]
            .filter(order => order.user.status === `online` || order.user.status === `ingame`)
            .sort((a, b) => a.platinum - b.platinum);

        const itemSellInPlatinumOrders = [...itemOrders.get('sell')]
            .filter(order => order.user.status === `online` || order.user.status === `ingame`)
            .sort((a, b) => b.platinum - a.platinum);
        const infoEmbed = new EmbedBuilder()
            .setTitle(item.item_name)
            .setDescription(itemInfo[0][substringedLocale].description)
            .setURL(itemInfo[0][substringedLocale].wiki_link)
            .setThumbnail(`${this.market.api.assets}/${itemInfo[0][substringedLocale].icon || itemInfo[0].icon}`)
            .setFooter({ text: `${localeText.CheckActualityText}` })
            .setFields([
                { name: `${localeText.TradeTaxText}`, value: `<:credits:1125423824867950663> ${itemInfo[0].trading_tax}`, inline: true },
                { name: `${localeText.DucatCostText}`, value: `<:ducats:1125423826688299171> ${itemInfo[0].ducats || localeText.NoPrimeItemText}`, inline: true },
                { name: `${localeText.MasteryLevelText}`, value: `${itemInfo[0].mastery_level || 0}`, inline: true },
                { name: `${localeText.ModMaxRankText}`, value: `${itemInfo[0].mod_max_rank || 0}`, inline: true },
            ]);

        const ordersEmbed = EmbedBuilder.from(infoEmbed)
            .setFields([
                { name: `${localeText.SellOrdersText}`, value: `**${localeText.RangeCostsText}:** <:platinum:1125423829334884352> ${itemSellInPlatinumOrders[0].platinum} - <:platinum:1125423829334884352> ${itemSellInPlatinumOrders[itemSellInPlatinumOrders.length - 1].platinum}\n**${localeText.OrdersCountText}**: ${itemSellInPlatinumOrders.length}`, inline: true },
                { name: `${localeText.BuyOrdersText}`, value: `**${localeText.RangeCostsText}:** <:platinum:1125423829334884352> ${itemBuyInPlatinumOrders[0].platinum} - <:platinum:1125423829334884352> ${itemBuyInPlatinumOrders[itemBuyInPlatinumOrders.length - 1].platinum}\n**${localeText.OrdersCountText}**: ${itemBuyInPlatinumOrders.length}`, inline: true },
            ])

        const infoButton = new ButtonBuilder()
            .setCustomId(`${item.url_name}_${locale}_info`)
            .setLabel(`${localeText.DescriptionButtonText}`)
            .setStyle(ButtonStyle.Primary);

        const ordersButton = new ButtonBuilder()
            .setCustomId(`${item.url_name}_${locale}_orders`)
            .setLabel(`${localeText.OrdersButtonText}`)
            .setStyle(ButtonStyle.Primary);

        const urlButton = new ButtonBuilder()
            .setURL(`https://warframe.market/items/${item.url_name}`)
            .setLabel(`${localeText.LinkToPageText}`)
            .setStyle(ButtonStyle.Link)

        client.commands
            .set(infoButton.data.custom_id, new EmbedUpdaterBuilder()
                .setEmbeds([infoEmbed])
                .setComponents([
                    new ActionRowBuilder()
                        .addComponents([
                            ButtonBuilder.from(infoButton)
                                .setDisabled(true),
                            ordersButton,
                            urlButton
                        ])]))
            .set(ordersButton.data.custom_id, new EmbedUpdaterBuilder()
                .setEmbeds([ordersEmbed])
                .setComponents([new ActionRowBuilder()
                    .addComponents([
                        infoButton,
                        ButtonBuilder.from(ordersButton).setDisabled(true),
                        urlButton
                    ])]));

        return interaction.editReply({
            embeds: [infoEmbed],
            components: [new ActionRowBuilder()
                .addComponents([
                    ButtonBuilder.from(infoButton)
                        .setDisabled(true),
                    ordersButton,
                    urlButton
                ])],
            ephemeral: true,
        });
    };

    async componentExecute(interaction) {

    };
}