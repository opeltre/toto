// conf.js
let $ = require('path').join;

/* default configuration */

exports.dft = {

    port : 8090,

    index : './index.html',

    dirs : [
        {
            path: './man', 
            href: 'man'
        }
    ],

    static: [
        'images', 
        'fonts', 
        'style', 
        'lib'
    ],

    theme: 'dark',

    style : [
        'toto', 
        'toto-nav', 
        'toto-view',
        'main', 
        'fonts'
    ],

    scripts : [
        'mathjaxConf',
        "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js",
        'parser', 
    ],
};


/* parse paths */ 

exports.parse  = (C, module) => {

    let pwd = $(module.filename, '..');

    let abs = path => 
        path[0] === '/' ? path : $(pwd, path);

    let abs_path = d => 
        Object.assign(d, {path : abs(d.path)});

    let theme = C => [ 
        'toto-' + (C.theme || 'lunar'),
        ...(C.style || [])
    ]

    return Object.assign(C, {
        dirs : (C.dirs || []).map(abs_path),
        static : (C.static || []).map(abs),
        index : abs(C.index || 'index.html'),
        style : theme(C)
    });

}


