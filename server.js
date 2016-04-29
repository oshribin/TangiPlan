var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session")	;
var app = express();
var mongoose = require("mongoose");
var Task = require("./models/task"); 
var Log = require("./models/log");
var User = require("./models/user");
var UserLog = require("./models/userlog");
var _ = require("underscore");
var extend = require( "extend" );
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var csv = require("fast-csv");
var fs = require("fs");
var timeOffset = 10800000;
var restartTime = 8;
var date = new Date(Date.now());
var hour = date.getHours();
var minutes = date.getMinutes();
var hoursOffset = (24 + (restartTime - hour)) % 24;
var interval = hoursOffset*3600000 - minutes*60000;

setTimeout(function(){
	setInterval(taskReset,24*3600000);
	}, interval);



mongoose.connect("mongodb://localhost:27017/test");

app.use(bodyParser());
app.use(session({secret: "keyboard cat",  cookie:{maxAge:10*24*60*60*1000}}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());


var router = express.Router();

router.get("/object_filter/:action/:object_id/:from/:untill", function(req, res){
	Log.find({name:req.params.object_id, action:req.params.action,
			 date:{$gte:req.params.from,
			 	   $lte:req.params.untill}}, function(err, tasks){
			 	if(err){
			 		res.send(err);
			 	}
			 	else if(tasks){
			 			res.send(tasks);
			 	}
			 	else
			 		res.send("no match");
			 });
});




router.route("/getDuration/:set_id/:object_id")
	.all( function( req, res, next ) {
		User.findOne( { set_id: req.params.set_id } )
			.sort("dateJoined")
			.find( function( err, users) {
				req.user = users[ 0 ];
				next();
			})
	})

	.get( function(req, res ){
		var row = ({
			entity:"object spark",
			object_id:req.params.object_id,
			date: Date.now() + timeOffset,
			request: "/getDuration/" + req.params.set_id + "/" + req.params.object_id,
			action: "getDuration",
			set_id: req.params.set_id,
			user_id: req.user.name
		})
		req.session = null;
		Task.findOne({objectId:req.params.object_id, set_id:req.params.set_id}, function(err, task){
			if(err){
				//eror while looking for task
				row.result = "error[ task didnt found for this request ]";
				row.taskName = task.name;
				logger( row );
				res.send(err);
			}

			else if(task && task.givDuration){
				res.send(task.objectId+":"+parsMill(task.givDuration));
				row.result = task.objectId+":"+parsMill(task.givDuration);
				row.taskName = task.name;
				logger( row );
			}
			else{
				res.send(req.params.object_id +":"+ -1);
				//there is no task
				row.result = req.params.object_id +":"+ -1;
				logger( row );
			}
		});
	});




router.get("/objectslogfile", function(req, res){
	res.sendfile("objectlog.log");
});




router.get("/download/:action/:set_id", function(req,res){
	Log.find({action:req.params.action, set_id: req.params.set_id}, function(err, logs){
		if(err)
			res.send(err);
		else if(logs){
			var csvStream = csv.format({headers: true, objectMode: true, quoteColumns:true });
			var fileName = req.params.action + ".txt";
   			var writableStream = fs.createWriteStream( fileName );
   				writableStream.on("finish", function(){
  					res.download( fileName );
				});
			csvStream.pipe(writableStream);
			logs.forEach(function(log){
				log["date"] = new Date(parseInt(log.date));
				csvStream.write(log.toObject());
			});	
			csvStream.end();
		}
	});
});

router.get("/print/:action/:set_id", function(req,res){
	Log.find({action:req.params.action, set_id: req.params.set_id}, function(err, logs){
		if(err)
			res.send(err);
		else if(logs){	
			var csvStream = csv.format({headers: true, objectMode: true});
   			var writableStream = fs.createWriteStream("log.log");
   				writableStream.on("finish", function(){
  					res.sendfile("log.log");
				});
			csvStream.pipe(writableStream);
			logs.forEach(function(log){
				log["date"] =  new Date(parseInt(log.date));
				csvStream.write(log.toObject());
			});	
			csvStream.end();
		}
	});
});

router.get("/", function(req, res) {
	res.sendfile("index.html");
});

app.get("/currentUser", function(req,res){
	if(req.session.passport.user){
		res.send(req.session.passport.user.name);
	}
});

app.get( "/logOut", function ( req, res ){
	req.logout()
	res.send( "logOut" );
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFailure'
  })
);
 
