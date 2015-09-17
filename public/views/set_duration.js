var SetDuration_page = Backbone.View.extend({

	template: Handlebars.compile($("#setDurations").html()),

	events:{
		"click .next":"next",
		"click .back":"back",
		"click .toggleAll" : "toggleAll",
		"click .homeNav" : "home",
		
	},

	home: function(){
		app.router.navigate("",true);
	},

	toggleAll: function(){
		var flag = false;

		_.chain(this.$(".freeTime")).each(function(single){
			console.log(single);
			if(!($(single).is(":visible")))
				flag = true;
		});

		if(flag){
			this.$(".freeTime").show();
			this.$(".taskBar").removeClass("marged");
		}
		else{
			this.$(".freeTime").hide();
			this.$(".taskBar").addClass("marged");
		}

	},

	next:function(){
		
		var viewList = this.viewList;
		if(!this.model.timeValidate())
			alert("שעת סיום התארגנות מאוחרת משעת היציאה שהגדרת באפשרותך לשנות שעת יציאה שעת התעוררות או את זמני המשימות והמעבר")

		else if(this.validate()){
			console.log(this.$("svg"));
			this.$("svg").show();
			var nav = _.after(this.model.checked().length, function(){
				_.chain(viewList).each(function(view){view.remove()});
				if (app.last == "signIn")
					app.router.navigate("", true);
				else
					app.router.navigate("placeObject", true);
			});
			_.chain(this.model.checked())
			.each(function(task){
				task.set({exDuration:null});
				task.set({overexcep:null});
				task.set({exFreeTime:null});
				task.save(task.attributes,{success:nav});

			});
			
		}
		else
			alert("יש משימות שלא משויכות לאוביקט")

	},

	validate: function(){
		var checked = this.model.checked();
		var flag = true;
		
		_.chain(checked).each(function(task){
			if(task.get("objectId") == null)
				flag = false;
		});

		return flag;

	},

	back: function(){
		_.chain(this.viewList).each(function(view){view.remove()});
		if(app.last === "signIn")
			app.router.navigate("",true);
		else
			app.router.navigate("choose_tasks", true);
	},



	initialize: function(){
		var back = app.last === "signIn" ? "לעמוד הבית" : "לתכנון משימות";
		var comTitle = Handlebars.compile($("#titleBar").html());
		var title = comTitle({title:"הגדר זמנים"});
		var comNav = Handlebars.compile($("#bottom-nav").html());
		var nav = comNav({end:"עדכן משימות"});
		var loader = Handlebars.compile($("#loader").html());
		this.model.updateLeft();

		this.$el.html(title);
		this.$el.append(this.template(this.model.attributes));
		this.$el.append(nav);
		this.$el.append(loader);
		
		this.build = _.bind(this.build, this);
		app.taskList.fetch({success:this.build});
		this.listenTo(this.model, "change", this.updateSpan);
		this.set_wakeUpClock();
		this.set_goOutClock();

		
	},


	set_wakeUpClock: function(){
		var _func = function(valueText, btn, inst){
			if (btn == "set"){
				this.model.set({wakeUp:valueText});
				app.user.updateLeft();
        	}
		};
		_func = _.bind(_func, this);

		this.$(".wakeUp").mobiscroll().time({
			display : "bubble",
       	    hourText : "שעות",
		    minuteText: "דקות",
		    cancelText: "ביטול",
            setText: "הגדר",
		    theme:"ios7",
		    timeWheels:"HHii",
		    timeFormat: "HH:ii",
		    stepMinute:5,
        	onClose: _func,
        });

        var cur = this.model.get("wakeUp");
		var cur = cur != null ? cur : "07:00"
		this.$('.wakeUp').val(cur);
		this.model.set({wakeUp:cur});   
	},

	set_goOutClock: function(){
		var _func = function(valueText, btn, inst){
			if (btn == "set"){
				this.model.set({goOut:valueText});
				app.user.updateLeft();
        	}
		};
		_func = _.bind(_func, this);

		this.$(".goOut").mobiscroll().time({
			display : "bubble",
       	    hourText : "שעות",
		    minuteText: "דקות",
		    cancelText: "ביטול",
            setText: "הגדר",
		    theme:"ios7",
		    timeWheels:"HHii",
		    timeFormat: "HH:ii",
		    stepMinute:5,
        	onClose: _func,
        }); 

        var cur = this.model.get("goOut");
		var cur = cur != null ? cur : "08:00"
		this.$('.goOut').val(cur);
		this.model.set({goOut:cur});  
	},


	updateSpan: function(){
		this.$(".wakeUp").val(this.model.get("wakeUp"));
		this.$(".arangeTime").val(this.model.get("arangeTime"));
		this.$(".endToArange").val(this.model.get("endToArange"));
		this.$(".goOut").val(this.model.get("goOut"));


	},

	build: function(){
		var _iterator = function(task){
			var id = task.get("objectId");
			return id;
		};
		var checked = this.model.checked();
		var numbers = [6,5,4,3,2,1];


		_.chain( checked ).each(function(task){
			if( task.get("lastObjectId") ) {
				numbers = _.reject(numbers,function(num){
					return num == task.get("lastObjectId");
				});
			}
		});

		var viewList = [];
		_.chain( checked ).each(function(task){
			if(task.get("lastObjectId")){
				task.set({objectId:task.get("lastObjectId")});
				var cur = task.get("lastObjectId");
			}
			else{
				var cur = numbers.pop();
				task.set({objectId:cur});
			}
		});

		var sortchecked = _.chain( checked ).sortBy( _iterator );

		sortchecked.each( function ( task ) {
			var cur = task.get("objectId");
			var oneView = new SetDuration_single({model:task, attributes:{objectId:cur}});
			this.$(".setList").append(oneView.render().el);
			viewList.push(oneView);
		})
		
		this.viewList = viewList;
		app.user.updateLeft();
	},

});
