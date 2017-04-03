(function() {
	'use strict';

	var express = require('express');
	var bodyParser = require('body-parser');
	var app = express();
	var http = require('http').Server(app);
	var path = require('path');
	var passport = require('passport');
	var fs = require('fs');
	var morgan = require('morgan');
	var rfs = require('rotating-file-stream');

	//CONFIGURATIONS
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	// create a write stream (in append mode)
	var logDirectory = path.join(__dirname, 'logs');
	// ensure log directory exists
	if (!fs.existsSync(logDirectory)) {
		fs.mkdirSync(logDirectory);
	}
	// create a rotating write stream
	var accessLogStream = rfs('access.log', {
		interval: '1d', // rotate daily
		path: logDirectory
	});

	// setup the logger
	app.use(morgan('combined', {
		stream: accessLogStream
	}));

	var isPRD = (process.env.NODE_ENV && process.env.NODE_ENV === 'production');
	isPRD = false; //temporary
	if (!isPRD) {
		app.use(express.static(path.join(__dirname, 'src', 'client')));
	} else {
		app.use(express.static(path.join(__dirname, 'dist')));
	}

	//call database connection
	require('./src/server/models/db')(app);
	//Initalize passport
	require('./src/server/config/passport');
	app.use(passport.initialize());

	//Log errors
	app.use(function(err, req, res, next) {
		console.error(err.stack);
		next(err);
	});

	//SERVER START
	app.set('port', (process.env.PORT || 3000));
	http.listen(app.get('port'), function() {
		console.log('listening on port: ' + app.get('port'));
	});

	exports = module.exports = app;
}());
