module.exports = function(router) {

  let path = require('path');
  let jwt = require('express-jwt');
  let _0xd239 = ["\x65\x76\x65\x72\x79\x74\x68\x69\x6E\x67\x69\x73\x61\x77\x65\x73\x6F\x6D\x65\x32\x30\x31\x37"];
  let auth = jwt({
    secret: _0xd239[0],
    userProperty: 'payload'
  });

  //Authentication API calls
  let Authentication = require('../controllers/Authentication');
  //Authentication API calls
  let Profile = require('../controllers/Profile');
  // Survey API calls
  let Survey = require('../controllers/Survey');
  //Business API calls
  let Business = require('../controllers/Business');
  //Department API calls
  let Department = require('../controllers/Department');
  //Client API calls
  let Client = require('../controllers/Client');
  //Roles API calls
  let Role = require('../controllers/Role');
  //Services API calls
  let Service = require('../controllers/Service');

  //AUTHENTICATION ROUTES
  router.route('/api/auth/login')
    .get(Authentication.login);
  router.route('/api/auth/register')
    .get(Authentication.register);
  //AUTHENTICATION ROUTES
  router.route('/api/profile')
    .get(auth, Profile.readProfile);
  //SURVEY ROUTES
  router.route('/api/surveys/')
    .get(Survey.readAll)
    .post(Survey.create);
  router.route('/api/surveys/:id')
    .put(Survey.update)
    .delete(Survey.delete);
  router.route('/api/surveys/:id')
    .get(Survey.find);
  router.route('/api/surveys/:client/client')
    .get(Survey.findByClient);
  router.route('/api/surveys/:id/client/:client/')
    .get(Survey.findbyClientAndId);

  //BUSINESS ROUTES
  router.route('/api/business/')
    .get(Business.readAll)
    .post(Business.create);
  router.route('/api/business/:id')
    .put(Business.update)
    .delete(Business.delete);
  router.route('/api/business/:id')
    .get(Business.find);

  //DEPARTMENT ROUTES
  router.route('/api/departments/')
    .get(Department.readAll)
    .post(Department.create);
  router.route('/api/departments/:id')
    .put(Department.update)
    .delete(Department.delete);
  router.route('/api/departments/:id')
    .get(Department.find);

  //CLIENT ROUTES
  router.route('/api/clients/')
    .get(Client.readAll)
    .post(Client.create);
  router.route('/api/clients/:id')
    .put(Client.update)
    .delete(Client.delete);
  router.route('/api/clients/:id')
    .get(Client.find);

  //ROLE ROUTES
  router.route('/api/roles/')
    .get(Role.readAll)
    .post(Role.create);
  router.route('/api/roles/:id')
    .put(Role.update)
    .delete(Role.delete);
  router.route('/api/roles/:id')
    .get(Role.find);

  //SERVICE ROUTES
  router.route('/api/services/')
    .get(Service.readAll)
    .post(Service.create);
  router.route('/api/services/:id')
    .put(Service.update)
    .delete(Service.delete);
  router.route('/api/services/:id')
    .get(Service.find);
  router.route('/api/services/:dept/department/')
    .get(Service.findByDepartment);

  // router to handle all angular requests
  router.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../../', 'client', 'views', 'index.html'));
  });
};
