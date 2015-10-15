	var MatchObjectView_page = Backbone.View.extend({

	template: Handlebars.compile($("#matchTasks").html()),

	events:{
		"click .next":"next",
		"click .back":"back",
	},

	back:function(){
		app.router.navigate("choose_tasks", true);
	},

	next: function(){

		var flag = this.validate();
		if(flag){
			var nav = _.after(app.taskList.length, function(){
				app.router.navigate("set_durations", true);
			});
			app.taskList.each(function(task){
				task.save(task.attributes,{success:nav});
			});			
		}
		else
			alert("יש מסימות שעדיין לא משויכות לאוביקט");
	},

	validate: function(){
		var flag = true;
		var checked = app.taskList.where({checked:true});
		_.chain(checked).each(function(task){
			if(!(task.get("objectId")))
				flag = false
		});
		return flag;

	},

	build: function(){
		_.chain(app.taskList.where({userid:app.user.get("_id")}))
		.each(function(task){
			task.save({objectId:null});

		});
		for (var i = 1 ; i <= 6; i++) {
			var oneView = new MatcheObjectViewV2_single({attributes:{number:i}});
			this.$(".accordion").append(oneView.render().el);
		}	


	},

	initialize: function (){
		var comTitle = Handlebars.compile($("#titleBar").html());
		var title = comTitle({title:"התאם משימות לאובייקטים ?", name: app.user.get( "name" )});
		var comNav = Handlebars.compile($("#bottom-nav").html());
		var nav = comNav();

		this.$el.html(title);
		this.$el.append(this.template);
		this.$el.append(nav);

		app.taskList.fetch({success: this.build});

	}, 


});
