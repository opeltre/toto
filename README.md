# toto.js

```
(0 + 0) __ salut c'est toto!
```

# Installation:

Download the npm package to the directory of your choice: 
```bash
$ cd /srv/http/<my-server>
$ npm i totojs
```
Run it using the default configuration with:
```bash
$ sudo node node_modules/totojs/server.js
```
The server should now be listening on port 80 of your machine. 

# Configuration: 

Create your own server configuration with your favorite text editor:

```javascript
// server.js

require('totojs/main')({
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
});
```

You may now run it with: 
```
$ sudo node server.js
```

# Troubleshooting:

The superuser needs a working node installation to listen on port 80.  
If you are unsure of the superuser's node installation, try listening  
on a higher port as your own user:

```javascript
// server.js
require('totojs/main')({port: 8080});
```

