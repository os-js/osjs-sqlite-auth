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
const {queryGet, queryAll, query, createPassword} = require('./utils.js');

module.exports = (cfg = {}) => cli => {
  const config = Object.assign({
    database: path.join(cli.root, 'osjs.sqite')
  }, cfg);

  const db = new sqlite.Database(config.database);

  const listUsers = ({options, args}) => {
    return queryAll(db, 'SELECT * FROM users')
      .catch(err => console.error(err))
      .then(users => {
        users.forEach(user => console.log(`id: ${user.id} username: ${user.username}`));
      });
  };

  const addUser = ({options, args}) => {
    if (!args.username) {
      return Promise.reject('You need to specify --username');
    }

    return queryGet(db, 'SELECT * FROM users WHERE username = ?;', [args.username])
      .then(user => {
        if (user) {
          return Promise.reject('User already exists');
        }

        return createPassword().then(pwd => {
          return query(db, 'INSERT INTO users (id, username, password) VALUES(NULL, ?, ?)', [args.username, pwd]);
        });
      });
  };

  const pwdUser = ({options, args}) => {
    if (!args.username) {
      return Promise.reject('You need to specify --username');
    }

    return queryGet(db, 'SELECT * FROM users WHERE username = ?;', [args.username])
      .then(data => {
        return createPassword().then(pwd => {
          return query(db, 'UPDATE users SET password = ? WHERE id = ?', [pwd, data.id]);
        });
      });
  };

  const removeUser = ({options, args}) => {
    if (!args.username) {
      return Promise.reject('You need to specify --username');
    }

    return query(db, 'DELETE FROM users WHERE username = ?;', [args.username]);
  };

  return {
    'user:list': listUsers,
    'user:add': addUser,
    'user:pwd': pwdUser,
    'user:remove': removeUser
  };
};
