require('../style/app.css');
require('../../node_modules/angular-material/angular-material.css');

var angular = require('angular'),
    app = require('./app.module');

function main() {
    angular.bootstrap(document.getElementById('container'), ['app']);
}

document.addEventListener('DOMContentLoaded', main);
