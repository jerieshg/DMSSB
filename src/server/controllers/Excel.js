let SurveyResponse = require('../models/SurveyResponse');
let excel = require('node-excel-export');

module.exports.exportToExcel = function(req, res) {

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
    displayName: "Nota Final",
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
      let data = {};
      data["Dimension"] = key;
      data["Preguntas"] = e.question;
      data["Nota Final"] = `${e.percentage}%`;
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
