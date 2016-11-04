'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SmallGroupSchema = new Schema({
  classYear: {
    type : Schema.Types.ObjectId,
    ref: 'ClassYear',
    index: true
  },
  name: String,
  enabled: {
    type: Boolean,
    default: true
  },
  students: [{
    type : Schema.Types.ObjectId, ref: 'User',
    index: true
  }],
  dayCodes: [{
    date:Date,
    code:{
      type: String,
      select: false,
      index: true
    },
    bonusDay:{
      type:Boolean,
      default:false,
    },
  }]
});

/*
	Virtuals
*/

SmallGroupSchema
	.virtual('dayCode')
	.get(function(){
		var today = new Date();
		today.setHours(0,0,0,0);
		for (var i = 0;i < this.dayCodes.length;i++){
			if (this.dayCodes[i].date.getTime() === today.getTime()
      && this.dayCodes[i].bonusDay === false){
				return this.dayCodes[i].code;
			}
		}
		return null;
	});

SmallGroupSchema
	.virtual('bonusDayCode')
	.get(function(){
		var today = new Date();
		today.setHours(0,0,0,0);
		for (var i = 0;i < this.dayCodes.length;i++){
			if (this.dayCodes[i].date.getTime() === today.getTime()
      && this.dayCodes[i].bonusDay === true){
				return this.dayCodes[i].code;
			}
		}
		return null;
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
