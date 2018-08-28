// sh.js

/* 
    Stat :: 
        { dir   :   Bool
        , name  :   Str
        , path  :   Str
        , ext   :   Str
        }

    stat :: Str -> Stat

    ls  ::  Str -> [ Stat ] 

    Nav :: 
        { ls    :   [Stat]
        , '../' :   Stat
        , './'  :   Stat
        , focus :   Stat
        }

    nav :: Str -> Nav

*/

const fs = require('fs').promises,
    path = require('path'),
    {__} = require('../vv/vv_back');

let sh = {};
let err = console.log;

console.log(__dirname);

let pathfrom = 
    dir => dir[0] === '/'
        ? relname => path.join(dir, relname)
        : relname => path.join(__dirname, dir, relname);

let abs = 
    name => name[0] === '/'
        ? name
        : path.join(__dirname, name)

sh.pwd = 
    name => name ? abs(name) : __dirname;

sh.cat = 
    name => fs
        .readFile(abs(name), 'utf-8')
        .catch(err);

sh.stat = 
    name => fs
        .stat(abs(name))
        .then(stat => stat.isFile())
        .then(
            _f => ({
                name: path.basename(pathfrom(__dirname)(name)), 
                dir : !_f, 
                ext: path.extname(name),
                path: abs(name)
            })
        )
        .catch(err);

sh.ls = 
    dir => fs
        .readdir(dir ? abs(dir) : __dirname)
        .then(rel => rel.map(pathfrom(dir || __dirname)))
        .then(names => Promise
            .all(names.map(sh.stat))
        )
        .catch(err);

sh.join = 
    (stat, str) => sh.stat(path.join(
        stat.path,
        (stat.dir ? './' : '../') + str
    ));

sh.nav = 
    name => __.updateKeys(
        {
            focus : ({name}) => sh.stat(name)
        },{
            ls : ({focus}) => focus.dir 
                        ? focus.path
                        : path.dirname(focus.path)
        },{ 
            ls   : ({ls}) => sh.ls(ls),
            './' : ({focus}) => sh.join(focus, '.'),
            '../': ({focus}) => sh.join(focus, '..')
        }
    )({name})
    .catch(err);

module.exports = sh;
