/* vv_bundle */
/*** __ ***/

let __ = {};


__.null = 
    () => {};

__.id =
    x => x;

__.return = 
    x => y => x;

__.X = 
    f => 
        X => f(...X);

__.$ = 
    (...xs) => 
        f => f(...xs);

__.if = 
    (f,g,h) => 
        (...xs) => f(...xs) ? g(...xs) : h(...xs);

__.pipe = 
    (f=__.id, ...fs) => fs.length
        ? (...xs) =>  __.pipe(...fs)(f(...xs))
        : (...xs) => f(...xs);

__.do = 
    (f=__.id, ...fs) => fs.length
        ? __.pipe(__.do(f), __.do(...fs))
        : x => {f(x); return x} 

__.not = 
    b => !b;

__.log = 
    x => {console.log(x); return x};

__.logs = 
    str => 
        x => {__.log(str || 'logs:'); return  __.log(x)};

__.forKeys = 
    (...fs) => 
        obj => Object.keys(obj).forEach(
            k => __.pipe(...fs)(obj[k], k)
        );

__.mapKeys = 
    (...fs) => 
        obj => {
            let obj2 = {};
            Object.keys(obj).forEach(
                k => obj2[k] = __.pipe(...fs)(obj[k], k)
            )
            return obj2;
        };

__.subKeys = 
    (...ks) => 
        obj => {
            let sub = {};
            ks.filter(k => (obj[k] !== undefined))
                .forEach(k => sub[k] = obj[k]);
            return sub;
        };

__.emptyKeys =
    obj => {
        let out = true;
        __.forKeys(k => out = false)(obj);
        return out;
    };

__.getKeys =
    obj => (...Rs) => {
        let get = v => 
            typeof v === 'function'
                ? __.X(v)
                : __.return(v);

        let promise = ([v,k]) =>
            Promise.resolve(Rs)
                .then(get(v))
                .then(u => [u,k]);

        return Promise
            .all(__.toPairs(obj).map(promise))
            .then(__.toKeys);
    };

__.genKeys = 
    (obj, ...objs) => 
        obj 
            ? (R, M={}) => __.getKeys(obj)(R, M)
                .then(N => Object.assign(M,N))
                .then(N => __.genKeys(...objs)(R, N))
            : (R, M) => Promise.resolve(M);


__.updateKeys = 
    (obj, ...objs) => obj
        ? obj0 => __.getKeys(obj)(obj0)
            .then(obj1 => Object.assign(obj0, obj1))
            .then(__.updateKeys(...objs))
        : obj0 => Promise.resolve(obj0 || {});

__.toKeys = 
    pairs => {
        let out = {};
        pairs.forEach(
            ([v, k]) => out[k] = v
        )
        return out;
    };

__.toPairs = 
    obj => {
        let out = [];
        __.forKeys(
            (v,k) => out.push([v,k])
        )(obj);
        return out;
    };

/* misc */

__.getset = getset;

__.sleep = 
    ms => new Promise(then => setTimeout(then, ms));

__.range =
    n => {
        let out = [];
        for (var i=0; i<n; i++) {
            out.push(i);
        }
        return out;
    }

/* getset */

function getset (obj, attrs) {
    let method = 
        key => function (x) {
            if (!arguments.length)
                return attrs[key];
            attrs[key] = x;
            return obj;
        };
    forEachKey(attrs)(
        key => obj[key] = method(key)
    );
    return obj;
}
/* 
 * L'ARBRE DOM VIRTUEL
 */
