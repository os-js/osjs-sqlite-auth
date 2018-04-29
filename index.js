/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

const path = require('path');
const sqlite = require('sqlite3');
const bcrypt = require('bcrypt-nodejs');
const {Auth} = require('@osjs/server');

const queryGet = (db, query, args = []) => new Promise((resolve, reject) => {
  db.get(query, args, (err, res) => err ? reject(err) : resolve(res));
});

const encryptPassword = password => new Promise((resolve, reject) => {
  bcrypt.hash(password, null, null, (err, hash) => err ? reject(err) : resolve(hash));
});

const comparePassword = (password, hash) => new Promise((resolve, reject) => {
  bcrypt.compare(password, hash, (err,res) => resolve(res === true));
});

const createDefaultUsers = users => {
  const promise = user => encryptPassword(user.password)
    .then(password => Object.assign({}, user, {password}));

  return users.map(promise);
};

const createDefaultDatabase = async (options) => {
  const insertUsers = await Promise.all(createDefaultUsers(options.users));
  console.log('Using authentication database', options.database);

  const insert = user => db.run('INSERT INTO users (id, username, password) VALUES(NULL, ?, ?)', [
    user.username,
    user.password
  ]);

  const db = new sqlite.Database(options.database, () => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username VARCHAR NOT NULL, password VARCHAR NOT NULL)', () => {
      insertUsers.forEach(user => insert(user));
    });
  });

  return db;
};

module.exports = (core, options) => {
  let db;

  const defaultPath = path.join(core.options.root, 'osjs.sqite');

  const settings = Object.assign({
    database: defaultPath,
    users: [{
      username: 'demo',
      password: 'demo'
    }]
  }, options);

  return {
    init: async() => {
      db = await createDefaultDatabase(settings);
    },

    destroy: () => db.close(),

    logout: () => Promise.resolve(true),

    login: async (req, res) => {
      const {username, password} = req.body;
      const foundUser = await queryGet(db, 'SELECT * FROM users WHERE username = ?', [username]);
      const validUser = foundUser ? await comparePassword(password, foundUser.password) : false;
      return validUser ? foundUser : false;
    }
  };
};
