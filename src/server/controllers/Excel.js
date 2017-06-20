let SurveyResponse = require('../models/Survey-Response');
let Survey = require('../models/Survey.js');

//Required for migration
let Document = require('../models/Document');
let _System = require('../models/System');
let DocumentType = require('../models/Document-Type');
let Client = require('../models/Client');

let excel = require('node-excel-export');
let xlstojson = require("xls-to-json-lc");
let xlsxtojson = require("xlsx-to-json-lc");
let path = require('path');
let fs = require('fs');


let multer = require('multer');
let storage = multer.diskStorage({ //multers disk storage settings
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, `/../../../uploads/`))
  },
  filename: function(req, file, cb) {
    let datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
  }
});

let upload = multer({ //multer settings
  storage: storage,
  fileFilter: function(req, file, callback) { //file filter
    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
      return callback(new Error('Wrong extension type'));
    }
    callback(null, true);
  }
}).single('files');

module.exports.migratePreviousVersion = function(req, res, next) {
  let exceltojson; //Initialization

  upload(req, res, function(error) {
    if (error) {
      next(error);
      return res.status(500).json(error);
      return;
    }

    if (!req.file) {
      res.json({
        error_code: 1,
        err_desc: "No file passed"
      });

      return;
    }

    if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
      exceltojson = xlsxtojson;
    } else {
      exceltojson = xlstojson;
    }

    try {
      exceltojson({
        input: req.file.path, //the same path where we uploaded our file
        output: null, //since we don't need output.json
        lowerCaseHeaders: true
      }, function(error, result) {
        if (error) {
          next(error);
          return res.status(500).json(error);
        }

        let migratedItems = [];
        let convertedItems = [];
        let promises = [];

        result.forEach((item) => {

          let migratedDoc = new Document({
            name: item.nombre,
            priority: item.prioridad ? item.prioridad : 'Normal',
            requiredDate: item.fecharequerida ? new Date(item.fecharequerida) : null,
            business: item.planta,
            department: item.departamento,
            expiredDate: item.fecharevision ? new Date(item.fecharevision) : null,
            requiresSafetyEnv: item.revisionmedioambiente,
            status: 'Publicado',
            comments: item.comentario,
            flow: {
              blueprintApproved: item.sistema || (item.tipo && item.tipo.toUpperCase().includes('PLANO')) ? true : false,
              published: item.fechapublicacion ? true : false,
              deleted: item.activo ? !item.activo : false
            },
            publication: {
              code: item.codigo,
              revision: item.versionvigente,
              publicationDate: item.fechapublicacion ? new Date(item.fechapublicacion) : null
            },
            timeStored: item.tiempodealmacenamiento,
            migrated: true
          });

          if (item.activo && item.activo === false) {
            migratedDoc.status = 'Anulado';
          }

          migratedDoc.tipo = item.tipo;
          migratedDoc.sistema = item.sistema;
          migratedDoc.solicitud = item.solicitud;
          migratedDoc.implicacion = item.implicacion;

          convertedItems.push(migratedDoc);
          promises.push(findDoc(item.nombre, migratedDoc.business, migratedDoc.department));
          promises.push(findSystem(item.sistema));
          promises.push(findType(item.tipo));
        });

        Promise.all(promises).then(values => {
          convertedItems.forEach((doc, index) => {

            let foundDoc = values.find((e) =>
              e && (e.name === doc.name && (e.business && e.business.includes(doc.business)) && e.department === doc.department)
            );

            if (!foundDoc) {
              let type = values.find((e) => {
                return e && (e.type === doc.tipo);
              });

              convertedItems[index].type = type ? type : doc.tipo;
              if (type) {
                convertedItems[index].request = convertedItems[index].type.requests[doc.solicitud];
              }


              if (type && type.blueprint) {
                let system = values.find((e) => e && (e.system === doc.sistema));
                convertedItems[index].system = system ? system.system : doc.sistema;
                if (system) {
                  convertedItems[index].implication = system.implications ? system.implications.find((x) => x.implication === doc.implicacion) : {};
                }
              }

              migratedItems.push(convertedItems[index]);
            }
          });

          fs.unlinkSync(req.file.path);
          res.status(200).json({
            data: migratedItems
          });
        }).catch(reason => {
          console.log(reason);
          fs.unlink(req.file.path);
          res.status(500).json(reason);
        });
      });
    } catch (e) {
      res.status(500).json({
        err_desc: "Archivo de excel corrupto"
      });
    }
  });
}

