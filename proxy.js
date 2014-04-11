MeteorDBProxy = function(opts) {
	var _self = this;
	if (!(_self instanceof MeteorDBProxy)) 
		return new MeteorDBProxy(opts);

	//collection name
	//[{ db: "dbCollectionName", name: "MeteorCollectionName" }]

	var _opts = {
		bindables: ["find", "findOne"]
	};

	_.extend(opts, _opts);

	function _init() {
		if (Meteor.isServer) {
			var _args = {};
			if (opts.oplogUrl) {
				_.extend(_args, { oplogUrl: opts.oplogUrl });
			}
			var _db = new MongoInternals.Connection(opts.mongoUrl, _args);
			_.each(opts.collections, function(c) {

				_self[c.name] = {};
				var _ret = {};
				_.each(opts.bindables, function(m) {
					_ret[m] = _.bind(_db[m], _db, c.db);
				});

				//use name if passed in, otherwise default to the db collection name
				var _name = c.name || c.db;

				_.extend(_self[_name], _ret);
			});
		}

		if (Meteor.isClient) {
			_.each(opts.collections, function(c) { 
				var _name = c.name || c.db;
				_self[_name] = new Meteor.Collection(c.db);
			});
		}
	};

	_init();

	return _self;
};