app.get('/loginFailure', function(req, res, next) {
  res.send('Failed to authenticate');
});
 
app.get('/loginSuccess', function(req, res, next) {
  res.send('Successfully authenticated');
  				logger({entity:"User",
						user_id: req.session.passport.user.name,
						date: Date.now() + timeOffset,
						request: "/login",
						action: "login",
						result:"connected",
						set_id:req.session.passport.user.set_id,
						});
});

passport.serializeUser(function(user, done) {
  done(null, user);
});
 
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password,done){
	process.nextTick(function(){

		User.findOne({'name':username}, function(err,user){
			if(err){
				return done(err);
			}

			if(!user){
				return done(null,false);
			}
			if(user.pass != password){
				return done(null, false);
			}
			return done(null,user);
		});
	});
}));	




router.use("/public", express.static("public"));

router.route("/objectOn/:set_id/:objectId/:timeStamp")
	.all( function( req, res, next ) {
		User.findOne( { set_id: req.params.set_id } )
		.sort("dateJoined")
		.find( function( err, users) {
		req.user = users[ 0 ];
				next();
			})
	})
	.get( function(req, res){
		req.session = null;
		res.send("o");
		logger({entity:"object spark",
				date: Date.now() + timeOffset,
				request: "/objectOn/" + req.params.objectId + "/" + req.params.set_id + "/" + req.params.timeStamp,
				action: "objectOn",
				result: "object on",
				object_id: req.params.objectId,
				set_id: req.params.set_id,
				user_id: req.user.name
		});
	});

router.route("/users")

	.post(function(req,res){
		var user = new User({
			name: req.body.name,
			pass: req.body.pass,
			set_id: req.body.set_id,
			role: req.body.role,
		});

		user.save(function(err){
			if(err)
				res.send(err);
			res.json(user);
		});
	})


		.get(function(req, res){
			User.find(function(err, users){
				if(err)
					res.send(err);
				res.json(users);
			});
		});



router.route("/users/:user_id")

	.get(function(req, res){
		User.findById(req.params.user_id, function(err, user){
			if(err)
				res.send(err);
			res.json(user);

		});
	})

	.put(function(req, res){
		User.findById(req.params.user_id, function(err, user){
			if(err)
				res.send(err);
			if(user){
				var lastGoOut = user.actGoOut;
				var lastwakeUp = user.wakeUp; 
				var lastSetGoOut = user.goOut;
				user.set_id = req.body.set_id;
				user.wakeUp = req.body.wakeUp;
				user.goOut = req.body.goOut;
				user.clUsage = req.body.clUsage;
				user.timeLeft = req.body.timeLeft;
				user.arangeTime = req.body.arangeTime;
				user.actGoOut = req.body.actGoOut;
				user.endToArange = req.body.endToArange;
				user.role = req.body.role;

				user.save(function(err,user){
					if(err)
						res.send(err)
					else if(user){
						if(new Date(lastGoOut).getTime() != new Date(user.actGoOut).getTime()){
							var date = Date.now() + timeOffset;

							logger({entity:"User",
								user_id:user.name,
								date: date,
								time: new Date( date ).toISOString().split( "T" )[ 1 ],
								request: "/User/" + req.params.user_id,
								action: "goOut",
								result: "go Out",
								set_id: user.set_id,
								});
							}
						if(lastwakeUp != user.wakeUp){
								logger({entity:"User",
								user_id:user.name,
								date: Date.now() + timeOffset,
								request: "/User/" + req.params.user_id,
								action: "setWakeUp",
								result: "set wake up",
								wakeUp: user.wakeUp,
								set_id: user.set_id,
								});
							}
						if(lastSetGoOut != user.goOut){
								logger({entity:"User",
								user_id:user.name,
								date: Date.now() + timeOffset,
								request: "/User/" + req.params.user_id,
								action: "setGoOut",
								result: "set go out",
								goOut:user.goOut,
								set_id: user.set_id,
								});

						}		

						res.json(user);
					}
				});
			}
		});
	})

	.delete(function(req, res){
		User.remove({
			_id: req.params.user_id
		}, function(err, user){
			if(err)
				res.send(err)
			res.json({message:user+"removed successfully"});
		});
		
	});


