const fs = require('fs'),
    { JSDOM } = require('jsdom'),
    {vv, _vv, __} = require('./vv_bundle');

/*
    vv_('a')
        .html('index.html')
        .use(_vv('b'));
        .model({msg: 'Hello World!'});

    _vv('b', [M => M.msg]);

    _vv :<-: (req, res)
        .parse :<-: req -> R
        .model :<-: R -> M

    app.get('/a', vv_('a'));
*/

/* ... */

let ifRelative = (f) => 
    name => ( name[0] === '/' || /^https?:\/\//.test(name) )
        ? name 
        : f(name);

let defaultPaths = {
    style : ifRelative(name => '/style/'+ name + '.css'), 
    script : ifRelative(name => '/lib/' + name + '.js')
};

/*********/

let paths = defaultPaths;
function handler () {

    let self = {
        html : null,
        nodes : [],
        model: [],
        parse: __.id,
        scripts: [],
        style: [],
    };

    let onErr = __.log;

    function my (req, res) {
        res = res || ({send: console.log});
        return Promise
            .all([
                my.getDom(),
                my.getModel(req)
            ])
            .then(__.do(
                __.X(my.render),
                __.X(my.link),
                __.X(my.send(res))
            ))
            .catch(onErr);
    }

    my.getHtml = 
        () => self.html 
            ? fs.readFile(self.html) 
            : Promise.resolve('');

    my.getDom =
        () => my.getHtml()
            .then(html => new JSDOM(html))

    my.getModel = 
        (req) => {
            let R = self.parse(req),
                Ms = self.model;
            return __.genKeys(...Ms)(R, {});
        }
            
    my.render =
        (dom, model) => my.nodes().forEach(
                n => n.doc(dom.window.document)(model)
        );

    my.link = 
        dom => {
            let d = dom.window.document;
            self.scripts.forEach(s => linkScript(d,s))
            self.style.forEach(s => linkStyle(d,s));
        }

    my.send = 
        res => 
            dom => res.send(dom.serialize());

    my.use = 
        (...ns) => my.nodes(my.nodes().concat(ns));

    return __.getset(my, self);
    

    function linkScript (doc, src) {
        let node = doc.head,
            script = doc.createElement('script');
        script.src = paths.script(src);
        node.appendChild(script);
    }

    function linkStyle (doc, href) {
        let sheet = doc.createElement('link');
        sheet.rel = "stylesheet";
        sheet.href = paths.style(href);
        doc.head.appendChild(sheet);
    }

}

/*** vv_ ***/

function vv_ (name) {
    let my = vv_.get(name)
    return my;
}

vv_.nodes = {};

vv_.get = 
    name => vv_.nodes[name] || vv_.new(name);

vv_.new = 
    name => {
        vv_.nodes[name] = handler();
        return vv_.nodes[name];
    };

vv_.forest = handler;

module.exports = {vv_, vv, _vv, __};
