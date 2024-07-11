const { MongoClient } = require("mongodb");
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const db = "db_nodejs";

module.exports = {
    client: client,
    db: db,
}