router.route("/tasks")

	.post(function(req,res){
		var task = new Task({
			name:req.body.name,
			givDuration:req.body.givDuration,
			objectId:req.body.objectId,
			userid:req.body.userid,
			set_id:req.body.set_id,
		});

		task.save(function(err){
			if(err)
				res.send(err);
			 res.json(task);
		});	 
	})

	.get(function(req, res){
		var id = req.session.passport.user ? req.session.passport.user._id : req.query.userid;
		Task.find({userid:id},function(err, tasks){
			if(err)
				res.send(err);
			res.json(tasks);
		});
	});	



router.route("/setDuration/:set_id/:object_id/:ex_duration/:flag")

	.all( function( req, res, next ) {
		User.findOne( { set_id: req.params.set_id } )
			.sort("dateJoined")
			.find( function( err, users) {
				req.user = users[ 0 ];
				next();
			})
	})
	.get(function(req, res){
		req.session = null;
		var row = {
			entity:"object spark",
			object_id: req.params.object_id,
			date: Date.now()  + timeOffset,
			request: "/setDuration/" + req.params.object_id + "/" + req.params.ex_duration + "/" + req.params.flag,
			action: "setDuration",
			user_id: req.user.name,
			set_id: req.params.set_id,
		}
		console.log( row )
		Task.findOne({objectId:req.params.object_id, set_id:req.params.set_id}, function(err, task){
			if(err){
				row.result = "error[ task didnt found for this object ]",
				res.send(err)
			}
			if(task){
				var _parsDuration = parsMill(task.givDuration);
				var _millexception = req.params.ex_duration - _parsDuration;
				var objectId = task.objectId;
				var lastDate = Date.now() + timeOffset;

				task.exDuration = parseVal(req.params.ex_duration);
				task.exception = parseVal(_millexception);
				task.overexcep = _millexception > (0.2*_parsDuration);
				task.lastDate = lastDate;
				task.lastObjectId = objectId;
				task.objectId = null;
				task.save(function(err, task){
					if(err){
						row.result = "error[ failed to save the task ]"
						res.send(err)
					}
					else if(task && ( req.user != null ) ){
						res.send("task end");
						extend(row, {
							date: (lastDate-(lastDate%1000)),
							result: "task end [ task is complete successfully ]",
							taskName: task.name,
							givDuration: Math.round( parsMill( task.givDuration )/1000 ),
							exDuration: Math.round( parsMill( task.exDuration )/1000 ),
							exception: Math.round( _millexception / 1000 ),
							endedByUser: req.params.flag,
							overexcep: task.overexcep,
							user_id: req.user.name,
							set_id: req.params.set_id,
							givFreeTime: Math.round( task.givFreeTime ),
							endTime: getHMS(task.lastDate),
							startTime: calcTime(task.lastDate, task.exDuration),		
							wakeUp: req.user.wakeUp, 
							goOut: req.user.goOut,
							taskDate: getYMD(task.lastDate),
						})
						logger( row, true, task );
					}
				});
			}
		});
	});


	

