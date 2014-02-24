meteor-dbproxy
==============

Simple wrapper for adding multiple MONGO_URLs to your meteor app.

###How to install?

1. Install [meteorite](https://github.com/oortcloud/meteorite)
2. `mrt add dbproxy`

###How to use?

Meteor DBProxy using `MongoInternals` to proxy collections from other databases into your app and surface all the reactive functionality of the collection as if it were local (via `MONGO_URL`). This package works on the client AND server.

Put this in your `/lib` folder (e.g., `/lib/proxyDb.js`).

	var proxyDB;
	Meteor.startup(function() {

		var _opts = {
			collections: [
				{ db: "collectionNameInMongo", name: "CollectionNameInMeteor" }
			]
		};

		//when this runs on the server, you must provide the MONGO_URL to the proxy database
		//as well as an (optional) oplog mongo url
		if (Meteor.isServer) {
			_.extend(_opts, { 
				mongoUrl: process.env.OTHER_MONGO_URL
				, oplogUrl: process.env.OTHER_MONGO_OPLOG_URL 
			});
		}

		proxyDB = new MeteorDBProxy(_opts);
	});

Now, you should be able to do this on either the client or the server:

    proxyDB.CollectionNameInMeteor.find({...});

    proxyDB.CollectionNameInMeteor.find({...}).observe({...});


Remember, however, that the client collections may be empty if you do not publish first, so ensure you have pub/sub wired up:

	//on the server
    Meteor.publish("publicationName", function() {
    	return proxyDB.CollectionNameInMeteor.find();
	});

	//on the client
	Meteor.subscribe("publicationName");

	//once this sub is `ready` you ought to be able to do this on the client:
	proxyDB.CollectionNameInMeteor.find({..});


###A couple notes: 

- The `name` is an optional param when passing in the collections. If this is omitted, the db will be used instead.
- The `oplogUrl` is optional
- The `bindables` lets you specify what operations you want to run against the proxy; for a complete list, check out [the source here](https://github.com/meteor/meteor/blob/ff7c35c5a3781bce67c4c0a6c2f69b1cf717ad82/packages/mongo-livedata/remote_collection_driver.js#L11)

Thanks to [Matt Debergalis](https://github.com/debergalis) for filling me in on this pattern.