<p align="center">
  <img alt="OS.js Logo" src="https://raw.githubusercontent.com/os-js/gfx/master/logo-big.png" />
</p>

[OS.js](https://www.os-js.org/) is an [open-source](https://raw.githubusercontent.com/os-js/OS.js/master/LICENSE) desktop implementation for your browser with a fully-fledged window manager, Application APIs, GUI toolkits and filesystem abstraction.

[![Community](https://img.shields.io/badge/join-community-green.svg)](https://community.os-js.org/)
[![Donate](https://img.shields.io/badge/liberapay-donate-yellowgreen.svg)](https://liberapay.com/os-js/)
[![Donate](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=andersevenrud%40gmail%2ecom&lc=NO&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted)
[![Support](https://img.shields.io/badge/patreon-support-orange.svg)](https://www.patreon.com/user?u=2978551&ty=h&u=2978551)

# OS.js v3 Sqlite Auth Provider

This is the Sqlite Auth Provider for OS.js v3

## Usage

### Server

In your server bootstrap script (`src/server/index.js`) modify the provider registration:

```
const sqliteAuth = require('@osjs/sqlite-auth');

core.register(AuthServiceProvider, {
  args: {
    adapter: sqliteAuth.adapter,
    config: {
      // Custom Database path
      //database: '/data/osjs.sqlite',
    }
  }
});
```

### CLI

To get CLI commands to manage users, you'll have to modify your CLI bootstrap script (`src/cli/index.js`):

```
const sqliteAuth = require('@osjs/sqlite-auth');

const sqliteCli = sqliteAuth.cli({
  // Custom Database path
  //database: '/data/osjs.sqlite',
});

module.exports = [sqliteCli];
```

You can no manage users with ex. `npx osjs-cli <task>`

Available tasks:

* `user:list` - Lists users
* `user:add --username=STR` - Adds user
* `user:pwd --username=STR` - Changes user password
* `user:remove --username=STR` - Removes user
