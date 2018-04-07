
// handleError and other repeated function.
// Generic error handling for API requests

// Return a standard error
export const handleError = (res, err) => {
  return res.json(500, err).end()
}

// Return a validation error
export const validationError = (res, err) => {
    return res.status(422).json(err);
}

//Generating non ambigious length sized code.
export const generateCode = (codeLength) => {
  var characterOptions = "2346789ABCDEFGHJKMNPQRTUVWXYZ";
  //Non ambigious characters and numbers Remove Some if you think they are ambigious given your font.

  var code = ""; //Simple derivation based on previous code generation code.
  for(var i=0;i<codeLength;i++){
      var character = (Math.floor(Math.random() * characterOptions.length));
      code = code.concat(characterOptions[character.toString()]);
  }
  return code;
}

//Generating unique code.
export const uniqueDayCode = (codeLength,callback) => {
  var code = generateCode(codeLength);
  ClassYear.findOne({"dayCodes.code":code})
    .exec(function(err, classYear){
      if (err) return callback("error when getting dayCode",null);
      if(classYear) {
        return uniqueDayCode(codeLength+1,callback);
      }
      else{
        SmallGroup.findOne({"dayCodes.code":code})
          .exec(function(err, smallgroup){
            if (err) return callback("error when getting dayCode",null);
            if(smallgroup){
              return uniqueDayCode(codeLength+1,callback);
            }
            return callback(null,code);
        });
      }
  });
}
