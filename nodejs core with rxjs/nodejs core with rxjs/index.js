require('babel-register')({
    presets: [ 'es2015' ]
})

module.exports = require('./server.js')