MeteorDBProxy = function(opts) {
	var _self = this;
	if (!(_self instanceof MeteorDBProxy)) 
		return new MeteorDBProxy(opts);

	//collection name
	//[{ db: "dbCollectionName", name: "MeteorCollectionName" }]

	function _init() {
		var _opts = {};
		if (Meteor.isServer) {
			var _args = {};
			if (opts.oplogUrl) {
				_.extend(_args, { oplogUrl: opts.oplogUrl });
			}

			//using RemoteCollectionDriver returns a _driver that can be used to hook
			//into the Meteor.Collection api and then do all the mongo stuff (insert, upsert, etc)
			//as well as leverage allow/deny rules on the collection itself
			_opts = { _driver: new MongoInternals.RemoteCollectionDriver(opts.mongoUrl, _args) }
		}
		
		_.each(opts.collections, function(c) { 
			var _name = c.name || c.db;
			_self[_name] = new Meteor.Collection(c.db, _opts);
		});
	};

	_init();

	return _self;
};
