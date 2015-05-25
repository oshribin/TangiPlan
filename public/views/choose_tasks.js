
var ChooseTaskView_page = Backbone.View.extend({


	template: Handlebars.compile($("#chooseTasks").html()),

	events:{
		"click .next":"next",
		"click .back":"back",
		"click .add":"create_new_task",
		"click .homeNav":"home",
	},

	home: function(){
		app.router.navigate("",true);
	},

	back: function(){
		app.router.navigate("go_out",true);

	},

	next: function(){

		var flag = this.validate();
		if(flag){
			var nav = _.after(app.taskList.length, function(){
				app.router.navigate("set_durations", true);
				app.last = "chooseTask";
			});
			app.taskList.each(function(task){
				task.save(task.attributes, {success:nav});	
			});
		}

		else
			alert("אתה חייב לבחור לפחות משימה אחת");

	},

	validate: function(){
		var flag = false;
		app.taskList.each(function(task){
			if(task.get("checked")){
				flag = true;
			}
		});
		return flag;
	},


	create_new_task: function(){
		var name = this.$(".newTask").val();
		var userid = app.user.get("_id");
		var set_id = app.user.get("set_id");
		if(this.checked.length == 6){
			task = app.taskList.create({"name":name, "disable":true, "userid":userid, "set_id":set_id});
		}
		else
			task = 	app.taskList.create({"name":name, "userid":userid, "set_id":set_id});
		this.$(".newTask").val("");

			
	},

	add_one: function(task){
		console.log(task);
		var oneView = new ChooseTaskView_single({model:task});
		this.$(".simpleList").append(oneView.render().el);

	},
	
	add_all: function(){
		_.chain(app.taskList.where({userid:app.user.get("_id")})).each(function(task){
			var oneView = new ChooseTaskView_single({model:task});
			this.$(".simpleList").append(oneView.render().el);
		});
	},

	initialize: function(){
		var comTitle = Handlebars.compile($("#titleBar").html());
		var title = comTitle({title:"בנק משימות"});
		var comNav = Handlebars.compile($("#bottom-nav").html());
		var nav = comNav();

		this.$el.html(title);
		this.$el.append(this.template);
		this.$el.append(nav);
		this.$(".bottom-nav").css({"position":"relative"});
		app.taskList.fetch({success:this.add_all, silent:true});
		
		this.listenTo(app.taskList, "add", this.add_one);
		this.listenTo(app.taskList, "change", this.render);
		this.listenTo(app.taskList, "remove", this.render);
		this.render();


	},

	disable_unchecked: function(){
		_.chain(this.unchecked).each(function(model){
			model.set({"disable":true});
		});
	},

	realese: function(){
		app.taskList.each(function(model){
			model.set({"disable":false});
		});
	},


	render: function(){
		this.checked = app.taskList.where({userid:app.user.get("_id"),checked:true});
		this.unchecked = app.taskList.where({userid:app.user.get("_id"),checked:false});
		if (this.checked.length == 6){
			this.disable_unchecked();
			this.$(".message").html("הגעת למקסימום משימות אפשריות")
		}
		else{
			this.realese();
			this.$(".message").html("")
		}
		this.$(".simpleList").html("");
		this.add_all();
	},
});



