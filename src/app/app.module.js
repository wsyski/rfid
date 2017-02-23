'use strict';

require('../style/app.css');
require('../../node_modules/angular-material/angular-material.css');

var angular = require('angular'),
    ngMaterial = require('angular-material'),
    ngRoute = require('angular-route'),
    rfid = require('./rfid/rfid.module');

angular.module('app', ['ngMaterial','ngRoute','rfid']);

require('./app.config');

