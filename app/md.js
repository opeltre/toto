let {__} = require('../vv/vv_back');
let marked = require('marked');

function parser (text) {
    
    let inlineMath = lexer()
        .read([ /(\\){1,2}\(/, /(\\){1,2}\)/ ])
        .write([
            '<script type="math/tex">',
            '</script>'
        ]);

    let displayMath = lexer()
        .read([ /(\\){1,2}\[/, /(\\){1,2}\]/ ])
        .write([
            '<script type="math/tex; mode=display">',
            '</script>'
        ]);

    let lexers = [inlineMath, displayMath];

    let inMath = false;

    return read(text);

    function read (str) {
        
        matches = lexers
            .map(lex => lex(str))
            .filter(x => x)
            .sort((x,y) => x[0].length >= y[0].length);

        if (!matches.length)
            return marked(str);

        m = matches[0];

        if (!inMath) {
            console.log("using marked");
            m[0] = marked(m[0]);
        }
        inMath = !inMath;
        
        return m
            .slice(0,2)
            .join(' ')
            .concat(read(m[2]));

    }


    function lexer () {
        var self = {
            read : null,
            write : null,
            state : 0,
        };

        function my (str) {
            var m = my.match(str);
            if (m) 
                m = [m[0], self.write[self.state], m[1]];
                my.state((self.state + 1)%2);
            return m;
        }

        my.match = str => {
            var m = str.match(self.read[self.state]);
            return m ? [
                    str.slice(0, m.index),
                    str.slice(m.index + m[0].length)
                ]
                : null; 
        }
        return __.getset(my, self);

    }
}

module.exports = parser;
