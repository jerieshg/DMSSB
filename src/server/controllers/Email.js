let nodemailer = require('nodemailer');
let Client = require('../models/Client');
let Document = require('../models/Document');

var _0x5262 = ["\x65\x6E\x65\x72\x73\x61\x31\x32\x33"];

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'notificaciones.enersa.dsm@gmail.com',
    pass: _0x5262[0]
  }
});

module.exports.sendRejectedDocument = function(req, res, next) {
  Document.findOne({
    _id: req.params.docId
  }, (error, doc) => {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    Client.findOne({
      _id: doc.createdBy._id
    }, (error, client) => {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      if (client.email) {
        let newEmail = {
          from: 'notificaciones.enersa.dsm@gmail.com',
          subject: `Documento ${doc.name} fue rechazado`,
          to: client.email,
          html: `El documento ${doc.name} ha sido ${doc.type.blueprint ? 'rechazado' : doc.status.toLowerCase()} por ${req.params.clientName}. Por favor revise los comentarios escritos dentro del documento. `
        };


        transporter.sendMail(newEmail, (error, info) => {
          if (error) {
            next(error);
            return res.send(error);
          }

          res.send("OK");
        });
      } else {
        res.send("El usuario no tiene correo electronico");
      }
    });
  });
}

module.exports.expiredDocumentCheck = function() {
  Document.find({
    expiredDate: {
      $ne: null
    },
    "flow.published": true
  }, (error, docs) => {
    if (error) {
      console.log(error);
      return error;
    }

    let aboutToExpireDocs = docs.filter((doc) => {
      var expiredDate = new Date(doc.expiredDate);
      var timeDiff = Math.abs(new Date().getTime() - expiredDate.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return diffDays <= 30;
    });

    aboutToExpireDocs.forEach((doc) => {
      if (doc.createdBy && doc.createdBy._id) {
        Client.findOne({
          _id: doc.createdBy._id
        }, (error, client) => {
          if (error) {
            console.log(error);
            return error;
          }

          if (client.email) {
            let newEmail = {
              from: 'notificaciones.enersa.dsm@gmail.com',
              subject: `Documento ${doc.name} esta por expirar!`,
              to: client.email,
              html: `El documento ${doc.name} vence el ${doc.expiredDate.toISOString().substring(0, 10)}. Por favor realice una revision al documento.`
            };


            transporter.sendMail(newEmail, (error, info) => {
              if (error) {
                console.log(error);
                return error;
              }
            });
          } else {
            console.log("El usuario no tiene correo electronico");
          }
        });
      } else {
        console.log("No tiene solicitante");
      }
    });
  })
}
