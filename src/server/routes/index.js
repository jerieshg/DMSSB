module.exports = function(router) {

  let multiparty = require('connect-multiparty');
  let multipartyMiddleware = multiparty();
  let fse = require('fs-extra');

  let multer = require('multer');
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let completePath = path.join(__dirname, `/../../../uploads/${req.params.name}/`);
      fse.mkdirsSync(completePath);
      cb(null, completePath);
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  let upload = multer({
    storage: storage
  });

  let path = require('path');
  let jwt = require('express-jwt');
  let _0xd239 = ["\x65\x76\x65\x72\x79\x74\x68\x69\x6E\x67\x69\x73\x61\x77\x65\x73\x6F\x6D\x65\x32\x30\x31\x37"];
  let auth = jwt({
    secret: _0xd239[0],
    userProperty: 'payload'
  });

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
  //Authentication API calls
  let Authentication = require('../controllers/Authentication');
  //Profile API calls
  let Profile = require('../controllers/Profile');
  //Survey Responses API calls
  let SurveyResponse = require('../controllers/Survey-Response');
  //Job calls API calls
  let Job = require('../controllers/Job');
  //Excel calls
  let Excel = require('../controllers/Excel');
  //DocumentType API calls
  let DocumentType = require('../controllers/Document-Type');
  //Document API calls
  let Document = require('../controllers/Document');
  //Document History API calls
  let DocumentHistory = require('../controllers/Document-History');
  //Document API calls
  let _System = require('../controllers/System');
  //Document API calls
  let Implication = require('../controllers/Implication');

  //SURVEY ROUTES
  router.route('/api/surveys/')
    .get(Survey.readAll)
    .post(Survey.create);
  router.route('/api/surveys/:id/')
    .put(Survey.update)
    .delete(Survey.delete);
  router.route('/api/surveys/:id/')
    .get(Survey.find);
  router.route('/api/surveys/clients/:client/')
    .get(Survey.findByClient);
  router.route('/api/surveys/:id/clients/:client/')
    .get(Survey.findbyClientAndId)
  router.route('/api/surveys/department/:dept/')
    .get(Survey.findByDepartment)
  router.route('/api/surveys/:id/department/:dept/')
    .get(Survey.findbyDeptAndId)
  router.route('/api/surveys/:id/track/')
    .get(Survey.trackResponses)
  router.route('/api/surveys/:id/grades/')
    .post(Survey.updateFinalGrade)
  router.route('/api/surveys/responses/')
    .post(SurveyResponse.createMany)
  router.route('/api/surveys/:id/responses/')
    .get(SurveyResponse.readBySurveyId)
    .delete(SurveyResponse.delete);
  router.route('/api/surveys/responses/client/:clientId')
    .get(SurveyResponse.readByClientId);


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
    .get(Client.readAll);
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
  router.route('/api/services/departments/:dept')
    .get(Service.findByDepartment);

  //AUTHENTICATION ROUTES
  router.route('/api/auth/login/')
    .post(Authentication.login);
  router.route('/api/auth/register/')
    .post(Authentication.register);
  //AUTHENTICATION ROUTES
  router.route('/api/profile/')
    .get(auth, Profile.readProfile);

  //Export to Excel
  router.route('/api/excel/:id')
    .get(Excel.exportToExcel);
  router.route('/api/excel/')
    .post(Excel.exportToExcelBatch)

  //JOBS ROUTES
  router.route('/api/jobs/')
    .get(Job.readAll)
    .post(Job.create);
  router.route('/api/jobs/:id')
    .put(Job.update)
    .delete(Job.delete);
  router.route('/api/jobs/:id')
    .get(Job.find);

  //DocTypes ROUTES
  router.route('/api/document-types/')
    .get(DocumentType.readAll)
    .post(DocumentType.create);
  router.route('/api/document-types/:id')
    .put(DocumentType.update)
    .delete(DocumentType.delete);
  router.route('/api/document-types/:id')
    .get(DocumentType.find);

  //System ROUTES
  router.route('/api/systems/')
    .get(_System.readAll)
    .post(_System.create);
  router.route('/api/systems/:id')
    .put(_System.update)
    .delete(_System.delete);
  router.route('/api/systems/:id')
    .get(_System.find);

  //Implication ROUTES
  router.route('/api/implications/')
    .get(Implication.readAll)
    .post(Implication.create);
  router.route('/api/implications/:id')
    .put(Implication.update)
    .delete(Implication.delete);
  router.route('/api/implications/:id')
    .get(Implication.find);

  //Upload Documents
  router.route('/api/documents/downloads/:path')
    .get(Document.downloadFile);
  router.route('/api/documents/:id')
    .get(Document.find);
  router.route('/api/documents/:name')
    .post(upload.any(), Document.create);
  router.route('/api/documents/clients/:id')
    .get(Document.findMyDocuments);
  router.route('/api/documents/auths/:id')
    .get(Document.findToAuthorizeDocuments);

  //Document History ROUTES
  router.route('/api/documents-history/')
    .get(DocumentHistory.readAll)
    .post(DocumentHistory.create);
  router.route('/api/documents-history/:id')
    .put(DocumentHistory.update)
    .delete(DocumentHistory.delete);
  router.route('/api/documents-history/:id')
    .get(DocumentHistory.find);

  // router to handle all angular requests
  router.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../../', 'client', 'views', 'index.html'));
  });
};
