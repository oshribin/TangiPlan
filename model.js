var Task = Backbone.Model.extend({
	
	defaults: function() {
		return {
			name: "",
			givDuration: null,
			exDuration:null,
			pobjectId:null,
			latDate:null,
		};
	},

});
