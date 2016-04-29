var placeObject_page = Backbone.View.extend({
	
	template: Handlebars.compile($("#placeObject").html()),

	events: {
		"click .homeNav" : "home",
		"click .place-button": "home"
	},

	home: function(){
		app.router.navigate("",true);
	},

	initialize: function () {
		var comTitle = Handlebars.compile($("#titleBar").html());
		var title = comTitle({title: "מיקום אובייקטים", name: app.user.get( "name" )});
		this.$el.html(title);
		this.$el.append(this.template);
		this.build = _.bind(this.build,this);
		app.taskList.fetch({success:this.build});
	},

	build: function(){
		var checked = _.chain(app.taskList
		.where({userid:this.model.get("_id"),checked:true}))
		.sortBy( function ( task ) {
			 return task.get( "objectId" );
		});

		checked.each(function(task){
			this.$(".placeList").append("<li><span>" +  task.get("name") + "</span><span style = 'float:right; margin-left:15px;'>"  + task.get("objectId") + "</span></li>");
		});
	},

});