function vv (tag, attr, branch) {

    var {tag, attr, branch} = parse(tag, attr, branch);
    
    var self = {
        tag :       tag,
        stem :      null,
        node :      null,
        parentNode : null,
        model :     {},
        doc :       vv.document,
        html :      '',
        value :     '',
        plant :     null,
        properties: {},
        svg:        tag === 'svg' || tag === 'g'
    };
    let attributes = attr, 
        branches = branch || [],
        events = {};

    function my (model, append = true) {
        /** model **/
        model = model || my.model();
        let $m = x => isModelFunction(x) ? x(model) : x;
        /** node **/
        my
            .model(model)
            .nodeCreate()
            .nodeConf($m)
            .nodeAppend(append);
        /** branch **/
        $m(branches).map($m)
            .map(parseBranch)
            .map(b => b.link(my))
            .forEach(b => b(model));
        /** plant **/
        return (!self.stem && append)
            ? my.nodePaint($m).parentNode()
            : my.parentNode();
    }

    my.branch = 
       bs => {
           branches = bs.map(parseBranch);
           return my;
       };

    my.modelUpdate =
        (...Ms) => my.model(Object.assign(my.model(), ...Ms)); 
   
    my.start = (when, model, append=true) => {
        /* up ?? */
        if (when === 'now')
            return my(model, append);
        else {
            let M = e => Object.assign(
                my.model(),
                model || {},
                e.detail
            );
            my.doc().addEventListener(
                'vv#' + when,
                 e => my(M(e), append)
            );
        }
        return my;
    }

    my.kill = (when) => {
        if (when === 'now')
            my.node().remove();
        else {
            my.doc().addEventListener(
                'vv#' + when,
                () => my.node().remove()
            );
        }
        return my;
    }

    my.on = (evt, listener, capture=false) => {
        if (!listener)
            return events[evt];
        if (events[evt])
            events[evt].push([listener, capture]);
        else
            events[evt] = [[listener, capture]];
        return my;
    }

    my._onUpdate =  [];

    my.hook = 
        (xs, ...hooks) => {
            let hook = data => {
                let d = __.subKeys(...vv._(xs))(data || {});
                if (!__.emptyKeys(d))
                    __.do(...hooks)(d, my.model());
            }
            my._onUpdate.push(hook);
            return my;
        };

    my.signal = 
        (xs, sig) => my.hook(xs, vv.emit(sig, d => d));

    my.update = (evt, update=__.id, ...then) => {
        if (typeof update === 'boolean') {
            then = [update].concat(then);
            update = d => d;
        }
        if (!then.length || typeof then[0]  !== 'boolean') 
            then = [true].concat(then);
        then[0] = then[0]
            ? my.redraw
            : () => my;
        let doUpdate = e => {
            Object.assign(
                my.model(),
                update(e.detail, my.model())
            );
            __.do(...my._onUpdate)(e.detail, my.model());
            return my.model();
        };
        let listener = __.pipe(doUpdate, ...then);
        my.doc().addEventListener('vv#'+evt, listener);
        return my;
    }
    my.up = my.update;

    my.redraw = 
        () => {
            let node =  my.node();
            let fragment = my(false, !node);
            if (node) 
                node.replaceWith(fragment);
            return my;
        };
    
    my.link = (stem) => my
        .stem(stem)
        .svg(stem.svg())
        .doc(stem.doc())
        .model(stem.model());

    my.attr = obj => {
        if (typeof obj === 'string')
            return attributes[obj];
        Object.assign(attributes, obj);
        return my;
    }

    my.show = (str) => {
        console.log(str);
        console.log(self);
        return my;
    }

    my.nodeCreate = () => my.node(
        my.svg()
            ? createSvg(my.doc(), tag)
            : my.doc().createElement(tag)
    );

    my.nodeSet = (key, val) => {
        my.svg()
            ? setSvg(key, val, my.node())
            : my.node().setAttribute(key,val);
        return my;
    }

    my.nodeConf = ($m) => {
        forEachKey(attributes)(
            key => my.nodeSet(key, $m(my.attr(key)))
        );
        forEachKey(self.properties)(
            key => my.node()[key] = $m(self.properties[key])
        );
        let model = $m(x => x),
            $mListener = l => (t => l(t, model));
        forEachKey(events)(
            key => my.on(key).forEach(
                list => my.node()
                    .addEventListener(key, ...list.map($mListener))
            )
        );
        my.node().innerHTML = $m(my.html());
        my.node().value = $m(my.value());
        return my;
    }

    my.nodeAppend = (append) => {
        let parentNode = (self.stem && append)
                ? self.stem.node()
                : self.doc.createDocumentFragment();
        parentNode.appendChild(self.node);
        return my.parentNode(parentNode);
    }

    my.nodePaint = ($m, append) => {
        let target = self.plant
            ? self.doc.querySelector($m(self.plant))
            : self.doc.body;
        target.appendChild(my.parentNode());
        return my;
    }

    function createSvg (doc, tag) {
        var svgNS = "http://www.w3.org/2000/svg"
        var node = doc.createElementNS(svgNS, tag)
        if (tag == 'svg')
            node.setAttributeNS(
                "http://www.w3.org/2000/xmlns/", 
                "xmlns:xlink", 
                "http://www.w3.org/1999/xlink"
            );
        return node;
    }

    function setSvg (key, val, node) {
        node.setAttributeNS(null, key, val);
    }

    function parseBranch (b) {
        let t = x => (typeof x);
        if (t(b) === 'string' || isModelFunction(b))
            return vv('text').html(b)
        if (Array.isArray(b)) 
            return (t(b[0]) === 'function')
                ? b 
                : vv(...b);
        return b
    }

    function parse (tag, attr={}, branch=[]) {
        /** empty {} attr is boring **/
        if (Array.isArray(attr) || typeof attr === 'function')
            [attr, branch] = [{}, attr];
        /** match "tagname#id.class.class2" **/
        let {classes, tagname, id} = vv.parse(tag);
        if (id) 
            Object.assign(attr, {id});
        if (classes.length)
            Object.assign(attr, {class: classes.join(' ')});
        /** out! **/
        return {tag: tagname, attr, branch};
    }

    function isModelFunction (x) {
        return (typeof x === 'function' && !x._vv);
    }

    my._vv = true;
    return getset(my,self);
}