router.route("/tasks/:task_id")

	.get(function(req, res){
		Task.findById(req.params.task_id, function(err, task){
			if(err)
				res.send(err);
			res.json(task);
		});

	})
	
	.put(function(req, res){
		Task.findById(req.params.task_id, function(err, task){
			if(err)
				res.send(err)
			else if(task){
				
				task.name = req.body.name;
				task.givDuration = req.body.givDuration;
				task.exDuration = req.body.exDuration;
				task.objectId = req.body.objectId;
				task.lastObjectId = req.body.lastObjectId;
				task.lastDate = req.body.lastDate;
				task.checked = req.body.checked;
				task.disable = req.body.disable;
				task.exception = req.body.exception;
				task.endedByUser = req.body.endedByUser;
				task.overexcep = req.body.overexcep;
				task.userid = req.body.userid;
				task.exFreeTime = req.body.exFreeTime;
				task.givFreeTime = req.body.givFreeTime;
				task.set_id = req.body.set_id;

				var updated = req.body.updated;
				var operation;
				if ( updated ) {
					operation = "updated";
				} else if ( task.checked ) {
					operation = "checked";
				} else {
					operation = "un-checked";
				}
				
				task.save(function(err,task){
					if(err)
						res.send(err);
					else{
		 				res.json(task);
		 				logger({entity:"user",
								user_id: req.session.passport.user.name,
								date: Date.now() + timeOffset,
								request:"/tasks/" + req.params.task_id,
								action: "updateTask",
								operation: operation,
								taskName: task.name,
								object_id: task.objectId,
								set_id: task.set_id,
								givDuration: task.givDuration,
								givFreeTime: task.givFreeTime,
							});
		 			}
				});
		    }
		});
	})

	.delete(function(req, res){
		Task.remove({
			_id: req.params.task_id
		}, function(err, task){
			if(err)
				res.send(err)
			res.json({message:task+"removed successfully"});
		});
		
	});

	parsMill = function(duration){
		var m = /*duration.charAt(1)==":" ? 0 :*/ parseInt(duration.substring(0,2));
		var s = /*m==0 ? parseInt(duration.substring(2,4)) :*/ parseInt(duration.substring(3,5));
		return((m*60000)+(s*1000));
	}

	parseVal = function(duration){
		var absDuration = Math.abs(duration);
		var m = Math.floor(absDuration/60000);
		var s = Math.floor((absDuration%60000)/1000);
		if(s<10)
			s="0"+s;
		if (m<10)
			m="0"+m;
		var str = duration < 0 ?  "-"+m+":"+s : m+":"+s;		
			return str;	
	}

	getYMD = function(dt){
		return dt.getDate() + "/" + (dt.getMonth()+1) + "/" + (dt.getFullYear()); 
	}

	getHMS = function(dt){
		return dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
	}

	calcTime = function(dt, ex){
		var sturtDate = new Date(dt.getTime()-parsMill(ex));
		return(getHMS(sturtDate));
	}

	freeTime = function(task){
		Task.find({checked:true, userid:task.userid},function(err,tasks){
			if(err)
				console.log(err);
			else if (tasks){
			
			var _iterator = function(task){
				//add '-' to convert the order
				return -(Date.parse(task.lastDate));
			};



			var sortChecked = _.chain(tasks).sortBy(_iterator);

			var _predicate = function(otherTask){
				otp = Date.parse(otherTask.lastDate);
				tp = Date.parse(task.lastDate);
				otx = otherTask.exDuration;
				tx = task.exDuration; 	
				return ((otp < tp) && (otx != null) && (tx != null));
			};
				var prev = sortChecked.find(_predicate);
				var prev = prev._wrapped;

				if(prev){
					otp = Date.parse(prev.lastDate);
					tp = Date.parse(task.lastDate);
                    var _millFreeTime = tp - otp - parsMill( task.exDuration );
					var freeTime = parseVal(_millFreeTime);
					prev.exFreeTime = freeTime;
					prev.save(function(err,prev){
						if (err)
							console.log(err);
						else if(prev){
							Log.findOne({date:Date.parse(prev.lastDate)}, function(err, log){
								if(err)
									console.log(err);
								else if(log){
									log.exFreeTime = Math.round( _millFreeTime / 1000 );
									log.save(function(err, log){
										if(err)
											console.log(err);
									});	
								}
							});
						}
					});
				}	
			}
		});
	}

	logger = function(prop, flag, task){
		var log = new Log(prop);
		log.save(function(err, log){
			if(err){
				console.log(err);
			}
			else if (log&&flag){
				freeTime(task);
			}

		});
		fs.appendFile('objectlog.log', + " " + prop.entity +" " + prop.name + " " + prop.date + " " + prop.action + " " + prop.result + "\n" , function(err){
			if(err)
				console.log(err);
		});


	}


	taskReset = function(){
		Task.find(function(err,tasks){
			if(err)
				console.log(err);
			else if(tasks){
				tasks.forEach(function(task){
					task.lastObjectId = task.objectId;
					task.objectId=null;
					task.save(function(err,task){
						if(err){
							console.log(err);
						}
					});
				})
			}
		});
	}


app.use("/TangiPlan", router);
app.listen("80");
console.log("walla");
