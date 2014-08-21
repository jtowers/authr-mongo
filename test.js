it('should have the right db config', function (done) {
    adapter.config.db.should.equal(authr_config.db);
    done();
  });

  it('should be able to connect to database', function (done) {
    adapter.connect(function(err){
      should.not.exist(err);
      done();
    });
  });

  it('should have the right database object', function(done){
    adapter.connect(function(err){
      adapter.db.databaseName.should.equal('testdb');
      done();
    });
  });

  it('should be able to disconnect from database', function(done){
    adapter.connect(function(error){
      adapter.disconnect(function(err){
        should.not.exist(err);
        done();
      });
    });
  });