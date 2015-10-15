var GoOut_page = Backbone.View.extend({
	template: Handlebars.compile($("#wakeUp").html()),

  events:{
    "click .next":"next",
    "click .back":"back",
    "click .homeNav":"home",
  },

    home: function(){
    app.router.navigate("",true);
  },

  back: function(){
    app.router.navigate("wake_up",true);
  },


  next: function(){
    
    var curgoOut = this.$("input").val();
    this.model.save({goOut:curgoOut},{success:function(){
       if(app.user.parsMill(app.user.timeLeft()) > 0)
          app.router.navigate("choose_tasks", true);
        else
          alert("הזנת שעת התעוררות ל-"+app.user.get("wakeUp")+" עליך להזין שעת יציאה מאוחרת משעה זו")
    }});


  },


	initialize: function(){
    var comTitle = Handlebars.compile($("#titleBar").html());
    var title = comTitle({title:"שעת יציאה", name: app.user.get( "name" )});
    var comNav = Handlebars.compile($("#bottom-nav").html());
    var nav = comNav();

    this.$el.html(title);
		this.$el.append(this.template);
    this.$el.append(nav);
    this.$("h1").html("? מתי אתם רוצים <span style = 'text-decoration: underline'>לצאת</span> מהבית");

		this.set_clock();
    this.$(".dwwc").css({"border":"5px solid","border-color":"#2980b9"});

	},

	set_clock:function(){
      this.$('input').mobiscroll().time({
        display : "inline",
        hourText : "שעות",
        minuteText: "דקות",
        theme:"ios7",
        height:60,
        fixedWidth: 180,
        layout:"fixed",
        timeWheels:"HHii",
        timeFormat: "HH:ii",
        stepMinute:5,
    });   

	},

});
