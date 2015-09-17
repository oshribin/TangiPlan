var CheckList_page = Backbone.View.extend({
	template: Handlebars.compile($("#checkList").html()),

	events:{
		"click .render" : "render",
		"click .home" : "home",
		"click .end" : "end",
		"click .homeNav":"home",
	},

	home: function(){
		app.router.navigate("",true);
	},

	end: function(){
		var now = new Date(Date.now());
		this.model.save({actGoOut:now}, {success:this.home});

	},

	render: function(){
		this.model.clUsageInc();
		app.taskList.fetch({success:this.build});
		this.$("svg").show();
	},

	initialize: function(){
		var compiled = Handlebars.compile($("#titleBar").html());
		var title = compiled({title:"מעקב בוקר"});
		this.$el.html(title);
		this.$el.append(this.template);
		var loader = Handlebars.compile($("#loader").html());
		this.$el.append(loader);
		this.build = _.bind(this.build,this);
		app.taskList.fetch({success:this.build});
	},

	build: function(){
		this.$(".checkList").html("");
		this.checked = _.chain(app.taskList
			.where({userid:this.model.get("_id"),checked:true}));


		var _iterator = function(task){
			var x = task.get("lastDate") != null ? Date.parse(task.get("lastDate")) : task.get( "objectId" );
			if(!task.get("exDuration"))
				x = task.get( "objectId" );
			return x;
		};


		var sortChecked = _.chain(this.checked).sortBy(_iterator);


		sortChecked.each(function(task){
			console.log(sortChecked);
			var oneView = new checkTask({model:task});
			this.$(".checkList").append(oneView.render().el);
			var exFreeTime = task.get("exFreeTime");
			if(exFreeTime)
				this.$(".checkList").append("<li class='row'><span class='label label-default col-xs-12'>זמן בין המשימות - "+ exFreeTime + "</spanv></li>");
		});
		setTimeout(function(){
			this.$("svg").hide();
		}, 3000);
		
	}
			



});
