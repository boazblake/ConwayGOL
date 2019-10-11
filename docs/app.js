(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("app.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _functions = require("./functions.js");

var _model = require("./model.js");

var Cell = {
  view: function view(_ref) {
    var _ref$attrs = _ref.attrs,
        mdl = _ref$attrs.mdl,
        cell = _ref$attrs.cell;

    return m(".cell", {
      class: cell.isAlive ? "alive" : "dead",
      style: {
        fontSize: mdl.width() / mdl.size() / 2 + "px",
        height: mdl.width() / mdl.size() / 2 + "px",
        flex: "1 1 " + mdl.width() / mdl.size() + "px"
      },
      onclick: function onclick() {
        mdl.isRunning(mdl.isRunning());
        mdl.board[cell.coords].isAlive = !cell.isAlive;
        (0, _functions.updateCells)(mdl);
      }
    });
  }
};

var Board = function Board(_ref2) {
  var mdl = _ref2.attrs.mdl;

  (0, _functions.makeBoardFromSize)(mdl, Number(mdl.size()));
  return {
    oninit: function oninit(_ref3) {
      var mdl = _ref3.attrs.mdl;
      return (0, _functions.createSeed)(mdl);
    },
    view: function view(_ref4) {
      var mdl = _ref4.attrs.mdl;

      return m(".board", { style: { width: mdl.width() + "px" } }, Object.keys(mdl.board).map(function (coord) {
        var cell = mdl.board[coord];
        return m(Cell, { key: cell.key, cell: cell, mdl: mdl });
      }));
    }
  };
};

var Toolbar = {
  view: function view(_ref5) {
    var mdl = _ref5.attrs.mdl;
    return m(".toolbar", [m("button.btn", { onclick: function onclick(e) {
        return (0, _model.restart)(mdl);
      } }, "New Game"), m("button.btn", { onclick: function onclick(e) {
        return (0, _functions.updateCells)(mdl);
      } }, "Next"), m("button.btn", {
      onclick: function onclick(e) {
        mdl.isRunning(!mdl.isRunning());
        (0, _functions.runGOL)(mdl);
      }
    }, "Start")]);
  }
};

var GameOfLife = {
  view: function view(_ref6) {
    var mdl = _ref6.attrs.mdl;

    return m(".container", [m(Toolbar, { mdl: mdl }), m(Board, {
      mdl: mdl
    })]);
  }
};

exports.default = GameOfLife;
});

;require.register("functions.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSeed = exports.updateCells = exports.runGOL = exports.updateSiblings = exports.calculateCell = exports.makeBoardFromSize = exports.makeKey = exports.log = undefined;

var _ramda = require("ramda");

// export const boardSizes` = filter((n) => n % 3 == 0, range(30, 60))

var log = exports.log = function log(m) {
  return function (v) {
    console.log(m, v);
    return v;
  };
};

var makeKey = exports.makeKey = function makeKey(coords) {
  return coords[0] + "-" + coords[1];
};

var siblingCoords = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];

var within = function within(limit) {
  return function (coords) {
    return !(coords.includes(limit) || coords.includes(-1));
  };
};

var toSiblingModel = function toSiblingModel(acc, sibling) {
  acc[sibling] = false;
  return acc;
};

var calcSiblings = function calcSiblings(limit) {
  return function (sibCoords) {
    return function (coords) {
      return sibCoords.map(function (sib) {
        return [sib[0] + coords[0], sib[1] + coords[1]];
      }).filter(within(limit)).reduce(toSiblingModel, {});
    };
  };
};

var makeCell = function makeCell(mdl) {
  return function (size) {
    return function (idx) {
      var coords = [idx % size, Math.floor(idx / size)];
      var siblings = calcSiblings(size)(siblingCoords)(coords);
      var cell = {
        key: idx,
        value: "",
        isAlive: false,
        coords: coords,
        siblings: siblings
      };
      mdl.board[coords] = cell;

      mdl.cells[coords] = cell;
      return mdl;
    };
  };
};

var makeBoardFromSize = exports.makeBoardFromSize = function makeBoardFromSize(mdl, size) {
  mdl.size(size);
  return (0, _ramda.range)(0, size * size).map(makeCell(mdl)(size));
};

var calculateCell = exports.calculateCell = function calculateCell(mdl) {
  Object.keys(mdl.board).map(function (cell) {
    var cellsAlive = (0, _ramda.without)([false], (0, _ramda.values)(mdl.board[cell].siblings)).length;
    if (cellsAlive <= 2) {
      mdl.board[cell].isAlive = false;
      mdl.cells[cell].isAlive = false;
    }

    if ([2, 3].includes(cellsAlive)) {
      mdl.board[cell].isAlive = true;
      mdl.cells[cell].isAlive = true;
    }

    if (cellsAlive > 3) {
      mdl.board[cell].isAlive = false;
      mdl.cells[cell].isAlive = false;
    }

    if (cellsAlive == 3) {
      mdl.board[cell].isAlive = true;
      mdl.cells[cell].isAlive = true;
    }
  });
  return mdl;
};

var updateSiblings = exports.updateSiblings = function updateSiblings(mdl) {
  Object.keys(mdl.board).map(function (cell) {
    return Object.keys(mdl.board[cell].siblings).map(function (sibling) {
      return mdl.board[cell].siblings[sibling] = mdl.board[sibling].isAlive;
    });
  });

  return mdl;
};

var runGOL = exports.runGOL = function runGOL(mdl) {
  // if (mdl.isRunning()) {
  // setTimeout(() => {
  // console.log("model", mdl)
  // return runGOL(
  updateCells(mdl);
  // )
  // }, 1000)
  // } else {
  return mdl;
  // }
};

var randomizeCells = function randomizeCells(mdl) {
  var randomCells = Object.keys(mdl.board).sort(function () {
    return 0.5 - Math.random();
  }).slice(0, 10);

  randomCells.map(function (cell) {
    return mdl.board[cell].isAlive = true;
  });

  return mdl;
};

var updateCells = exports.updateCells = (0, _ramda.compose)(calculateCell, updateSiblings);

var createSeed = exports.createSeed = (0, _ramda.compose)(updateSiblings, randomizeCells);
});

;require.register("initialize.js", function(exports, require, module) {
"use strict";

var _app = require("./app.js");

var _app2 = _interopRequireDefault(_app);

var _model = require("./model.js");

var _model2 = _interopRequireDefault(_model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener("DOMContentLoaded", function () {
  var root = document.body;
  m.mount(root, { view: function view() {
      return m(_app2.default, { mdl: _model2.default });
    } });
});
});

;require.register("model.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var model = {
  isRunning: Stream(false),
  cells: {},
  turn: Stream(true),
  board: [],
  size: Stream(30),
  width: Stream(800)
};

var restart = exports.restart = function restart(mdl) {
  mdl.isRunning = Stream(false);
  mdl.size(null);
  mdl.width(800);
  mdl.turn(true);
};

exports.default = model;
});

;require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.m = require("mithril");
window.Stream = require("mithril-stream");


});})();require('___globals___');


//# sourceMappingURL=app.js.map