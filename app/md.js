let {__} = require('../dist/vv_back');
let marked = require('marked');

/* 
Lexer :: 
    Str  
    ->  
    { 
        match   : [ Str, Str, Str ] || Null,
        lexer   : Lexer,
        index   : Int
    }

lexer :: 
    { 
        read    : [ Str, Str ],
        write   : [ Str, Str ],
        state   : Bool,
        _name    : Str
    } 
    -> 
    Lexer

*/

let lexemes = [

    lexer()
        ._name('imath')
        .read([ /(\\){1,2}\(/, /(\\){1,2}\)/ ])
        .write([
            '<script type="math/tex">',
            '</script>'
        ]),

    lexer()
        ._name('math')
        .read([ /(\\){1,2}\[/, /(\\){1,2}\]/ ])
        .write([
            '<script type="math/tex; mode=display">',
            '</script>'
        ]),

    lexer() 
        ._name('code')
        .read([ /`/, /`/ ])
        .write(['`', '`']),

    lexer()
        ._name('codeblock')
        .read([ /```/, /```/])
        .write(['```', '```'])
];

function parser (text) {
    
    let eqs = [],
        eqToken = i => '$TeX%' + i + '$';

    let insertEq = (eq, i) => 
        txt => txt.replace(eqToken(i), eq);

    let insertEqs = text => 
        __.pipe(...eqs.map(insertEq))(text);

    return __.pipe(
        read,
        marked,
        insertEqs
    )(text);

    function read (str, lex=lexemes) {
        
        let [m, ...ms] = lex
            .map(__.$(str))
            .filter(x => x.match)
            .sort((x,y) => x.index >= y.index);

        if (!m) return (str);

        let l = m.lex(0);
        let before, after;
        
        if (l._name() === 'imath') {
            if (!l.state()) {
                before = m.match[0];
                after = m.match[1] + m.match[2];
            } else {
                before = eqToken(eqs.length);
                after = m.match[2];
                eqs.push(m.match[0] + m.match[1]);
            }
        } 
        else {
            before = m.match[0] + m.match[1];
            after = m.match[2];
        }

        lex = !l.state() 
            ? [m.lex(1)]
            : lexemes;
        
        return before + read(after, lex);
    }


}

module.exports = parser;

function lexer (C) {

    let self = {
            _name : '<lexer>',
            read :  null,
            write : null,
            state : 0,
        };

    Object.assign(self, C || {});

    let lex = __.pipe(
        m => Object.assign({},
            self, 
            {state : (self.state + !!m) % 2}
        ),
        lexer
    );

    function my (str) {

        let i = self.state;
        let m = str.match(self.read[i]);

        return {
            match : m && [
                str.slice(0, m.index), 
                self.write[i],
                str.slice(m.index + m[0].length)
            ],
            index : m && m.index,
            lex : lex,
        };
    }

    return __.getset(my, self);
}
