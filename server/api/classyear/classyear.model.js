'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClassSchema = new Schema({
  semester: String,
  bonusDays: [Date],
  current: false,
  displayURP:{type: Boolean, default: true},
  mentors: [{type : Schema.Types.ObjectId, ref: 'User'}],
  students: [{type : Schema.Types.ObjectId, ref: 'User'}],
  projects: [{type : Schema.Types.ObjectId, ref: 'Project'}],
  dayCodes: [{date:Date, code:String, bonusDay:Boolean}]
});

/*
	Virtuals
*/
ClassSchema
	.virtual("dayCode")
	.get(function(){
		var today = new Date();
		today.setHours(0,0,0,0);
		for (var i = 0;i < this.dayCodes.length;i++){
			if (this.dayCodes[i].date.getTime() == today.getTime()){
				return this.dayCodes[i].code;
			}
		}
		return null;
	});

ClassSchema
	.virtual("dayCodeInfo")
	.get(function(){
		var today = new Date();
		today.setHours(0,0,0,0);
		for (var i = 0;i < this.dayCodes.length;i++){
			if (this.dayCodes[i].date.getTime() == today.getTime()){
				return this.dayCodes[i];
			}
		}
		return null;
	});


var ClassYear;
ClassSchema.statics.getCurrent = function(cb){
	ClassYear.findOne({
		"current": true
	}, function(err, classYear){
		cb(err, classYear);
	});
};

ClassYear = mongoose.model('ClassYear', ClassSchema);
module.exports = ClassYear;
