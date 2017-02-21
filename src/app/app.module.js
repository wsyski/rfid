'use strict';

require('../style/app.css');
require('../../node_modules/angular-material/angular-material.css');

var angular = require('angular'),
    ngAnimate = require('angular-animate'),
    ngAria = require('angular-aria'),
    ngMessages = require('angular-messages'),
    ngMaterial = require('angular-material');

angular.module('main', ['ngMaterial']);

require('./app.controller');

