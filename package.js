Package.describe({
	summary: "Meteor DB proxy"
});

Package.on_use(function (api) {    
	api.add_files("proxy.js", ["server", "client"]);
	api.export("MeteorDBProxy");
});