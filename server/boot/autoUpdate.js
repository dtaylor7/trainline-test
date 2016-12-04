module.exports = function(app) {
  var path = require('path');
  var models = require(path.resolve(__dirname, '../model-config.json'));
  var datasources = require(path.resolve(__dirname, '../datasources.json'));
  var async = require('async');

  function autoUpdateAll(){
    async.eachOfSeries(Object.keys(models), function(key, value, callback) {
      if (typeof models[key].dataSource == 'undefined' || typeof datasources[models[key].dataSource] == 'undefined' || models[key].dataSource != 'postgres') {
        return callback();
      }
      app.models[key].count(function(err, count){
        app.dataSources[models[key].dataSource].automigrate(key, function (err) {
          try{
            var data = require(__dirname + '/seed-data/' + key);
            if(data && app.models[key]){
              app.models[key].create(data, function(err){
                callback();
              });
            }else{
              callback();
            }
          }catch(e){
            callback();
          }
        });
      });
    }, function(){
      console.log('Seed data loaded');
    });
  };
  console.log('Loading seed data');
  autoUpdateAll();
};