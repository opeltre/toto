# Setup guide

Toto runs in [nodejs](https://nodejs.org):
best installed via [nvm](https://github.com/creationix/nvm).

## Installation:

Download the npm package to a directory of your choice: 
```bash
$ cd /srv/http/<my-server>
$ npm i totojs
```
Run it with:
```bash
$ node node_modules/totojs/main.js
```
The default server should now be listening on port 8090 of your machine. 

## Configuration: 


Create a launch file with your favorite text editor:

```javascript
// toto.js

let toto = require('totojs');

let config = {
    port: 80,   
    index: 'index.html',
    dirs: [
        {
            path : '<path-to-my-dir>',
            href : '<url-to-my-dir>'
        },{
            path : '<path-to-other-dir>',
            href : '<url-to-other-dir>'
        }
    ],
};

toto.server(config);
```

Run it with: 

```bash
$ sudo node toto.js 
```

## Troubleshooting:

The default HTTP port is 80 and root-reserved, 
so root needs a working node installation.

If you are unsure of the superuser's node installation, 
try listening on available ports above 1024 as your own user.

## Process monitoring: 

You can use [pm2](http://pm2.keymetrics.io/)
to run toto in the background: 

```
$ npm i pm2
$ sudo pm2 start toto.js --watch
```
