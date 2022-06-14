require("../models/User");

const mongoose = require("mongoose");
const keys = require("../config/keys");

jest.setTimeout(30000);

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);
