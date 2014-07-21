MeteorDBProxy = function(_opts) {
	var _self = this;
	if (!(_self instanceof MeteorDBProxy)) 
		return new MeteorDBProxy(opts);

	//collection name
	//[{ db: "dbCollectionName", name: "MeteorCollectionName" }]

	var opts = {
		bindables: ["find", "findOne"]
	};

	_.extend(opts, _opts);

	function _init() {
		if (Meteor.isServer) {

			if (!Meteor.proxiedConnections) {
				Meteor.proxiedConnections = [];
			}

			var _args = {};
			if (opts.oplogUrl) {
				_.extend(_args, { oplogUrl: opts.oplogUrl });
			}

			var _db = _.find(Meteor.proxiedConnections, function(pc) { return pc.mongoUrl === opts.mongoUrl; });
			if (!_db) {
				_db = new MongoInternals.Connection(opts.mongoUrl, _args);
				Meteor.proxiedConnections.push({ mongoUrl: opts.mongoUrl, db: _db });
				console.log("DBPROXY: " + new Date().valueOf() + "  - creating NEW proxied connection for ", opts.mongoUrl, Meteor.proxiedConnections.length);
			} else {
				console.log("DBPROXY: " + new Date().valueOf() +  " - using EXISTING proxied connection for ", opts.mongoUrl, Meteor.proxiedConnections.length);
				_db = _db.db;
			}

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