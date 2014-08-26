authr-mongo
===========

[![Build Status](https://travis-ci.org/jtowers/authr-mongo.svg?branch=master)](https://travis-ci.org/jtowers/authr-mongo)


MongoDB adapter for authr module.

This is used internally by authr to interact with user data saved in MongoDb.

See the [main project](https://github.com/jtowers/authr) for instructions for how to use authr.

## Using the adapter

1. Install authr and the adapter

`npm install authr authr-mongo --save`

2. Specify mongodb as your database type in the authr config:

```
var Authr = require('authr');

var config = {
	db: {
		type: 'mongodb',
		host: 'localhost',
		port: 27017,
		database_name: 'some_db',
		collection: 'some_collection'
	}
}

var authr = new Authr(config);
```
You can also preserve document nesting by specifying the location for essential values in your user config

```
var Authr = require('authr');

var config = {
	user:{
  	username: 'account.username'
  },
	db: {
		type: 'mongodb',
		host: 'localhost',
		port: 27017,
		database_name: 'some_db',
		collection: 'some_collection'
	}
}

```

With the above configuration, your mongo documents can look like this:
```
{
	account: {
		username: 'jtowers'
	}
}
```

And the adapter will save new user information to the appropriate path.

## Features

User signup

## Todo
...?
