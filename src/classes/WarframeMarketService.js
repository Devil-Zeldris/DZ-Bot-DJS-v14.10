const { Collection } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.WarframeMarketService = class WarframeMarketService {
    constructor() {
        this.api = {
            link: "https://api.warframe.market/v1",
            assets: "https://warframe.market/static/assets",
            items: `https://api.warframe.market/v1/items`,
            missions: `https://api.warframe.market/v1/missions`,
            npcs: `https://api.warframe.market/v1/npc`,
            locations: `https://api.warframe.market/v1/locations`
        };
        this.items = new Collection()
        this.orders = new Collection();
        this.dropsources = new Collection();
        this.locations = new Collection();
        this.missions = new Collection();
    };

    async getItems(options) {
        const { language } = options;
        const locale = language > 2 ? language.substring(0, 2) : language || `en`;
        const response = await fetch(this.api.items, { method: `GET`, headers: { Language: locale } })
        const { payload } = await response.json()

        for (const item of payload.items) this.items.set(item.item_name, item)

        return this.items;
    };

    async getItemByUrlName(options) {
        const { url_name } = options;
        const response = await fetch(`${this.api.items}/${url_name}`, { method: `GET`, Platform: `pc` });
        const { payload } = await response.json();

        return payload.item.items_in_set;
    };

    async getItemById(options) {
        const { id, language } = options;
        const locale = language > 2 ? language.substring(0, 2) : language
        const items = await this.getItems({ Language: locale });
        const item = items.find(item => item.id === id);

        return item;
    };

    async getOrdersByUrlName(options) {
        const { url_name, language } = options;
        const locale = language > 2 ? language.substring(0, 2) : language || `en`
        const response = await fetch(`${this.api.items}/${url_name}/orders`, { method: `GET`, Language: locale });
        const { payload } = await response.json();
        const orders = new Collection();

        this.orders.set('buy', payload.orders.filter(order => order.order_type === 'buy'));
        this.orders.set('sell', payload.orders.filter(order => order.order_type === 'sell'));

        return this.orders;
    };

    async getDropsourcesByUrlName(options) {
        const { language, url_name } = options;
        const locale = language > 2 ? language.substring(0, 2) : language || `en`
        const response = await fetch(`${this.items}/${url_name}/dropsources`, { method: `GET`, Language: locale });
        const { payload } = await response.json();

        for (const source of payload.dropsources) dropsources.set(source.id, source);

        return this.dropsources;
    };

    async getLocations(options) {
        const { language } = options;
        const locale = language > 2 ? language.substring(0, 2) : language || `en`
        const response = await fetch(`${this.api.locations}`, { method: `GET`, Language: locale });
        const { payload } = await response.json();

        for (const location of payload.locations) this.locations.set(location.id, location)

        return this.locations;
    };

    async getNpcs(options) {
        const { language } = options;
        const locale = language > 2 ? language.substring(0, 2) : language || `en`;
        const response = await fetch(`${this.npcs}`, { method: `GET`, Language: locale });
        const { payload } = await response.json()

        for (const npc of payload.npc) this.npcs.set(npc.id, npc);

        return this.npcs;
    };

    async getMissions(options) {
        const { language } = options;
        const locale = language > 2 ? language.substring(0, 2) : language || `en`
        const response = await fetch(`${this.missions}`, { method: `GET`, Language: locale });
        const { payload } = await response.json();

        for (const mission of payload.missions) this.missions.set(mission.id, mission);

        return this.missions
    };
};