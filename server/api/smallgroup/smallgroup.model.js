'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SmallGroupSchema = new Schema({
  semester: String,
  name: String,
  enabled: Boolean,
  students: [{type : Schema.Types.ObjectId, ref: 'User'}],
  dayCodes: [{date:Date, code:String}]
});

/*
	Virtuals
*/
SmallGroupSchema
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

var SmallGroup = mongoose.model('SmallGroup', SmallGroupSchema);
module.exports = SmallGroup;
