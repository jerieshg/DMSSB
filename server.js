(function() {
	'use strict';

	var express = require('express');
	var bodyParser = require('body-parser');
	var app = express();
	var http = require('http').Server(app);
	var path = require('path');
	var mongoose = require('mongoose');
	var passport = require('passport');

	//connect to mongoose
	mongoose.connect('mongodb://127.0.0.1/enersa');

	//CONFIGURATIONS
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	var PRD = (process.env.NODE_ENV && process.env.NODE_ENV === 'production');
	console.log("PRD: " + PRD);
	if (PRD) {
		app.use(express.static(path.join(__dirname, 'src', 'client')));
	} else {
		app.use(express.static('dist'));
	}


	//Initialize routes
	require('./src/server/routes/index')(app);
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
