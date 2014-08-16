var should = require('chai').should();
var Adapter = require('../index.js');

describe('signup', function () {
  var adapter;
  var signup_config;
  var authr_config;
  beforeEach(function (done) {
    authr_config = {
      user: {
        username: 'account.username',
        password: 'account.password',
        account_locked: 'account.locked.account_locked',
        account_locked_until: 'account.locked.account_locked_until',
        account_failed_attempts: 'account.locked.account_failed_attempts',
        account_last_failed_attempt: 'account.locked.account_last_failed_attempt',
        email_address: 'account_username',
        email_verified: 'email.email_verified',
        email_verification_hash: 'email.email_verification_hash',
        email_verification_hash_expires: 'email.email_verification_expires'
      },
      db: {
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        database_name: 'testdb',
        collection: 'users'
      },
      security: {
        hash_password: true,
        hash_salt_factor: 10,
        max_failed_login_attempts: 10,
        reset_attempts_after_minutes: 5,
        lock_account_for_minutes: 30,
        email_verification: true,
        email_verification_expiration_hours: 12
      }

    };

    signup_config = {
      account: {
        username: 'test@test.com',
        password: 'test'
      }
    };
    adapter = new Adapter(authr_config);
    adapter.signupConfig(signup_config);
    done();

  });

  describe('config', function () {
    it('should have the right signup config', function (done) {
      adapter.signup.should.equal(signup_config);
      done();
    });

  });

  describe('utilities', function () {
    it('should be able to get the value of an object using a string indicating its path', function (done) {
      var username = adapter.getVal(signup_config, 'account.username');
      username.should.equal(signup_config.account.username);
      done();
    });

    it('should be able to dynamically build mongodb objects for queries using the user key in the authr config', function (done) {
      test_query = {};
      test_query = adapter.buildQuery(test_query, 'account.username', 'test');
      test_query = adapter.buildQuery(test_query, 'account.password', 'test');
      test_query = adapter.buildQuery(test_query, 'email.email_verified', true);
      test_query.account.username.should.equal('test');
      test_query.account.password.should.equal('test');
      test_query.email.email_verified.should.equal(true);
      done();
    });
    it('should be able to hash a password', function (done) {
      adapter.hash_password(function (err, hash) {
        should.not.exist(err);
        hash.should.equal(adapter.signup.account.password);
        done();
      });
    });

    it('should be able to generate a verification hash', function (done) {
      adapter.doEmailVerification(function (err) {
        should.not.exist(err);
        done();
      });
    });
    
    it('should be able to save users', function(done){
      adapter.connect(function(err){
        if(err){
          throw err;
        }
        adapter.saveUser(function(err, user){
          if(err){
            throw err;
          }
          should.exist(user);
          adapter.disconnect(function(){
            done();
          });
        });
      });
    });
  });
  describe('db operations', function () {
    beforeEach(function (done) {
      adapter.connect(function(err){
        if(err){
          throw err;
        } else {
          adapter.saveUser(function(err, user){
            if(err){
              throw err;
            }
            done();
          });
        }
      });
    });

    afterEach(function (done) {
      adapter.resetCollection(function (err) {
        adapter.disconnect(function () {
          done();
        });
      });
    });

    it('should be able to find duplicate users', function (done) {
      adapter.isUsernameTaken(function(err, isTaken){
        if(err){
          throw err;
        }
        isTaken.should.equal(true);
        done();
      });
    });


  });
});