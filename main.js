let express = require('express'),
    $ = require('path').join,
    {__, vv_, vv} = require('./dist/vv_back'),
    toto = require('./app/toto'),
    conf = require('./conf');

/* Conf :: {
 *      port    : Int
 *      index   : Str
 *      dirs    : [ { path : Str, href : Str } ]
 *      static  : [ Str ]
 *      style   : [ Str ]
 *      scripts : [ Str ]
 *  }
 */
let D = conf.parse(conf.dft, module); 

function mount ({path, href, style, scripts}) {

    let totoMt = 
        app => app.get(
            $('/', href + '*'),
            toto(path, $('/', href))
                .style(style || D.style)
                .scripts(scripts || D.scripts)
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
        
function router (C) {

    C = C ? conf.parse(C, require.main) : D;

    let app = express.Router();

    app.get(
        '/', 
        (req, res) => res.sendFile(C.index)
    );

    (C.dirs || D.dirs)
        .map(mount)
        .forEach(__.$(app));

    [...(C.static || []), ...D.static]
        .map(statique)
        .forEach(__.$(app));

    return app;
}

function server (C = D) {
    
    let srv = express(),
        app = router(C);

    __.logs('( 0 + 0 ) @ :' + (C.port || 80))(require.main.filename);

    srv.use('/', app);
    return srv.listen(C.port || 80);
};

module.exports = {
    router,
    server
}

if (require.main === module)
    server();


