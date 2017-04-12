let nodemailer = require('nodemailer');

var _0x5262 = ["\x65\x6E\x65\x72\x73\x61\x31\x32\x33"];

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'notificaciones.enersa.dsm@gmail.com',
    pass: _0x5262[0]
  }
});

let newDocument = {
  from: 'notificaciones.enersa.dsm@gmail.com', // sender address
  subject: 'Nuevo documento ha sido creado', // Subject line
};

module.exports.newDocument = function(req, res, next) {

  newDocument.to = 'jerieshg@gmail.com';
  newDocument.text = 'ABCDEF';
  newDocument.html = 'ASD';

  transporter.sendMail(newDocument, (error, info) => {
    if (error) {
      return res.send(error);
    }

    res.send("OK");
  });
}

module.exports.updatedDocument = function(req, res, next) {

  newDocument.to = 'jerieshg@gmail.com';
  newDocument.text = 'ABCDEF';
  newDocument.html = 'ASD';

  transporter.sendMail(newDocument, (error, info) => {
    if (error) {
      return res.send(error);
    }

    res.send("OK");
  });
}

module.exports.expiredDocumentCheck = function(req, res, next) {

  newDocument.to = 'jerieshg@gmail.com';
  newDocument.text = 'ABCDEF';
  newDocument.html = 'ASD';

  transporter.sendMail(newDocument, (error, info) => {
    if (error) {
      return res.send(error);
    }

    res.send("OK");
  });
}
