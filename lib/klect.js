var Klect, KlectCollection, glob, minimatch, path, url, _;

_ = require('lodash');

glob = require('glob');

minimatch = require('minimatch');

path = require('path');

url = require('url');

KlectCollection = function() {
  var arr;
  arr = [];
  arr.push.apply(arr, arguments);
  arr.__proto__ = KlectCollection.prototype;
  return arr;
};

KlectCollection.prototype = new Array;

KlectCollection.prototype.methods = function(method) {
  var item, _ref;
  return (_ref = []).concat.apply(_ref, (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      item = this[_i];
      _results.push(item[method]());
    }
    return _results;
  }).call(this));
};

KlectCollection.prototype.urls = function() {
  return this.methods('urls');
};

KlectCollection.prototype.files = function() {
  var item, _ref;
  return (_ref = []).concat.apply(_ref, (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      item = this[_i];
      _results.push(item.files);
    }
    return _results;
  }).call(this));
};

Klect = (function() {
  function Klect(config) {
    var _base, _base1, _base2;
    if (config == null) {
      config = {};
    }
    this._config = config;
    this._bundles = {};
    if ((_base = this._config).cwd == null) {
      _base.cwd = path.dirname(module.parent.filename) || './';
    }
    if ((_base1 = this._config).urlcwd == null) {
      _base1.urlcwd = '/';
    }
    if ((_base2 = this._config).defaultBundleName == null) {
      _base2.defaultBundleName = '_';
    }
    this;
  }

  Klect.prototype.urls = function() {
    var kc, key, val;
    kc = new KlectCollection();
    return KlectCollection.apply(kc, (function() {
      var _ref, _results;
      _ref = this._bundles;
      _results = [];
      for (key in _ref) {
        val = _ref[key];
        _results.push(val);
      }
      return _results;
    }).call(this)).urls();
  };

  Klect.prototype.files = function() {
    var kc, key, val;
    kc = new KlectCollection();
    return KlectCollection.apply(kc, (function() {
      var _ref, _results;
      _ref = this._bundles;
      _results = [];
      for (key in _ref) {
        val = _ref[key];
        _results.push(val);
      }
      return _results;
    }).call(this)).files();
  };

  Klect.prototype.gather = function(obj) {
    var bundle, file, files, found, isForced, key, name, networkRegex, val, _config, _gathered, _i, _len, _ref, _ref1, _uniques;
    _gathered = [];
    if (_.isArray(obj) || _.isString(obj)) {
      obj = _.object([this._config.defaultBundleName], [obj]);
    }
    networkRegex = /^(http(s)?:)?\/\//i;
    for (name in obj) {
      files = obj[name];
      if (!_.isArray(files)) {
        files = [files];
      }
      _gathered.push(name);
      bundle = this._bundles[name] = {
        name: name,
        files: []
      };
      _config = this._config;
      Object.defineProperty(bundle, 'urls', {
        enumerable: false,
        value: function() {
          var file, u;
          return u = (function() {
            var _i, _len, _ref, _results;
            _ref = this.files;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              file = _ref[_i];
              if (networkRegex.test(file)) {
                _results.push(file);
              } else {
                _results.push(url.resolve(_config.urlcwd, file));
              }
            }
            return _results;
          }).call(this);
        }
      });
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        if (isForced = /^\!/.test(file)) {
          file = file.replace(/^\!/, '');
        }
        _uniques = isForced ? [] : (_ref = []).concat.apply(_ref, (function() {
          var _ref, _results;
          _ref = this._bundles;
          _results = [];
          for (key in _ref) {
            val = _ref[key];
            _results.push(val.files);
          }
          return _results;
        }).call(this));
        found = networkRegex.test(file) ? [file] : _.difference(glob.sync(file, {
          cwd: this._config.cwd,
          nonegate: true
        }), _uniques);
        (_ref1 = bundle.files).push.apply(_ref1, found);
      }
    }
    return this;
  };

  Klect.prototype.bundles = function(name) {
    var bundles, match, matches;
    if (name == null) {
      name = '*';
    }
    matches = minimatch.match(Object.keys(this._bundles), name, {
      nonull: false
    });
    bundles = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        match = matches[_i];
        _results.push(this._bundles[match]);
      }
      return _results;
    }).call(this);
    return KlectCollection.apply(new KlectCollection(), bundles);
  };

  return Klect;

})();

module.exports = Klect;
