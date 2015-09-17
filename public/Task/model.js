var Task = Backbone.Model.extend({

	urlRoot:"/TangiPlan/tasks",

	defaults: function() {
		return {
			name: "",
			givDuration: null,
			exDuration:null,
			objectId:null,
			lastObjectId:null,
			lastDate:null,
			checked:true,
			disable:false,
			exception:null,
			endedByUser:null,
			overexcep:null,
			userid:null,
			exFreeTime:null,
			givFreeTime:null,

		};	
	},

	idAttribute:"_id",	

	toggle: function() {
		this.set({checked:!this.get("checked")});
	},

	erase: function(){
		this.destroy();
	}

});

var User = Backbone.Model.extend({

	urlRoot: "/TangiPlan/users",

	defaults: function(){
		return{
			name:"",
			pass:"",
			wakeUp:"07:00",
			goOut:"08:00",
			timeLeft:"",
			arangeTime:"",
			endToArange:"",
			clUsage:0,
			taskList:null,
			actGoOut:null
		};
	},

	idAttribute:"_id",

	setTaskList:function(){
		var userid = this.get("_id");
		var _func = function(){
			this.set({taskList:app.taskList.where({userid:userid})});
		};
		_func = _.bind(_func,this);

		app.taskList.fetch({success:_func});


	},

	checked: function(){
		var userid = this.get("_id");
		return app.taskList.where({userid:userid, checked:true});
	},

	clUsageInc: function(){
		var inc = this.get("clUsage") + 1;
		this.set({clUsage:inc});
	},

	timeLeft: function(){
		var start = this.get("wakeUp");
		var end = this.get("goOut");
		var milstart = this.parsMill(start);
		var milend = this.parsMill(end);
		return (this.parseVal(milend*60-milstart*60));

	},

	sumDurations: function(){
		var taskTosum = app.taskList.where({userid:this.get("_id"),checked:true});
		var iterator = function(memo, task){
			return memo + this.parsMill(task.get("givDuration")) + this.parsMill(task.get("givFreeTime"));
		};
		var iterator = _.bind(iterator, this);
		var sum = _.chain(taskTosum).reduce(function(memo, task){
			return iterator(memo, task);}, 0);
		return (sum._wrapped);
	},

	updateLeft: function(){
		var current = this.parsMill(this.timeLeft());
		var sumDurations = this.sumDurations();
		var timeLeft = this.parseVal(current - sumDurations);
		var arangeTime = this.msToTime(sumDurations);
		var endToArange = this.msToTime(this.parsMill(this.get("wakeUp"))*60 + sumDurations);

		this.set({timeLeft:timeLeft});
		this.set({arangeTime:arangeTime});
		this.set({endToArange:endToArange});
		this.save({success:console.log("saved")});
	},

	timeValidate :function(){
		var sumDurations = this.sumDurations();
		var endTime = this.parsMill(this.get("wakeUp"))*60 + sumDurations;
		var goOut = this.parsMill(this.get("goOut"))*60;
		
		return goOut > endTime;


	},

	msToTime: function(duration) {
	    var  seconds = parseInt((duration/1000)%60)
	        , minutes = parseInt((duration/(1000*60))%60)
	        , hours = parseInt((duration/(1000*60*60))%24);

	    hours = (hours < 10) ? "0" + hours : hours;
	    minutes = (minutes < 10) ? "0" + minutes : minutes;
	    seconds = (seconds < 10) ? "0" + seconds : seconds;

	    return hours + ":" + minutes;
	},	

	decreasLeft: function(){
		var current = this.parsMill(this.get("timeLeft"));
		var update = this.parseVal(current - 10000);
		this.set({timeLeft:update});
	},

	increasLeft: function(){
		var current = this.parsMill(this.get("timeLeft"));
		var update = this.parseVal(current + 10000);
		this.set({timeLeft:update});

	},

	parsMill: function(duration){
		if (duration == null)
			duration = "02:00";
		var sep = duration.indexOf(":")
		var m = parseInt(duration.substring(0,sep));
		var s = parseInt(duration.substring(sep+1,5));
		return((m*60000)+(s*1000));
	},

	parseVal: function(duration){
		var absDuration = Math.abs(duration);
		var m = Math.floor(absDuration/60000);
		var s = Math.floor((absDuration%60000)/1000);
		if(s<10)
			s="0"+s;
		if (m<10)
			m="0"+m;
		var str = duration < 0 ?  "-"+m+":"+s : m+":"+s;		
			return str;	
	},



});



