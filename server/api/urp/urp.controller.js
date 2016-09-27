/**
 * Class Year Controller
 */

'use strict';
var pdfFillForm = require('pdf-fill-form');
var pdfFiller = require('pdffiller');
var fillPdf = require("fill-pdf");

var fs = require('fs');
var mkdirp = require('mkdirp');
var async = require('async');
var config = require('../../config/environment');

// Creates new urp

exports.create = function(req, res) {
  var data = req.body.semester;
  if (!data) return handleError(res, "No data provided");
  var destination = config.urpCreationPath + "/" + data.semester.year + "/" + data.semester.season;
  var sourcePDF = "URP.pdf";
  var timestamp = new Date().getTime().toString();
  var destinationPDF = destination+"/"+data.name+"_urp"+timestamp+".pdf";
  if(!fs.existsSync(destination)){
    mkdirp.sync(destination);
  }

  var shouldFlatten = false;

  var pdfData = {
    'studentName': data.name,
    'dateOfBirth': data.DOB,
    'emailAddress': data.email,
    'RIN': data.rin,
    'degreeProgram': data.degree,
    'rpiYear': 
  }


  // pdfFiller.fillForm( sourcePDF, destinationPDF, data, shouldFlatten, function(err) {
  //     if (err) throw err;
  //     console.log("In callback (we're done).");
  // });

  fillPdf.generatePdf(pdfData, sourcePDF, function(err, output) {
    if ( !err ) {
      res.type("application/pdf");
      res.send(output);
    }
  });


  //
  // pdfFillForm.read(sourcePDF)
  // .then(function(result) {
  //     console.log(result);
  // }, function(err) {
  //     console.log(err);
  // });

};

function handleError(res, err) {
  return res.send(500, err);
}

function validationError(res, err) {
  return res.status(422).json(err);
};


/*
RCOS_Supervisor_Name: "Wes Turner",
RCOS_Supervisor_Department: "CSCI",
RCOS_Supervisor_Phone: "x8326",
RCOS_Supervisor_Email: "turnewe2@rpi.edu",

 [ { name: 'studentName',
    page: 0,
    value: '',
    id: 65536,
    type: 'text' },
  { name: 'dateOfBirth',
    page: 0,
    value: '',
    id: 65537,
    type: 'text' },
  { name: 'emailAddress',
    page: 0,
    value: '',
    id: 65538,
    type: 'text' },
  { name: 'RIN', page: 0, value: '', id: 65539, type: 'text' },
  { name: 'degreeProgram',
    page: 0,
    value: '',
    id: 65540,
    type: 'text' },
  { name: 'rpiYear',
    page: 0,
    value: undefined,
    id: 65541,
    type: 'radio' },
  { name: 'fall', page: 0, value: '', id: 65542, type: 'text' },
  { name: 'spring', page: 0, value: '', id: 65543, type: 'text' },
  { name: 'summer', page: 0, value: '', id: 65544, type: 'text' },
  { name: 'Conducting research in an experimental lab',
    page: 0,
    value: undefined,
    id: 65545,
    type: 'radio' },
  { name: 'Completed lab safety training',
    page: 0,
    value: undefined,
    id: 65546,
    type: 'radio' },
  { name: 'Conducting research in an experimental lab',
    page: 0,
    value: undefined,
    id: 65547,
    type: 'radio' },
  { name: 'Completed lab safety training',
    page: 0,
    value: undefined,
    id: 65548,
    type: 'radio' },
  { name: 'month/year', page: 0, value: '', id: 65549, type: 'text' },
  { name: 'facultySupervisorName',
    page: 0,
    value: '',
    id: 65550,
    type: 'text' },
  { name: 'facultySupervisorDepartment',
    page: 0,
    value: '',
    id: 65551,
    type: 'text' },
  { name: 'facultySupervisorCampusPhone',
    page: 0,
    value: '',
    id: 65552,
    type: 'text' },
  { name: 'facultySupervisorEmailAddress',
    page: 0,
    value: '',
    id: 65553,
    type: 'text' },
  { name: 'rpiYear',
    page: 0,
    value: undefined,
    id: 65554,
    type: 'radio' },
  { name: 'rpiYear',
    page: 0,
    value: undefined,
    id: 65555,
    type: 'radio' },
  { name: 'rpiYear',
    page: 0,
    value: undefined,
    id: 65556,
    type: 'radio' },
  { name: 'projectTitle',
    page: 0,
    value: '',
    id: 65557,
    type: 'text' },
  { name: 'creditFundingExperience',
    page: 0,
    value: undefined,
    id: 65558,
    type: 'radio' },
  { name: 'courseNumber',
    page: 0,
    value: '',
    id: 65559,
    type: 'text' },
  { name: 'numberOfCredits',
    page: 0,
    value: '',
    id: 65560,
    type: 'text' },
  { name: 'moneyRequestedFromURP',
    page: 0,
    value: '',
    id: 65561,
    type: 'text' },
  { name: 'moneyMatchingAmount',
    page: 0,
    value: '',
    id: 65562,
    type: 'text' },
  { name: 'creditFundingExperience',
    page: 0,
    value: undefined,
    id: 65563,
    type: 'radio' },
  { name: 'creditFundingExperience',
    page: 0,
    value: undefined,
    id: 65564,
    type: 'radio' },
  { name: 'wageRate', page: 0, value: '', id: 65565, type: 'text' },
  { name: 'fundNumber', page: 0, value: '', id: 65566, type: 'text' },
  { name: 'orgNumber', page: 0, value: '', id: 65567, type: 'text' },
  { name: 'Reset',
    page: 0,
    value: undefined,
    id: 65568,
    type: 'push_button' },
  { name: 'studentName',
    page: 1,
    value: '',
    id: 131072,
    type: 'text' },
  { name: 'projectDescription',
    page: 1,
    value: 'Type or paste project description here.',
    id: 131073,
    type: 'text' } ]

*/
