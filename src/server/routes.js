module.exports = function(router) {

	let path = require('path');

	// Survey API calls
	require('./helpers/SurveyHelper')(router);
	//Business API calls
	require('./helpers/BusinessHelper')(router);
	//Department API calls
	require('./helpers/DepartmentHelper')(router);
	//Client API calls
	require('./helpers/ClientHelper')(router);
	//Roles API calls
	require('./helpers/roleHelper')(router);
	//Services API calls
	require('./helpers/ServiceHelper')(router);


	// router to handle all angular requests
	router.get('*', function(req, res) {
		res.sendFile(path.join(__dirname, '../', 'client', 'views', 'index.html'));
	});
};
