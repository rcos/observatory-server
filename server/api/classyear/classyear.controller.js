/**
 * Class Year Controller
 */

'use strict';

var ClassYear = require('./classyear.model');

// Get current class year
exports.index = function(req, res) {
  ClassYear.findOne({
  	"current": true
  }, function (err, classYear) {
  	if(err) { return handleError(res, err); }
   	return res.status(200).json(classYear);
  });
};

// Get a specific class year
exports.getClassYear = function(req, res) {
  ClassYear.findOne({
    "semester": req.params.semester
  }, function (err, classYear){
    if(err) { return handleError(res, err); }
    if (!classYear) return res.send(404);
    res.json(classYear);
  })
};

// Get a specific class year's attendance bonus days
exports.countBonusDays = function(req, res) {
  ClassYear.findOne({
    "current": true
  }, function (err, classYear){
    if(err) { return handleError(res, err); }
    if (!classYear) return res.send(404);
    var bonusDays  = classYear.dayCodes.reduce(function(previousValue, currentValue) {
      return previousValue + (currentValue.bonusDay ? 1 : 0); // Add 1 to the count for each bonusday in classYear.dayCodes
    }, 0);
    res.json(bonusDays);
  });
};



// Creates new class year
exports.create = function(req, res) {
  var semester = req.body.semester;
  if (!semester) return handleError(res, "No Semester Specified");
  ClassYear.findOne({
    "semester": req.body.semester
  }, function(err, classYear){
    if (classYear){
      // Set existing class year as current class year and do not create
      // a new class year
      classYear.current = true;
    }else{
      // Create new class year and set as current
      classYear = new ClassYear(req.body);
      classYear.current = true;
    }
    classYear.save(function(err, classYear){
      if (err) return validationError(res, err);

      // Make sure there are no other current class years
      ClassYear.find({
        "current": true,
        "semester": {$ne : classYear.semester}
      }, function(err, otherClassYears){

        for (var i = 0 ; i < otherClassYears.length ; i++){
          var otherClassYear = otherClassYears[i];
          if (classYear.semester !== otherClassYear.semester){
            otherClassYear.current = false;
            otherClassYear.save();
          }
        }
      });
      ClassYear.getCurrent(function(err, currentClassYear){
          global.currentClassYear = currentClassYear;
          res.send(204);
      });
    });

  })
};

// Update class year
exports.update = function(req, res) {
  ClassYear.findOne({
    "semester": req.params.semester
  },function(err, classYear){
    if(err) { return handleError(res, err); }
    classYear.update(req.body, function(err){
      if(err) { return handleError(res, err); }
      ClassYear.getCurrent(function(err, currentClassYear){
          global.currentClassYear = currentClassYear;
          res.send(204);

      });

    });
  });
};

// Deletes a class year from the DB.
exports.destroy = function(req, res) {
  ClassYear.findOne({
    "semester": req.params.semester
  }, function(err, classYear){
    classYear.delete();
  });
};

// Generate a daycode or return the current day code for the
// current class year
exports.daycode = function(req, res){
  ClassYear.findOne({
    "current": true
  }, function(err, classYear){
    if (err) return handleError(res, err);
    var today = new Date();
    today.setHours(0,0,0,0);
    for (var i = 0;i < classYear.dayCodes.length;i++){
      if (today.getTime() === classYear.dayCodes[i].date.getTime()){
        return res.send(200, classYear.dayCodes[i].code);
      }
    }
    //Not ambigious code generator, function at the bottom.
    var code = generateCode(6);

    classYear.dayCodes.push({
      date: today,
      code: code,
      bonusDay: req.body.bonusDay ? true : false
    });
    classYear.save(function(err, classYear){
      if (err) return handleError(res, err);
      res.send(200, code);
    });
  });
};

// Toggles URP display
exports.displayURP = function(req, res) {
  ClassYear.findOne({
    "current": true
  }, function(err, classYear){
    if(err) { return handleError(res, err); }
    classYear.update(req.body, function(err){
      if(err) { return handleError(res, err); }
      res.send(200);
    });
  });
};

// Toggles URP display
exports.getDisplayURP = function(req, res) {
  ClassYear.findOne({
    "current": true
  }, function (err, classYear){
    if(err) { return handleError(res, err); }
    // if no class year is defined then don't show urp
    if(!classYear) {
      res.json({displayURP: false});
    } else {
      res.json({displayURP:classYear.displayURP});
    }
  })
};


function handleError(res, err) {
  return res.send(500, err);
}

function validationError(res, err) {
  return res.status(422).json(err);
};

//Generating non ambigious length sized code.
function generateCode(codeLength){
  var characterOptions = "2346789ABCDEFGHJKMNPQRTUVWXYZ";
  //Non ambigious characters and numbers Remove Some if you think they are ambigious given your font.

  var code = ""; //Simple derivation based on previous code generation code.
  for(var i=0;i<codeLength;i++){
      var character = (Math.floor(Math.random() * characterOptions.length));
      code = code.concat(characterOptions[character.toString()]);
  }
  return code;
}
