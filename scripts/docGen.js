var Docs = require("express-api-doc");
var app = require("../server"); // your app.js
var fs = require("fs");
var path = require('path');
var docs = new Docs(app);

// need to find root directory so we know where the docs folder is.
var rootDir = path.normalize(__dirname + '/..');

var apiDocExamples = rootDir + "/docs/api-examples.json";
var apiDocTemplate = rootDir + "/docs/apiDocs.html";

if (!fs.existsSync(apiDocExamples)) {
  // Doc library doesn't gracefully handle the case where specified examples file doesn't exist; so handle it manually
  apiDocExamples = "";
}

// generate API docs
docs.generate({
  path: apiDocTemplate,
  examples: apiDocExamples
});