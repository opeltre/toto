// rest.js 

let sh = require('./sh'),
    path = require('path'),
    md = require('./md'),
    {__, _vv, vv_, vv} = require('../vv/vv_back.js');

let icon = i => vv('div.icon', [
    ['img', {src: `/images/win95icons/Icon_${i}.ico`}]
]);


/***    main    ***/
function main (dir, alias=dir) {

    let href = path => path.replace(dir, alias);

    let READERS = {
        '.html'     : f => sh.cat(f.path).then(PARSERS[f.ext] || __.id),
        '.pdf'  : f => '/raw' + href(f.path)
    }
    let PARSERS = {
        '.md': md
    };
    let VIEWERS = {
        '.html' : [ vv('#toto-html').html(M => M.view) ],
        '.pdf'  : [ vv('iframe#toto-pdf', {src: M => M.view}) ]
    };

    let BUTTONS = {
        '.pdf' : [ vv('a', {href : M => M.view }, [icon(16)]) ]
    }

    let _F = vv_.forest()

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
        vv('#toto-div.flex-v.big', [
            head(),
            body(), 
            foot()
        ])
    );

    function read ({focus, ls}) {

        if (!focus.dir) 
            return (READERS[focus.ext] || READERS['.html'])(focus);

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
                .reduce((a,b) => [...a, ...b], [])
        );

        return vv('#toto-head.flex-h', [ 
            ['a#toto-home', {href:'/'}, [icon(14)]],
            ['#toto-pathseq', pathSeq],
            ['span.grow']
        ]);
    }
    
    function body () {

        let view = () => 
            vv('#toto-view.grow', 
                M => (VIEWERS[M.focus.ext] || VIEWERS['.html']) 
            );

        let right = () => 
            vv('#toto-right', 
                M  => (BUTTONS[M.focus.ext] || [])
            );
        
        return vv('#toto-body.grow.flex-h.wrap.stretch', [
            nav(dir, alias),
            view(),
            right() 
        ]);
    }

    function foot () {
        return vv('#toto-foot');
    }

}

module.exports = main;

/***    nav     ***/

function nav (dir, alias=dir) {

    return vv('#toto-nav', 
        M => [M['../'], M['./'], ...M.ls]
            .filter(a => a.name !== 'README.md')
            .map(format(M.focus))
            .map(a => vv('div', [a]))
    );

    function format (f) {
        return (a,i) => {

            let indent = 
                [
                    '../ ',
                    '`-> ./ ',
                    '  `-> '
                ]
                [Math.min(i, 2)];

            let focus = 
                a.path === f.path.replace(/\/$/, '');

            let tag = 'a'
                + (a.dir ? '.dir' : '.file')
                + (focus ? '.focus' : '');

            let href = 
                a.path === path.join(dir,'..')
                    ? '/'
                    : a.path.replace(sh.pwd(dir), alias);
          
            return vv(
                tag,
                {href},
                [vv('pre').html(indent + a.name)]
            );
        };
    }

}

