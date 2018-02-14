module.exports.dateToTime = function(isoDate){
  var date = new Date(isoDate);
  return date.getTime();
}

module.exports.convertToMidnight = function(isoDate){
  var date = new Date(isoDate);
  var offset = 8; // Use pacific time as the date cutoff
  date.setUTCHours(date.getUTCHours() - offset);
  date.setUTCHours(0,0,0,0);
  return date.getTime();
}

module.exports.setToZero = function(isoDate){
  var date = new Date(isoDate);
  date.setUTCHours(0,0,0,0);
  return date.getTime();
}
