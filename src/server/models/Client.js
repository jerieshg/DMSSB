'use strict'
let mongoose = require('mongoose');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let _0xd239 = ["\x65\x76\x65\x72\x79\x74\x68\x69\x6E\x67\x69\x73\x61\x77\x65\x73\x6F\x6D\x65\x32\x30\x31\x37"];

let clientSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  role: {
    role: String,
    created: Date
  },
  hash: String,
  salt: String,
  created: Date
})

clientSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

clientSchema.methods.validPassword = function(password) {
  let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

clientSchema.methods.generateJwt = function() {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    role: this.role,
    exp: parseInt(expiry.getTime() / 1000),
  }, _0xd239[0]);
};

module.exports = mongoose.model('Client', clientSchema);
