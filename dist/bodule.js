(function() {
  var Bodule;

  Bodule = (function() {
    function Bodule(id, deps, factory) {
      var noop, _ref, _ref1;

      _ref = id.split('@'), this["package"] = _ref[0], this.version = _ref[1];
      _ref1 = this.version.split('/'), this.version = _ref1[0], noop = _ref1[1];
      this.packageId = "" + this["package"] + "@" + this.version;
      this.id = id;
      this.deps = deps;
      this.factory = factory;
      this.exports = {};
      this.loaded = false;
      this.load();
    }

    Bodule._cache = {};

    Bodule.config = function(config) {
      this.config = config;
    };

    Bodule.require = function(id) {
      return this._cache[id].exports;
    };

    Bodule.define = function(id, deps, factory) {
      var bodule;

      bodule = new Bodule(id, deps, factory);
      return this._cache[id] = bodule;
    };

    Bodule._load = function(bodule, onload) {
      var script;

      script = document.createElement('script');
      script.src = this.config.host + '/' + bodule.replace('@', '/') + '.js';
      script.onload = onload;
      document.head.appendChild(script);
    };

    Bodule.prototype.load = function() {
      var dep, deps, self, _i, _len;

      self = this;
      deps = this.deps.map(function(dep) {
        if (dep.indexOf('@') === -1) {
          dep = self.packageId + dep;
        }
        return dep;
      });
      deps = deps.filter(function(dep) {
        return !Bodule._cache[dep];
      });
      if (!deps.length) {
        self.compile();
      } else {
        for (_i = 0, _len = deps.length; _i < _len; _i++) {
          dep = deps[_i];
          if (!Bodule._cache[dep]) {
            Bodule._load(dep, function() {
              var isLoaded, _j, _len1;

              isLoaded = true;
              for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
                dep = deps[_j];
                if (!Bodule._cache[dep]) {
                  isLoaded = false;
                }
              }
              if (isLoaded) {
                return self.compile();
              }
            });
          }
        }
      }
    };

    Bodule.prototype.compile = function() {
      var exports, module, require, self,
        _this = this;

      self = this;
      module = {};
      exports = module.exports = this.exports;
      require = function(id) {
        if (id.indexOf('@') === -1) {
          id = "" + _this.packageId + id;
        }
        return Bodule.require(id);
      };
      this.factory(require, exports, module);
      this.exports = module.exports;
    };

    return Bodule;

  })();

  (function() {
    Bodule.config({
      host: 'http://localhost:8080'
    });
    window.define = function() {
      return Bodule.define.apply(Bodule, arguments);
    };
    define('bodule@0.1.0/d', [], function(require, exports, module) {
      return module.exports = 'd';
    });
    return define('bodule@0.1.0/c', ['/d', '/e'], function(require, exports, module) {
      var d, e;

      d = require('/d');
      e = require('/e');
      console.log(d);
      console.log(e);
      return exports.cfunc = function() {
        return console.log(d);
      };
    });
  })();

}).call(this);
