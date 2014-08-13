var Debug = Backbone.View.extend({

	template: Handlebars.compile($("#debug").html()),

	events: {
		"click .ok":"create",
		"click .status":"status",
		"click .clear":"clear"

	},

	clear: function(){
		_.each(_.clone(taskList.models), function(model) {
  			model.destroy()});
	},

	status: function(){
		this.$(".cont").html("");
		taskList.fetch();
		taskList.each(function(task){
			this.$(".cont").append("<li>"+
					"name:"+task.get("name")+"---"+
					"object number:"+task.get("objectId")+"---"+
					"givDuration:"+task.get("givDuration")+"---"+
					"exDuration:"+task.get("exDuration")+"</li>");
		});
	},

	create: function() {
		var name = this.$(".name").val();
		var objectId = this.$(".object").val();
		var givDuration = this.$(".duration").val();
		taskList.create({
			"name":name,
			"objectId":objectId,
			"givDuration":givDuration
		});

		this.$(".name").val("");
		this.$(".object").val("");
		this.$(".duration").val("");

	},

	initialize:function(){
		taskList.fetch();
		this.$el.append(this.template());

	},


});

