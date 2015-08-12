var config = require('../../config/environment');
var sendgrid = require("sendgrid")(config.sendgridApiKey);

module.exports.send = function(email, subject, text, callback){
	callback = callback || function(){};
	sendgrid.send({
		to: email,
		from: config.serverEmail,
		subject: subject,
		text: text
	}, function(err, json){
		if (err){
			callback("An error occurred sending the email");
			console.error(err, json);
		}else{
		  callback(null);
		}
	});
};