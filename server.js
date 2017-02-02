(function() {
	'use strict';

	var express = require('express');
	var bodyParser = require('body-parser');
	var app = express();
	var http = require('http').Server(app);
	var path = require('path');
	var mongoose = require('mongoose');

	//connect to mongoose
	mongoose.connect('mongodb://127.0.0.1/enersa');

	//CONFIGURATIONS
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	})); 
	app.use(express.static(path.join(__dirname, 'src', 'client')));

	//Initialize routes
	require('./src/server/routes')(app);

	//SERVER START
	app.set('port', (process.env.PORT || 3000));
	http.listen(app.get('port'), function() {
		console.log('listening on port: ' + app.get('port'));
	});

	exports = module.exports = app;
}());
