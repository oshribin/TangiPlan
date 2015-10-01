	var Debug = Backbone.View.extend({

	template: Handlebars.compile($("#debug").html()),

	events: {
		"click .ok":"create",
		"click .status":"status",
		"click .delete":"delete"

	},


	status: function(){
		this.$(".cont").html("");
		app.userList.fetch();
		app.userList.each(function( user ){
			this.$(".cont").append("<li>"+
					"name:"+user.get("name")+"---"+
					"set id:"+user.get("set_id")+"---"+
					"role:"+user.get("role")+"</li>");
		});
	},

	create: function() {
		var name = this.$(".name").val();
		var set_id = this.$(".set").val();
		var pass = this.$(".password").val();

		var isExist = app.userList.findWhere({
			"set_id":set_id
		});

		if ( ! name.length || ! set_id.length || ! pass.length ) {

			alert( "please fill up all the field" )

		} else if ( isExist ) {

			alert( "user with this set id is already exist" )

		} else {

			app.userList.create({
				"name":name,
				"set_id":set_id,
				"pass":pass,
				"role":"user",
			});

			this.$(".name").val("");
			this.$(".set").val("");
			this.$(".password").val("");
			
		}

	},

	delete: function() {
		var name = this.$(".name").val();
		var set_id = this.$(".set").val();
		var pass = this.$(".password").val();

		var user = app.userList.findWhere({
			"name":name,
			"set_id":set_id,
			"pass":pass,
			"role":"user",
		});

		if ( user ) {

			user.destroy();
		} else {
			alert( "this user does not exist" )
		}
	},

	initialize:function(){
		this.$el.append(this.template());

	},
		

});

//new Debug({el:$("body")});
