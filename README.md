# toto.js

```
( 0 + 0 )
```

- [github](https://github.com/opeltre/toto)
- [npm](https://npmjs.com/package/totojs)
- [totojs](http://peltre.xyz/code/totojs)

# Installation:

Download the npm package anywhere: 
```bash
$ cd /srv/http/<my-server>
$ npm i totojs
```
Dry-run it with:
```bash
$ node node_modules/totojs/main.js
```
The default server should now be listening on port 8090 of your machine. 


# Configuration: 

Create a launch file:

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

and run it with: 

```bash
$ sudo node toto.js
```

# Troubleshooting:

The default HTTP port is 80 and root-reserved, 
so root needs a working node installation.

If you are unsure of the superuser's node installation, try listening  
on available ports above 1024 as your own user)
