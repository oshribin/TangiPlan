var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var logSchema = new Schema({
			entity: String,
			name: String,
			date:String,
			request:Object,
			action:String,
			result:String,
			taskName: String,
			givDuration: String,
			exDuration:String,
			exception:String,
			endedByUser:Boolean,
			overexcep: Boolean,
			userid:String,
			exFreeTime:String,
			givFreeTime:String,
			endTime:String,
			startTime:String,
			wakeUp:String,
			goOut:String,
			taskDate:String,
			set_id:String,
			time: String,	
});

module.exports = mongoose.model("log",logSchema);
