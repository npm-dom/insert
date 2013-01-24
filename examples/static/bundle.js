(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".html",".svg"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",Function(['require','module','exports','__dirname','__filename','process'],"function filter (xs, fn) {\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (fn(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length; i >= 0; i--) {\n    var last = parts[i];\n    if (last == '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// Regex to split a filename into [*, dir, basename, ext]\n// posix version\nvar splitPathRe = /^(.+\\/(?!$)|\\/)?((?:.+?)?(\\.[^.]*)?)$/;\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\nvar resolvedPath = '',\n    resolvedAbsolute = false;\n\nfor (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {\n  var path = (i >= 0)\n      ? arguments[i]\n      : process.cwd();\n\n  // Skip empty and invalid entries\n  if (typeof path !== 'string' || !path) {\n    continue;\n  }\n\n  resolvedPath = path + '/' + resolvedPath;\n  resolvedAbsolute = path.charAt(0) === '/';\n}\n\n// At this point the path should be resolved to a full absolute path, but\n// handle relative paths to be safe (might happen when process.cwd() fails)\n\n// Normalize the path\nresolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\nvar isAbsolute = path.charAt(0) === '/',\n    trailingSlash = path.slice(-1) === '/';\n\n// Normalize the path\npath = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isAbsolute).join('/');\n\n  if (!path && !isAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n  \n  return (isAbsolute ? '/' : '') + path;\n};\n\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    return p && typeof p === 'string';\n  }).join('/'));\n};\n\n\nexports.dirname = function(path) {\n  var dir = splitPathRe.exec(path)[1] || '';\n  var isWindows = false;\n  if (!dir) {\n    // No dirname\n    return '.';\n  } else if (dir.length === 1 ||\n      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {\n    // It is just a slash or a drive letter with a slash\n    return dir;\n  } else {\n    // It is a full dirname, strip trailing slash\n    return dir.substring(0, dir.length - 1);\n  }\n};\n\n\nexports.basename = function(path, ext) {\n  var f = splitPathRe.exec(path)[2] || '';\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\n\nexports.extname = function(path) {\n  return splitPathRe.exec(path)[3] || '';\n};\n\n//@ sourceURL=path"));

require.define("__browserify_process",Function(['require','module','exports','__dirname','__filename','process'],"var process = module.exports = {};\n\nprocess.nextTick = (function () {\n    var queue = [];\n    var canPost = typeof window !== 'undefined'\n        && window.postMessage && window.addEventListener\n    ;\n    \n    if (canPost) {\n        window.addEventListener('message', function (ev) {\n            if (ev.source === window && ev.data === 'browserify-tick') {\n                ev.stopPropagation();\n                if (queue.length > 0) {\n                    var fn = queue.shift();\n                    fn();\n                }\n            }\n        }, true);\n    }\n    \n    return function (fn) {\n        if (canPost) {\n            queue.push(fn);\n            window.postMessage('browserify-tick', '*');\n        }\n        else setTimeout(fn, 0);\n    };\n})();\n\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\n\nprocess.binding = function (name) {\n    if (name === 'evals') return (require)('vm')\n    else throw new Error('No such module. (Possibly not yet loaded)')\n};\n\n(function () {\n    var cwd = '/';\n    var path;\n    process.cwd = function () { return cwd };\n    process.chdir = function (dir) {\n        if (!path) path = require('path');\n        cwd = path.resolve(dir, cwd);\n    };\n})();\n//@ sourceURL=__browserify_process"));

require.define("/home/raynos/Documents/insert/node_modules/browserify-server/lib/dummy.js",Function(['require','module','exports','__dirname','__filename','process'],"var process = require.modules.__browserify_process();\nprocess.env.NODE_ENV = 'undefined'\nrequire.modules.__browserify_process = function () {\n   return process\n}\n//@ sourceURL=/home/raynos/Documents/insert/node_modules/browserify-server/lib/dummy.js"));

require.define("/package.json",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = {\"main\":\"index\"}\n//@ sourceURL=/package.json"));

require.define("/index.js",Function(['require','module','exports','__dirname','__filename','process'],"var mutation = require(\"./mutation\")\n    , prepend = require(\"./prepend\")\n    , append = require(\"./append\")\n    , after = require(\"./after\")\n    , before = require(\"./before\")\n    , remove = require(\"./remove\")\n    , replace = require(\"./replace\")\n\nmodule.exports = {\n    prepend: prepend\n    , append: append\n    , after: after\n    , before: before\n    , remove: remove\n    , replace: replace\n    , mutation: mutation\n}\n\n//@ sourceURL=/index.js"));

require.define("/mutation.js",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = mutation\n\nfunction mutation(list) {\n    list = list.map(replaceStringWithTextNode)\n\n    if (list.length === 1) {\n        return list[0]\n    }\n\n    var frag = document.createDocumentFragment()\n    list.forEach(appendToFragment, frag)\n    return frag\n}\n\nfunction replaceStringWithTextNode(string) {\n    if (typeof string === \"string\") {\n        return document.createTextNode(string)\n    } else if (string && string.view && string.view.nodeType) {\n        return string.view\n    }\n\n    return string\n}\n\nfunction appendToFragment(elem) {\n    this.appendChild(elem)\n}\n\n//@ sourceURL=/mutation.js"));

require.define("/prepend.js",Function(['require','module','exports','__dirname','__filename','process'],"var toArray = require(\"to-array\")\n\n    , mutation = require(\"./mutation\")\n\nmodule.exports = prepend\n\nfunction prepend(parent, first) {\n    var node = mutation(toArray(arguments, 1))\n    parent.insertBefore(node, parent.firstChild)\n    return first\n}\n\n//@ sourceURL=/prepend.js"));

require.define("/node_modules/to-array/package.json",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = {\"main\":\"index\"}\n//@ sourceURL=/node_modules/to-array/package.json"));

require.define("/node_modules/to-array/index.js",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = toArray\n\nfunction toArray(list, index) {\n    var array = []\n\n    index = index || 0\n\n    for (var i = index || 0; i < list.length; i++) {\n        array[i - index] = list[i]\n    }\n\n    return array\n}\n\n//@ sourceURL=/node_modules/to-array/index.js"));

require.define("/append.js",Function(['require','module','exports','__dirname','__filename','process'],"var toArray = require(\"to-array\")\n\n    , mutation = require(\"./mutation\")\n\nmodule.exports = append\n\nfunction append(parent, first) {\n    var node = mutation(toArray(arguments, 1))\n    parent.appendChild(node)\n    return first\n}\n\n//@ sourceURL=/append.js"));

require.define("/after.js",Function(['require','module','exports','__dirname','__filename','process'],"var toArray = require(\"to-array\")\n\n    , mutation = require(\"./mutation\")\n\nmodule.exports = after\n\nfunction after(sibling, first) {\n    var node = mutation(toArray(arguments, 1))\n        , parent = sibling.parentNode\n        , child = sibling.nextSibling\n\n    parent.insertBefore(node, child)\n    return first\n}\n\n//@ sourceURL=/after.js"));

require.define("/before.js",Function(['require','module','exports','__dirname','__filename','process'],"var toArray = require(\"to-array\")\n\n    , mutation = require(\"./mutation\")\n\nmodule.exports = before\n\nfunction before(sibling, first) {\n    var node = mutation(toArray(arguments, 1))\n        , parent = sibling.parentNode\n\n    parent.insertBefore(node, sibling)\n    return first\n}\n\n//@ sourceURL=/before.js"));

require.define("/remove.js",Function(['require','module','exports','__dirname','__filename','process'],"var toArray = require(\"to-array\")\n\n    , mutation = require(\"./mutation\")\n\nmodule.exports = remove\n\nfunction remove(first) {\n    var list = toArray(arguments)\n    list.map(function (elem) {\n        if (elem && elem.view && elem.nodeType) {\n            return elem.view\n        }\n\n        return elem\n    }).forEach(removeFromParent)\n\n    return first\n}\n\nfunction removeFromParent(elem) {\n    if (!elem.parentNode) {\n        return\n    }\n\n    elem.parentNode.removeChild(elem)\n}\n\n//@ sourceURL=/remove.js"));

require.define("/replace.js",Function(['require','module','exports','__dirname','__filename','process'],"var toArray = require(\"to-array\")\n    , mutation = require(\"./mutation\")\n\nmodule.exports = replace\n\nfunction replace(target, first) {\n    var node = mutation(toArray(arguments, 1))\n        , parent = target.parentNode\n\n    parent.replaceChild(node, target)\n    return first\n}\n\n//@ sourceURL=/replace.js"));

require.define("/node_modules/browserify-server/lib/other.js",Function(['require','module','exports','__dirname','__filename','process'],"require('/home/raynos/Documents/insert/node_modules/browserify-server/lib/dummy.js')\n//@ sourceURL=/node_modules/browserify-server/lib/other.js"));
require("/node_modules/browserify-server/lib/other.js");

require.define("/examples/index.js",Function(['require','module','exports','__dirname','__filename','process'],"var insert = require(\"../index\")\n    , prepend = insert.prepend\n    , append = insert.append\n    , after = insert.after\n    , before = insert.before\n    , remove = insert.remove\n    , replace = insert.replace\n    , list = document.getElementById(\"list\")\n    , textList = document.getElementById(\"textList\")\n\n// remove\nvar removed = list.children[0]\n    , removedText = textList.childNodes[0]\n    , br = textList.childNodes[1]\n\nremove(removed)\nremove(removedText, br)\n\n// replace\nvar replaced = list.children[0]\n    , replacedText = textList.childNodes[0]\n\nreplace(replaced, createLi(\"one\"), createLi(\"two\"))\nreplace(replacedText, \"one\", \"two\")\n\n// prepend\nprepend(list, createLi(\"three\"), createLi(\"four\"))\nprepend(textList, \"three\", \"four\")\n\n// append\nappend(list, createLi(\"seven\"), createLi(\"ten\"))\nappend(textList, \"seven\", \"ten\")\n\n\nvar anchor = list.children[2] // five\n    , textAnchor = textList.childNodes[2] // five\n\n// after\nafter(anchor, createLi(\"eight\"), createLi(\"nine\"))\nafter(textAnchor, \"eight\", \"nine\")\n\n// before\nbefore(anchor, createLi(\"five\"), createLi(\"six\"))\nbefore(textAnchor, \"five\", \"six\")\n\nfunction createLi(text, elem) {\n    var li = document.createElement(\"li\" || elem)\n    li.textContent = text\n    return li\n}\n//@ sourceURL=/examples/index.js"));
require("/examples/index.js");
})();
