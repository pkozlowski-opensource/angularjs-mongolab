angular.module('mongolabResourceHttp', []).factory('$mongolabResourceHttp', ['MONGOLAB_CONFIG', '$http', function (MONGOLAB_CONFIG, $http) {

  function MmongolabResourceFactory(collectionName) {

    var config = angular.extend({
      BASE_URL : 'https://api.mongolab.com/api/1/databases/'
    }, MONGOLAB_CONFIG);

    var dbUrl = config.BASE_URL + config.DB_NAME;
    var collectionUrl = dbUrl + '/collections/' + collectionName;
    var defaultParams = {apiKey:config.API_KEY};

    var resourceRespTransform = function(data) {
       return new Resource(data);
    };

    var resourcesArrayRespTransform = function(data) {
      var result = [];
      for (var i = 0; i < data.length; i++) {
        result.push(new Resource(data[i]));
      }
      return result;
    };

    var promiseThen = function (httpPromise, successcb, errorcb, fransformFn) {
      return httpPromise.then(function (response) {
        var result = fransformFn(response.data);
        (successcb || angular.noop)(result, response.status, response.headers, response.config);
        return result;
      }, function (response) {
        (errorcb || angular.noop)(undefined, response.status, response.headers, response.config);
        return undefined;
      });
    };

    var preparyQueryParam = function(queryJson) {
      return angular.isObject(queryJson)&&!angular.equals(queryJson,{}) ? {q:JSON.stringify(queryJson)} : {};
    };

    var Resource = function (data) {
      angular.extend(this, data);
    };

    Resource.query = function (queryJson, options, successcb, errorcb) {

      var prepareOptions = function(options) {

        var optionsMapping = {sort: 's', limit: 'l', fields: 'f', skip: 'sk'};
        var optionsTranslated = {};

        if (options && !angular.equals(options, {})) {
          angular.forEach(optionsMapping, function (targetOption, sourceOption) {
            if (angular.isDefined(options[sourceOption])) {
              if (angular.isObject(options[sourceOption])) {
                optionsTranslated[targetOption] = JSON.stringify(options[sourceOption]);
              } else {
                optionsTranslated[targetOption] = options[sourceOption];
              }
            }
          });
        }
        return optionsTranslated;
      };

      if(angular.isFunction(options)) { errorcb = successcb; successcb = options; options = {}; }

      var requestParams = angular.extend({}, defaultParams, preparyQueryParam(queryJson), prepareOptions(options));
      var httpPromise = $http.get(collectionUrl, {params:requestParams});
      return promiseThen(httpPromise, successcb, errorcb, resourcesArrayRespTransform);
    };

    Resource.all = function (options, successcb, errorcb) {
      if(angular.isFunction(options)) { errorcb = successcb; successcb = options; options = {}; }
      return Resource.query({}, options, successcb, errorcb);
    };

    Resource.count = function (queryJson, successcb, errorcb) {
      var httpPromise = $http.get(collectionUrl, {
        params: angular.extend({}, defaultParams, preparyQueryParam(queryJson), {c: true})
      });
      return promiseThen(httpPromise, successcb, errorcb, function(data){
        return data;
      });
    };

    Resource.distinct = function (field, queryJson, successcb, errorcb) {
      var httpPromise = $http.post(dbUrl + '/runCommand', angular.extend({}, queryJson || {}, {
        distinct:collectionName,
        key:field}), {
          params:defaultParams
        });
      return promiseThen(httpPromise, successcb, errorcb, function(data){
        return data.values;
      });
    };

    Resource.getById = function (id, successcb, errorcb) {
      var httpPromise = $http.get(collectionUrl + '/' + id, {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
    };

    Resource.getByObjectIds = function (ids, successcb, errorcb) {
      var qin = [];
      angular.forEach(ids, function (id) {
        qin.push({$oid:id});
      });
      return Resource.query({_id:{$in:qin}}, successcb, errorcb);
    };

    //instance methods

    Resource.prototype.$id = function () {
      if (this._id && this._id.$oid) {
        return this._id.$oid;
      } else if (this._id) {
        return this._id;
      }
    };

    Resource.prototype.$save = function (successcb, errorcb) {
      var httpPromise = $http.post(collectionUrl, this, {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
    };

    Resource.prototype.$update = function (successcb, errorcb) {
      var httpPromise = $http.put(collectionUrl + "/" + this.$id(), angular.extend({}, this, {_id:undefined}), {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
    };

    Resource.prototype.$remove = function (successcb, errorcb) {
      var httpPromise = $http['delete'](collectionUrl + "/" + this.$id(), {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
    };

    Resource.prototype.$saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
      if (this.$id()) {
        return this.$update(updatecb, errorUpdatecb);
      } else {
        return this.$save(savecb, errorSavecb);
      }
    };

    return Resource;
  }
  return MmongolabResourceFactory;
}]);
