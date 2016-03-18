'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SmallGroupSchema = new Schema({
  classYear: {type : Schema.Types.ObjectId, ref: 'ClassYear'},
  name: String,
  enabled: Boolean,
  students: [{type : Schema.Types.ObjectId, ref: 'User'}],
  dayCodes: [{date:Date, code:String, bonusDay:{type:Boolean, default:false}}]
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

SmallGroupSchema
    .virtual('days')
	.get(function(){
        var total = this.dayCodes.reduce(function(previousValue, currentValue, index, array) {
            return previousValue + (currentValue.bonusDay? 0 : 1);
        }, 0) ;
		return total;
	});
SmallGroupSchema
    .virtual('bonusDays')
	.get(function(){
        var total = this.dayCodes.reduce(function(previousValue, currentValue, index, array) {
            return previousValue + (currentValue.bonusDay? 1 : 0);
        }, 0) ;
		return total;
	});

SmallGroupSchema
    .virtual('dates')
	.get(function(){
        var all = this.dayCodes.filter(function(value) {
            return !value.bonusDay;
        })
        .map(function(value) {
            return value.date;
        });
		return all;
	});

SmallGroupSchema
    .virtual('bonusDates')
	.get(function(){
        var all = this.dayCodes.filter(function(value) {
            return value.bonusDay;
        })
        .map(function(value) {
            return value.date;
        });
		return all;
	});


var SmallGroup = mongoose.model('SmallGroup', SmallGroupSchema);
module.exports = SmallGroup;
