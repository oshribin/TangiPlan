var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var taskSchema = new Schema({
			name: String,
			givDuration: String,
			exDuration:String,
			objectId:Number,
			set_id:String, 
			lastObjectId:Number,
			lastDate:Date,
			checked:Boolean,
			disable:Boolean,
			exception:String,
			endedByUser:Boolean,
			overexcep: Boolean,
			userid:String,
			exFreeTime:String,
			givFreeTime:String,
});

module.exports = mongoose.model("task",taskSchema);

