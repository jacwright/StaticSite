
exports.config =
  paths:
    public: 'build'
    watched: ['src', 'test', 'vendor']
  files:
    javascripts:
      joinTo:
        'staticsite.js': /^vendor|^src/
  modules:
    nameCleaner: (path) ->
      path.replace(/^src\//, '')