/*** parse ***/
vv.parse = function (tag) {
    /** match "tagname#id.class.class2" **/
    let re = /^(\w)+|(#[\w\-]*)|(\.[\w\-]*)/g,
        matches = tag.match(re);
    let classes = [],
        tagname = 'div',
        id = null;
    matches.forEach(m => {
        if (m[0] === '#')
            id =  m.slice(1,);
        else if (m[0] === '.')
            classes.push(m.slice(1,));
        else
            tagname = m.length ? m : 'div';
    });
    return {classes, tagname, id}
};

/*** emit ***/

vv.on = function (name, ...then) {
    vv.document.addEventListener(
        'vv#' + name,
        __.do(...then)
    );
}

vv.emit = function (name, data={}, ...more) {
    
    if (!name) 
        return __.null;

    let getData = 
         (evt = {}) => (typeof data === 'function')
            ? data(evt.target || evt)
            : data;
    let emit = 
        evt => vv.document.dispatchEvent(new CustomEvent(
            'vv#' + name,
            {
                bubbles: true,
                detail: getData(evt)
            }
        ));
    let debug = 
        evt => {
            alert(name);
            __.logs(name)(getData(evt));
        };
    let handler = 
        __.if(
            () => vv.debug,
            __.do(emit, debug),
            emit
        );
    return __.do(handler, vv.emit(...more));

}

vv.document = (typeof document === 'undefined') 
    ? {dispatchEvent: __.null, addEventListener: __.null}
    : document;

vv.document.addEventListener(
    'DOMContentLoaded', 
    vv.emit('dom')
);

/****** GETSET ******/
/* still wanted in global scope, e.g. for bmp2svg.
 * forEachKey, $, logthen... as well?
 */

function forEachKey (obj) {
    return f => Object.keys(obj).forEach(f);
}
function _vv (name, svg) {

    let id = 
        name => /#/.test(name) ? vv.parse(name).id : name;

    let app 
        = _vv.get(id(name)) 
        || _vv.set(id(name), _vv.new(name));

    app._name = name;
   
    app.vnodes = app.vnodes || [];

    app.mount = 
        (dest, ...vnodes) => {

            if (typeof dest !== 'string') {
                vnodes = [dest].concat(vnodes); dest = null;
            }

            let connect = 
                ([n, attrs]) => __.forKeys(
                    (values, arrow) => app.connect(arrow, n, values)
                )(attrs || {});

            let plant = 
                ([n, attrs]) => _vv(n).plant(dest || app._name + '__' + n);

            let push = 
                ([n, _]) => app.vnodes.push(_vv(n));

            vnodes.forEach(__.do(connect, plant, push));
            return app;
        }

    app.gmount = 
        (dest, ...vnodes) => app
            .mount(dest, ...vnodes.map(([n, _]) => ['g#' + n, _]));

    app.connect = 
        (arrow, b, xs) => {
            let sig = 
                _vv.sig(..._vv.arrow(`${app._name} ${arrow} ${b}`));
            _vv.connect(sig, xs);
            return app;
        }
    
    app.stepwise = 
        j => {
            let starts = (a,b) => b.start('=> ' + a._name),
                kills = (a,b) => b.kill('=> ' + a._name),
                get = (i) => app.vnodes[i];
            app.vnodes.forEach(
                (a,i) => { 
                    if (get(i+j)) starts(a, get(i+j));
                    if (get(i-1)) kills(a, get(i-1));
                }
            );
            return app;
        };

    return app;
}

_vv.nodes = {};

_vv.new = 
    n => vv(/#/.test(n) ? n : '#' + n)
        .up('=> ' + n)
        .up('-> ' + n, false)
        .kill('!> ' + n);

_vv.get = 
    id => _vv.nodes[id];

_vv.set = 
    (id, vnode) => {
        _vv.nodes[id] = vnode;
        return vnode;
    }

_vv.sig = 
    (a, b, r) => `${a._name} ${r ? '=' : '-'}> ${b._name}`;

_vv.connect = 
    (sig, xs) => {

            let [a, b, r] = _vv.arrow(sig);
            a
                .signal(xs, sig);
            b
                .update(sig, d=>d, r);
            return _vv;
        };

_vv.link = 
    __.forKeys(
        (xs, sig) => _vv.connect(sig, vv._(xs))
    )

vv._ = 
    xs => typeof xs === 'string'
        ? xs.split(/,?\s/)
        : xs;

_vv.arrow = 
    (sig) => {

        let re = /(\w*)\s(<?[-=]>?)\s(\w*)/;
        let [s, a, link, b] = sig.match(re);
        return link[1] === '>'
            ? [_vv(a), _vv(b), link[0] === '=']
            : [_vv(b), _vv(a), link[1] === '='];
    };
/*** vv_helpers ***/

vv.input = 
    (id, key=id, css='') => {
        let data = 
            val => { let d = {}; d[key] = val; return d };
        return vv('input#' + id + css)
            .html(M => M[key])
            .on('input', 
                vv.emit('-> '+ id, t => data(t.value))
            )
    }

vv.textarea = 
    (id, key=id, css='') => {
        let data = 
            val => { let d = {}; d[key] = val; return d };
        return vv('textarea#'+ id + css)
            .value(M => M[key])
            .on('change', 
                vv.emit('-> ' + id, t => data(t.value)))
    }

vv.table = 
    body => 
        vv('table', [
            ['tbody', 
                body
                    .map(row => row
                        .map(cell => ['td', [cell]])
                    )
                    .map(row => ['tr', row])
            ]
        ]);
/*** ajax ***/

vv.ajax = function (data) {

    let my = {},
        xhr = new XMLHttpRequest();
    data = data ? JSON.stringify(data) : null;

    ['get', 'post', 'put', 'move', 'delete']
        .forEach(m => my[m] = method(m));

    function method (m) {
        return url => {
            xhr.open(m.toUpperCase(), url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            return new Promise(resolve => then(resolve));
        }
    }

    function then (f) {
        let ok = () => (xhr.readyState === 4 && xhr.status === 200);
        xhr.onreadystatechange = () => ok() && f(xhr.responseText);
        xhr.send(data);
    }
   
    my.del = my.delete;
    return my;
}
if (typeof window === 'undefined') {    module.exports = {vv, _vv, __};    }
