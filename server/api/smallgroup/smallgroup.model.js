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
function isoDateToTime(isoDate){
  var date = new Date(isoDate);
  date.setHours(0,0,0,0);
  return date.getTime();
}

SmallGroupSchema
	.virtual('dayCode')
	.get(function(){
		var today = new Date();
		for (var i = 0;i < this.dayCodes.length;i++){
			if (isoDateToTime(this.dayCodes[i].date.getTime()) === isoDateToTime(today.getTime())){
				return this.dayCodes[i].code;
			}
		}
		return null;
	})
    .set(function(value){
		var today = new Date();
        if (!this.dayCode){
            this.dayCodes.push({
                date: today,
                code: value
            });
        }
        this.save();
    });

var SmallGroup = mongoose.model('SmallGroup', SmallGroupSchema);
module.exports = SmallGroup;
