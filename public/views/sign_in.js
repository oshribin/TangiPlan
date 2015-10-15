	var SignIn_page = Backbone.View.extend({
	
	template: Handlebars.compile($("#signIn").html()),

	events:{
		"click .connect": "connect",
		"click .arange" : "arangeNav",
		"click .checkList" : "checkListNav",
		"click .setDuration" : "setDurationNav"
	},

	connect: function () {
		var name = this.$(".username").val();
		var password = this.$(".password").val();
		var user = app.userList.where({name:name});
		var that = this;
		var login = function(data){
			if(data == "Successfully authenticated"){
				app.user = user[0];
				app.taskList.fetch({success:that.btncntrl});

				
			}

			else
				that.$(".message").html("שם משתמש או סיסמה לא נכונים נסה שוב");
		};

		$.post("/login",{username:name,password:password},login);
	},

	setDurationNav: function(){
		app.last = "signIn";
		app.router.navigate("set_durations", true);
	},

	arangeNav: function(){
		app.router.navigate("wake_up", true);
	},

	checkListNav: function(){
		app.router.navigate("checkList", true);
	},

	btncntrl: function(){
		var compiled = Handlebars.compile($("#titleBar").html());
		var title = compiled({title:"TangiPlan", name: app.user ? app.user.get( "name" ) : null });
		this.$(".title-bar").html( title )
		this.$(".login").remove();
		this.$(".message").remove();
		this.$("h1").show();

		if(app.taskList.where({checked:true}).length == 0){
			this.$(".setDuration").prop("disabled",true);
			this.$(".checkList").prop("disabled",true);
		}	
		this.$(".btn").show();
		},

	initialize: function(){
		var compiled = Handlebars.compile($("#titleBar").html());
		var title = compiled({title:"TangiPlan", name: app.user ? app.user.get( "name" ) : null });
		this.$el.html(title);
		this.$el.append(this.template);
		this.$(".btn").hide();
		this.$("h1").hide();
		var that = this;
		if(app.user){
			app.taskList.fetch({success:that.btncntrl});
		}
		else {
			var callback = function(data){
				app.user = app.userList.where({name:data})[0];
				if(app.user)
					app.taskList.fetch({success:that.btncntrl});
			};
			
			$.get("/currentUser", callback);
		}

	},
});
