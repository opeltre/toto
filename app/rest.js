// rest.js 

let sh = require('./sh'),
    path = require('path'),
    md = require('./md'),
    {__, _vv, vv_, vv} = require('../vv/vv_back.js');

let style = ['toto', 'toto-nav', 'main', 'fonts'];

let scripts = [
    'parser', 
    "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js",
    'http://mathchat.fr:8083/lib/mathjax.js'
];

let icon = i => vv('div.icon', [
    ['img', {src: `/images/win95icons/Icon_${i}.ico`}]
]);


/***    main    ***/

function main (dir, alias=dir) {

    let href = path => path.replace(sh.pwd(dir), alias);

    let READERS = {
        '*'     : f => sh.cat(f.path).then(PARSERS[f.ext] || __.id),
        '.pdf'  : f => '/pdf' + href(f.path)
    }
    let PARSERS = {
        '.md': md
    };
    let VIEWERS = {
        '.html' : [ vv('#abc-html').html(M => M.view) ],
        '.pdf'  : [ vv('iframe#abc-pdf', {src: M => M.view}) ]
    };
    let BUTTONS = {
        '.pdf' : [ vv('a', {href : M => M.view }, [icon(16)]) ]
    }

    let _F = vv_.forest()
        .style(style)
        .scripts(scripts)

    _F.parse(
        req => ({
            href: req.params[0],
            path: path.join(dir, req.params[0])
        })
    );

    _F.model([
        {
            focus : R => sh.stat(R.path)
        },{
            ls : (_,{focus}) => 
                focus.dir ? focus.path : path.dirname(focus.path) 
        },{ 
            ls   : (_,{ls}) => sh.ls(ls),
            './' : (_,{focus}) => sh.join(focus, '.'),
            '../': (_,{focus}) => sh.join(focus, '..')
        },{
            view : (_, M) => read(M)
        }
    ]);

    return _F.use(
        vv('#abc-div.flex-v.big', [
            head,
            body, 
            foot
        ])
    );

    function read ({focus, ls}) {

        if (!focus.dir) 
            return (READERS[focus.ext] || READERS['*'])(focus);

        let [readme] = ls.filter(a => a.name === 'README.md');
        return readme ? read({focus: readme}) : Promise.resolve(focus.name);
    }

    function head () {

        let pathSeq = __.pipe(
            ({focus}) => href(focus.path).split('/').slice(1),
            S => S
                .map((s,i) => [
                    vv('span.delim', ['/']),
                    vv('a')
                        .attr({href: '/' + S.slice(0,i+1).join('/')})
                        .html(s)
                ])
                .reduce((a,b) => [...a, ...b])
        );

        return vv('#abc-head.flex-h', [ 
            ['a#abc-home', {href:'/'}, [icon(14)]],
            ['#abc-pathseq', pathSeq],
            ['span.grow']
        ]);
    }
    
    function body () {

        let view = () => 
            vv('#abc-view.grow', 
                M => (VIEWERS[M.focus.ext] || VIEWERS['.html']) 
            );

        let right = () => 
            vv('#abc-right', 
                M  => (BUTTONS[M.focus.ext] || [])
            );
        
        return vv('#abc-body.grow.flex-h.wrap.stretch', [
            nav(dir, alias),
            view(),
            right() 
        ]);
    }

    function foot () {
        return vv('#abc-foot');
    }

}

module.exports = main;

/***    nav     ***/

function nav (dir, alias=dir) {

    let focus = 
        f => a => {
            a.class += a.path === f.path.replace(/\/$/,'') ? '.focus' : '';
            return a;
        }

    return vv('#abc-nav', 
        M => [M['../'], M['./'], ...M.ls]
            .filter(a => a.name !== 'README.md')
            .map(format)
            .map(focus(M.focus))
            .map(a => link(a, format(M.focus)))
            .map(a => vv('div', [a]))
    );

    function format (a, i, focus) {

        let indent = 
            [
                '../ ',
                '`-> ./ ',
                '  `-> '
            ]
            [Math.min(i, 2)];

        let tag = 'a'
            + (a.dir ? '.dir' : '.file')
            + (a.path === f.path.replace(/\/$/, '') ? '.focus' : '';

        let href = 
            a.path === sh.pwd(dir + '/..')
                ? '/'
                : a.path.replace(sh.pwd(dir), alias);
      
        return vv(
            tag,
            {href}
            [vv('pre').html(a.indent + a.name)]
        );
    }

}

