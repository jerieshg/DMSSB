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
	app.use(express.static(path.join(__dirname, 'src', 'client')));

	//Initialize routes
	require('./src/server/routes/index')(app);
	//Initalize passport
	require('./src/server/config/passport');
	app.use(passport.initialize());

	app.use(function(err, req, res, next) {
		if (err.name === 'UnauthorizedError') {
			res.status(401);
			res.json({
				"message": err.name + ": " + err.message
			});
		}
	});

	//SERVER START
	app.set('port', (process.env.PORT || 3000));
	http.listen(app.get('port'), function() {
		console.log('listening on port: ' + app.get('port'));
	});

	exports = module.exports = app;
}());