module.exports.exportAllSurveys = function(req, res, next) {
  Survey.find({}, function(error, surveys) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    let styles = {
      headers: {
        fill: retrieveFill('2196F3'),
        font: retrieveFontStyle('FFFFFF', true),
      },
      cellCentered: {
        alignment: {
          horizontal: "center",
          wrapText: true
        }
      }
    }

    let headers = new Set();
    headers.add("Nombre");
    headers.add("Empresa");
    headers.add("Departamento");
    headers.add("Inicio");
    headers.add("Fin");
    headers.add("Responsable");
    headers.add("Nota");
    headers.add("Respuestas");
    headers.add("% de Participacion");

    let dataSet = [];

    surveys.forEach((survey) => {
      let data = {};

      data["Nombre"] = survey.surveyName;
      data["Empresa"] = survey.business.join(",");
      data["Departamento"] = survey.department;
      data["Inicio"] = survey.period.start;
      data["Fin"] = survey.period.end;
      data["Responsable"] = survey.responsible;
      data["Nota"] = `${(survey.finalGrade ? survey.finalGrade * 100 : 0).toFixed(2)}%`;

      data["Respuestas"] = req.body.responses[survey._id] + "";

      let count = req.body.count.find(e => survey._id.toString() === e.surveyId);

      if (count) {
        data["% de Participacion"] = `${((count.currentTotal/count.total) * 100).toFixed(2)}%` + "";
      }

      dataSet.push(data);
    });

    let specification = {};

    Array.from(headers).forEach((e) => {
      specification[e] = {
        displayName: e,
        headerStyle: styles.headers,
        cellStyle: styles.cellCentered,
        width: 120
      }
    });

    var report = excel.buildExport(
      [{
        name: 'Encuestas',
        specification: specification,
        data: dataSet
      }]
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
    return res.send(report);
  });
};

module.exports.exportToExcel = function(req, res, next) {

  SurveyResponse.find({
    surveyId: req.params.id
  }, function(error, responses) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    let styles = {
      headers: {
        fill: retrieveFill('2196F3'),
        font: retrieveFontStyle('FFFFFF', true),
        cellCentered: {
          alignment: {
            horizontal: "center",
            wrapText: true
          }
        }
      }
    }

    let headers = new Set();
    headers.add("Timestamp");

    let dataSet = [];

    responses.forEach((element) => {
      let data = {};
      data["Timestamp"] = element.timestamp;

      element.results.forEach((question) => {
        let questionText = question.question;
        headers.add(questionText);

        let answer = question.answer;
        answer = (question.value ? `${answer}|${question.value}` : answer);
        data[questionText] = answer;
      });

      dataSet.push(data);
    });

    let specification = {};

    Array.from(headers).forEach((e) => {
      specification[e] = {
        displayName: e,
        headerStyle: styles.headers,
        cellStyle: styles.cellCentered,
        width: 120
      }
    });

    var report = excel.buildExport(
      [{
        name: 'archivo',
        specification: specification,
        data: dataSet
      }]
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
    return res.send(report);
  });
};

