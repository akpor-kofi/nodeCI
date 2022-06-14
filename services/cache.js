const mongoose = require("mongoose");
const redis = require("redis");
const keys = require("../config/keys");
const client = {};

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = options.key || "default";

  return this;
};

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
  const clientInstance = redis.createClient({ url: keys.redisUrl });
  client.clientInstance = clientInstance;

  await client.clientInstance.connect();
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.model.collection.name,
    })
  );

  const cachedValue = await client.clientInstance.hGet(this.hashKey, key);
  if (cachedValue) {
    console.log("serving from cache");
    const doc = JSON.parse(cachedValue);

    Array.isArray(doc)
      ? doc.map((d) => this.model.hydrate(d))
      : this.model.hydrate(doc);
  }

  const result = await exec.apply(this, arguments); // mongoose document instance
  await client.clientInstance.hSet(this.hashKey, key, JSON.stringify(result));

  console.log("serving from mongo db");
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.clientInstance.del(hashKey);
  },
};
