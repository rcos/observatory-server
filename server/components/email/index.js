var config = require('../../config/environment');
var sendgrid = require("sendgrid")(config.sendgridApiKey);

module.exports.sendEmail = function(emailAddress, subject, sub, body, filter, callback){
	callback = callback || function(){};

  var email = new sendgrid.Email();

  email.addTo(emailAddress);
  email.setFrom(config.serverEmail);
  email.setSubject(subject);
  email.setHtml(body);
  email.setSubstitutions(sub);
  email.setFilters(filter);

	sendgrid.send(email, function(err, json){
		if (err){
      callback(err, json);
		}else{
		  callback(null, json);
		}
	});
};
