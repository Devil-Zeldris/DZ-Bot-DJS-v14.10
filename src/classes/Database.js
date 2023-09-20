const { MongoClient } = require("mongodb");

exports.DevilClientDB = class DevilClientDB extends MongoClient {
    constructor(options) {
        super(options);
    }

    getCollection(options) {
        const { collName } = options
        const collection = this.db(process.env.DB_NAME).collection(collName);

        return collection
    }

}