/** @module authr-mongo */

var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var moment = require('moment');

/**
 * Represents a new Adapter instance for mongodb.
 * @constructor
 * @param {object} config - Authr config object
 */
function Adapter(config){
  console.log('creating adapter');
  this.config = config;
}

/**
 * Connect to database
 * @function
 * @name connect
 * @param {Function} callback - execute callback when finished
 */
Adapter.prototype.connect = function(callback){
  console.log('connecting to database');
  var self = this;
  var url = 'mongodb://' + this.config.db.host + ':' + this.config.db.port + '/' + this.config.db.database_name;
  console.log('connecting to ' + url);
  
  MongoClient.connect(url, function(err, db){
    console.log('mongoconn');
    if(!err){
      db.createCollection(self.config.db.collection, function(err, collection) {});
      self.db = db;
      console.log('database: '+ db);
    } else {
      console.log(err);
    }
    callback(err);
  });
};


/**
 * Disconnect from database
 * @function
 * @name disconnect
 */
Adapter.prototype.disconnect = function(){
  this.db.close();
};


/**
 * Initialize signup config
 * @function
 * @name signupConfig
 * @param {Object} - User object to be persisted to the database
 */
Adapter.prototype.signupConfig = function(signup){
  this.signup = signup;
};


/**
 * Check to see if the username is taken
 * @function
 * @name isUsernameTaken
 * @param {Function} cb - Run callback when finished connecting
 */
Adapter.prototype.isUsernameTaken = function(cb){
  var taken;
  var username = this.getVal(this.signup, this.config.user.username);
  console.log('username: ' + this.signup.account.username);
  console.log('username: ' + this.config.user.username);
  console.log('username: ' + username);
  var queryObject = this.buildQuery({},this.config.user.username, username);
  var self = this;
  this.db.collection(this.config.db.collection).findOne(queryObject, function(err, doc){
    if(err){
      return cb(err, null);
    } else {
      if(doc){
        return cb(null, true);
      } else {
        return cb(null, false);
      }
    }
  });

};


/**
 * Look up a key's value when given the path as a string mimicing dot-notation.
 * Used recreate the user object with the correct keys and proper nesting before inserting the document
 * This allows for customizing the user document structure
 * @function
 * @name getVal
 * @param {Object} obj - Object to query. Almost always the signup object
 * @param {String} str - String representation of path. E.g., 'some.nested.path' or 'top_level_path'
 */
Adapter.prototype.getVal = function(obj, str){
    return str.split(".").reduce(function(o, x) { return o[x]; }, obj);
};

Adapter.prototype.buildQuery = function(query, path, value){
  var obj = query;
    var schema = obj;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {};
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;
return obj;
};


Adapter.prototype.hash_password = function(callback){
  var password = this.getVal(this.signup, this.config.user.password);
  var self = this;
  bcrypt.genSalt(this.config.security.hash_salt_factor, function(err, salt){
    if(err){
      callback(err);
    } else {
      console.log(salt);
      console.log(password);
      bcrypt.hash(password, salt, function(err, hash){
        if(err){
          throw err;
          //callback(err);
        } else {
          self.signup = self.buildQuery(self.signup, self.config.user.password, hash);
          callback(err, hash);
        }
      });
    }
  });
};

Adapter.prototype.doEmailVerification = function(callback){
  var username = this.getVal(this.signup, this.config.user.username);
  var hash = crypto.createHash('md5').update(username).digest('hex');
  this.signup = this.buildQuery(this.signup, this.config.user.email_verification_hash, hash);
  this.signup = this.buildQuery(this.signup, this.config.user.email_verification_hash_expires, moment().toDate());
  this.signup = this.buildQuery(this.signup, this.config.user.email_verified, false);
  callback();
};

Adapter.prototype.saveUser = function(callback){
  this.db.collection(this.config.db.collection).insert(this.signup, function(err, doc){
    return callback(err, doc);
  });
};

module.exports = Adapter;