module.exports.exportToExcelBatch = function(req, res) {

  let colors = ["2196F3", "ffc000", "8BC34A", "9C27B0", "EF5350", "FF5722", "607D8B"];
  let selectedColor = new Map();

  let actionPlan = req.body;
  let styles = {
    headers: {
      alignment: {
        horizontal: "center"
      },
      fill: retrieveFill('ed7d31'),
      font: retrieveFontStyle('FFFFFF', true),
      border: retrieveFullBorder()
    },
    cellCentered: {
      alignment: {
        horizontal: "center"
      },
      border: retrieveFullBorder(),
      font: {
        sz: 11
      }
    },
    cellQuestion: {
      alignment: {
        horizontal: "center"
      },
      border: retrieveFullBorder(),
      fill: retrieveFill('E0E0E0'),
      font: retrieveCellStyle('000000', 'E0E0E0', false)
    },
    cellActivity: {
      alignment: {
        horizontal: "center"
      },
      border: retrieveFullBorder(),
      fill: retrieveFill('FFF8E1')
    }
  };

  let specification = {};
  specification["Dimension"] = {
    displayName: "Dimension",
    headerStyle: styles.headers,
    cellStyle: (value, row) => {
      if (!value) {
        return {};
      }

      let color = selectedColor.get(value);
      if (!selectedColor.has(value)) {
        color = colors[Math.floor(Math.random() * colors.length)];
        selectedColor.set(value, color);
      }

      return retrieveCellStyle('FFFFFF', color, true);
    },
    width: 180
  };
  specification["Preguntas"] = {
    displayName: `Preguntas < ${actionPlan.percentage}%`,
    headerStyle: styles.headers,
    cellStyle: (value, row) => {
      return (value) ? styles.cellQuestion : {};
    },
    width: 400
  };
  specification["Nota Final"] = {
    displayName: `Nota Final (${actionPlan.finalGrade}%)`,
    headerStyle: styles.headers,
    cellStyle: (value, row) => {
      return (value) ? styles.cellQuestion : {};
    },
    width: 80
  };
  specification["# de respuestas"] = {
    displayName: `# de respuestas (Total: ${actionPlan.totalResponses})`,
    headerStyle: styles.headers,
    cellStyle: (value, row) => {
      return (value) ? styles.cellQuestion : {};
    },
    width: 80
  };
  specification["Plan de Acción/Actividades"] = {
    displayName: "Plan de Acción/Actividades",
    headerStyle: styles.headers,
    cellStyle: (value, row) => {
      return (row.Preguntas) ? styles.cellActivity : {};
    },
    width: 150
  };
  specification["Fecha Cierre"] = {
    displayName: "Fecha Cierre",
    headerStyle: styles.headers,
    cellStyle: styles.cellCentered,
    width: 120
  };
  specification["Responsables"] = {
    displayName: "Responsables",
    headerStyle: styles.headers,
    cellStyle: styles.cellCentered,
    width: 120
  };
  specification["Recurso|Descripcion"] = {
    displayName: "Recurso|Descripcion",
    headerStyle: styles.headers,
    cellStyle: styles.cellCentered,
    width: 120
  };
  specification["Recurso|Presupuesto"] = {
    displayName: "Recurso|Presupuesto",
    headerStyle: styles.headers,
    cellStyle: styles.cellCentered,
    width: 120
  };
  specification["% de Avance"] = {
    displayName: "% de Avance",
    headerStyle: styles.headers,
    cellStyle: styles.cellCentered,
    width: 120
  };
  specification["Observaciones"] = {
    displayName: "Observaciones",
    headerStyle: styles.headers,
    cellStyle: styles.cellCentered,
    width: 120
  };

  let dataSet = [];
  for (var keys = Object.keys(actionPlan.items), i = 0; i < keys.length; i++) {
    var key = keys[i];



    actionPlan.items[key].forEach((e) => {
      let isText = e.formType === 'text' || e.formType === 'comment';
      let data = {};
      data["Dimension"] = key;
      data["Preguntas"] = e.question;
      data["Nota Final"] = isText ? e.textResponse : `${e.percentage}%`;
      data["# de respuestas"] = e.responses;
      data["Plan de Acción/Actividades"] = "";
      data["Fecha Cierre"] = "";
      data["Responsables"] = "";
      data["Recurso|Descripcion"] = "";
      data["Recurso|Presupuesto"] = "";
      data["% de Avance"] = "";
      data["Observaciones"] = "";
      dataSet.push(data);
    });

    if ((i + 1) !== keys.length) {
      dataSet.push(retrieveEmptyRow());
    }
  };

  var report = excel.buildExport(
    [{
      name: 'Plan de Acción',
      specification: specification,
      data: dataSet
    }]
  );

  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
  return res.send(report);
};



function retrieveEmptyRow() {
  let data = {};
  data["Dimension"] = "";
  data["Preguntas"] = "";
  data["Nota Final"] = "";
  data["# de respuestas"] = "";
  data["Plan de Acción/Actividades"] = "";
  data["Fecha Cierre"] = "";
  data["Responsables"] = "";
  data["Recurso|Descripcion"] = "";
  data["Recurso|Presupuesto"] = "";
  data["% de Avance"] = "";
  data["Observaciones"] = "";
  return data;
}

function retrieveFill(color) {
  return {
    fgColor: {
      rgb: color
    }
  }
}

function retrieveFullBorder() {
  return {
    top: {
      style: "thin",
      color: "000000"
    },
    bottom: {
      style: "thin",
      color: "000000"
    },
    left: {
      style: "thin",
      color: "000000"
    },
    right: {
      style: "thin",
      color: "000000"
    }
  }
}

function retrieveCellStyle(color, bgColor, bold) {
  return {
    border: retrieveFullBorder(),
    fill: {
      fgColor: {
        rgb: bgColor
      }
    },
    alignment: {
      horizontal: "center"
    },
    font: retrieveFontStyle(color, bold)
  }
}

function retrieveFontStyle(color, bold) {
  return {
    color: {
      rgb: color
    },
    sz: 11,
    bold: bold
  }
}

function findDoc(name, business, department) {
  return Document.findOne({
    name: name,
    business: {
      $in: business
    },
    department: department
  }).exec();
}

function findClient(username) {
  return Client.findOne({
    username: username
  }).exec();
}

function findSystem(system) {
  return _System.findOne({
    system: system
  }).exec();
}

function findType(docType) {
  return DocumentType.findOne({
    type: docType
  }).exec();
}
