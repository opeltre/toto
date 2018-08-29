# toto.js

\[ \left(
\begin{array}{ccc}
\sim &  & \prec \\
0 & + & 0  \\
& \bigcup &
\end{array}
\right) \]

- toto is on [npm](https://npmjs.com/package/totojs)!
- toto is on [github](https://github.com/opeltre/toto)!

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
```
// server.js

let toto = require('totojs/server');

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

toto(config);

```

You may now run it with: 
```
$ sudo node server.js
```

# Process monitoring:

You can use pm2 to ensure your app stays online and updated: 

``` 
$ cp node_modules/totojs/server.config.js ./
$ npm i pm2
$ sudo pm2 start server.config.js
```

# Troubleshooting:

The superuser needs a working node installation to listen on port 80.  
If you are unsure of the superuser's node installation, try listening  
on a higher port as your own user:

```
// server.js
require('totojs/main')({port: 8080});
```

