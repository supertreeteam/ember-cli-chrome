var path = require('path');
var replace = require('broccoli-replace');
var funnel   = require('broccoli-funnel');
var stringUtil = require('ember-cli/lib/utilities/string');
var unwatchedTree = require('./unwatched-tree');

var Utilities = (function() {
  return {
    treePath: path.join('node_modules', 'supertree-chrome-extension', 'chrome-files/'),
    disableFingerPrints: function(app) {
      app.options.fingerprint = app.options.fingerprint || {};
      app.options.fingerprint.enabled = false;
    },
    addChromeHelper: function(app) {
      app.import('vendor/ember-chrome.js')
    },
    forceNoneLocation: function(app) {
      // This is a hack to allow us to forcefully set
      // locationType to none since we don't want to hijack
      // the URL

      var oldContentFor = app.contentFor.bind(app);
      app.contentFor = function(config, match, type) {
        config.locationType = 'none';
        return oldContentFor(config, match, type);
      };
    },
    manifestTree: function(app) {
      var self = this;

      var nameString = function() {
        return app.name;
      };

      var descString = function() {
        return app.project.pkg.description;
      };

      var versionString = function() {
        return app.project.pkg.version;
      };

      var files = ['manifest.json'];

      var manifestTree = funnel(unwatchedTree(self.treePath), {
        srcDir: '/',
        files: files,
        destDir: '/',
      });

      var tree = replace(manifestTree, {
        files: files,
        patterns: [
        {
          match: /\{\{APPNAME\}\}/g,
          replacement: nameString,
        },
        {
          match: /\{\{APPDESC\}\}/g,
          replacement: descString,
        },
        {
          match: /\{\{APPVERSION\}\}/g,
          replacement: versionString,
        }, ],
      });

      return tree;
    },
    iconTree: function() {
      var self = this;
      var files = ['chrome-icon.png', 'chrome-icon-lg.png'];
      var tree = funnel(unwatchedTree(self.treePath), {
        srcDir: '/',
        files: files,
        destDir: '/',
      });
      return tree;
    },
    scriptTree: function() {
      var self = this;
      var files = ['background.js', 'chromereload.js', 'contentscript.js', 'insert.js'];
      var tree = funnel(unwatchedTree(self.treePath), {
        srcDir: '/scripts/',
        files: files,
        destDir: '/scripts/',
      });
      return tree;
    },
  };
})();

module.exports = Utilities;
