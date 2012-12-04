angular.module('mongolabResourceHttp', []).factory('$mongolabResourceHttp', ['MONGOLAB_CONFIG', '$http', function (MONGOLAB_CONFIG, $http) {

  function MmongolabResourceFactory(collectionName) {

    var config = angular.extend({
      BASE_URL : 'https://api.mongolab.com/api/1/databases/'
    }, MONGOLAB_CONFIG);

    var url = config.BASE_URL + config.DB_NAME + '/collections/' + collectionName;
    var defaultParams = {apiKey:config.API_KEY};

    var promiseThen = function (httpPromise, successcb, errorcb, isArray) {
      return httpPromise.then(function (response) {
        var result;
        if (isArray) {
          result = [];
          for (var i = 0; i < response.data.length; i++) {
            result.push(new Resource(response.data[i]));
          }
        } else {
          result = new Resource(response.data);
        }
        (successcb || angular.noop)(result, response.status, response.headers, response.config);
        return result;
      }, function (response) {
        (errorcb || angular.noop)(undefined, response.status, response.headers, response.config);
        return undefined;
      });
    };

    var setParams = function(keyname, key, options) {
      var params = {};
      if (options[keyname]) {
        if (angular.isObject(options[keyname])) {
          params[key] = JSON.stringify(options[keyname]);
        } else {
          params[key] = options[keyname];
        }
      }
      return params;
    };

    var Resource = function (data) {
      angular.extend(this, data);
    };

    Resource.all = function (options, cb, errorcb) {
      /* allow sort params */
      if(typeof(options) === 'function') { errorcb = cb; cb = options; options = {}; }
      return Resource.query({}, options, cb, errorcb);
    };

    Resource.query = function (queryJson, options, successcb, errorcb) {
      if(typeof(options) === 'function') { errorcb = successcb; successcb = options; options = {}; }
      var params = angular.isObject(queryJson)&&!angular.equals(queryJson,{}) ? {q:JSON.stringify(queryJson)} : {};
      // set optional params
      if(angular.isObject(options) && !angular.equals(options, {})) {
        angular.extend(params, setParams('sort','s', options));
        angular.extend(params, setParams('limit','l', options));
        angular.extend(params, setParams('fields','f', options));
        angular.extend(params, setParams('skip','sk', options));
      }

      var httpPromise = $http.get(url, {params:angular.extend({}, defaultParams, params)});
      return promiseThen(httpPromise, successcb, errorcb, true);
    };

    Resource.count = function (queryJson, successcb, errorcb) {
      var params = angular.isObject(queryJson)&&!angular.equals(queryJson,{}) ? {q:JSON.stringify(queryJson)} : {};
      var httpPromise = $http.get(url, {
        params: angular.extend({}, defaultParams, params, {c: true})
      });
      return httpPromise.then(function(response) {
        (successcb || angular.noop)(response.data, response.status, response.headers, response.config);
        return response.data;
      }, function(response) {
        (successcb || angular.noop)(undefined, response.status, response.headers, response.config);
        return undefined;
      });
    };

    Resource.getById = function (id, successcb, errorcb) {
      var httpPromise = $http.get(url + '/' + id, {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb);
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
      var httpPromise = $http.post(url, this, {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb);
    };

    Resource.prototype.$update = function (successcb, errorcb) {
      var httpPromise = $http.put(url + "/" + this.$id(), angular.extend({}, this, {_id:undefined}), {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb);
    };

    Resource.prototype.$remove = function (successcb, errorcb) {
      var httpPromise = $http['delete'](url + "/" + this.$id(), {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb);
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
