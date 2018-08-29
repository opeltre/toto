let express = require('express'),
    $ = require('path').join,
    PWD = __dirname,
    {__} = require('./dist/vv_back.js'),
    toto = require('./app/toto.js');

__.logs('main')(require.main.filename);

let d_conf = {
    port : 8090,
    index : './index.html',
    dirs : [
        {path: './root', href: 'root'}
    ],
    static: ['images', 'fonts', 'style', 'lib'],
    style : ['toto', 'toto-nav', 'main', 'fonts'],
    scripts : [
        "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js",
        'parser', 
        'mathjax'
    ]
};
d_conf = parse(d_conf, PWD);


function mount ({path, href, style, scripts}) {

    let totoMt = 
        app => app.get(
            $('/', href + '*'),
            toto(path, $('/', href))
                .style(style || d_conf.style)
                .scripts(scripts || d_conf.scripts)
        );

    let rawMt =
        app => app.get(
            $('/raw', href ,'*'),
            (req, res) => res.sendFile($(path, req.params[0]))
        );

    return __.do(totoMt, rawMt);
}

function statique (dir) {
    return app => app.use(
        dir.replace(/^.*(\/\w*)$/, '$1'), 
        express.static(dir)
    );
}
        
function router (conf) {

    conf = conf
        ? parse(conf, $(require.main.filename, '..'))
        : d_conf;

    let app = express.Router();

    app.get(
        '/', 
        (req, res) => res.sendFile(conf.index)
    );

    (conf.dirs || d_conf.dirs)
        .map(mount)
        .forEach(__.$(app));

    [...(conf.static || []), ...d_conf.static]
        .map(statique)
        .forEach(__.$(app));

    return app;
}

function server (conf = d_conf) {
    
    let srv = express(),
        app = router(conf = d_conf)

    srv.use('/', app);
    return srv.listen(conf.port || 80);
};

module.exports = {
    router,
    server
}

if (require.main === module)
    server();


function parse (conf, pwd) {

    let abs = path => 
        path[0] === '/' ? path : $(pwd, path);

    let abs_path = d => 
        Object.assign(d, {path : abs(d.path)});

    return Object.assign(conf, {
        dirs : conf.dirs.map(abs_path),
        static : conf.static.map(abs),
        index : abs(conf.index)
    });
}

