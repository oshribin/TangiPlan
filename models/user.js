var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
			name: String,
			wakeUp: String,
			set_id:String,
			goOut: String,
			clUsage: Number,
			timeLeft:String,
			arangeTime:String,
			actGoOut:Date,
			endToArange:String,
			pass:String,

});

module.exports = mongoose.model("user",userSchema);

