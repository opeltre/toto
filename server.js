let express = require('express'),
    path = require('path'),
    abc = require('./app/rest.js');

let d_conf = {
    port : 80,
    dirs : [
        {path: '../fs/', href: '/fs'}
    ]
};

let raw = d => [
    '/raw' + d.href + '*',
    (req, res) => 
        res.sendFile(path.join(__dirname, d.path, req.params[0]))
];
        
function server (conf = d_conf) {

    let app = express.Router(),
        router = express();

    conf.dirs.forEach(d => {
        app.get(d.href, abc(d.path, d.href));
        app.get(...raw(d));
    });


    router.use('/', app);
    router.listen(conf.port || 80);
    
    return router;
};

module.exports = server;
