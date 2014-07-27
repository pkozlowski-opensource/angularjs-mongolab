angular.module('mongolabResourceHttp', [])
    .factory('$mongolabResourceHttp', ['MONGOLAB_CONFIG', '$http', '$q', function (MONGOLAB_CONFIG, $http, $q) {

    function MmongolabResourceFactory(collectionName) {

        var config = angular.extend({
            BASE_URL: 'https://api.mongolab.com/api/1/databases/'
        }, MONGOLAB_CONFIG);

        var dbUrl = config.BASE_URL + config.DB_NAME;
        var collectionUrl = dbUrl + '/collections/' + collectionName;
        var defaultParams = {apiKey: config.API_KEY};

        var resourceRespTransform = function (response) {
            return new Resource(response.data);
        };

        var resourcesArrayRespTransform = function (response) {
            return response.data.map(function(item){
                return new Resource(item);
            });
        };

        var preparyQueryParam = function (queryJson) {
            return angular.isObject(queryJson) && Object.keys(queryJson).length ? {q: JSON.stringify(queryJson)} : {};
        };

        var Resource = function (data) {
            angular.extend(this, data);
        };

        Resource.query = function (queryJson, options) {

            var prepareOptions = function (options) {

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

            var requestParams = angular.extend({}, defaultParams, preparyQueryParam(queryJson), prepareOptions(options));

            return $http.get(collectionUrl, {params: requestParams}).then(resourcesArrayRespTransform);
        };

        Resource.all = function (options, successcb, errorcb) {
            return Resource.query({}, options || {});
        };

        Resource.count = function (queryJson) {
            return $http.get(collectionUrl, {
                params: angular.extend({}, defaultParams, preparyQueryParam(queryJson), {c: true})
            }).then(function(response){
                return response.data;
            });
        };

        Resource.distinct = function (field, queryJson) {
            return $http.post(dbUrl + '/runCommand', angular.extend({}, queryJson || {}, {
                distinct: collectionName,
                key: field}), {
                params: defaultParams
            }).then(function (response) {
                return response.data.values;
            });
        };

        Resource.getById = function (id) {
            return $http.get(collectionUrl + '/' + id, {params: defaultParams}).then(resourceRespTransform);
        };

        Resource.getByObjectIds = function (ids) {
            var qin = [];
            angular.forEach(ids, function (id) {
                qin.push({$oid: id});
            });
            return Resource.query({_id: {$in: qin}});
        };

        //instance methods

        Resource.prototype.$id = function () {
            if (this._id && this._id.$oid) {
                return this._id.$oid;
            } else if (this._id) {
                return this._id;
            }
        };

        Resource.prototype.$save = function () {
            return $http.post(collectionUrl, this, {params: defaultParams}).then(resourceRespTransform);
        };

        Resource.prototype.$update = function () {
            return  $http.put(collectionUrl + "/" + this.$id(), angular.extend({}, this, {_id: undefined}), {params: defaultParams})
                .then(resourceRespTransform);
        };

        Resource.prototype.$saveOrUpdate = function () {
            return this.$id() ? this.$update() : this.$save();
        };

        Resource.prototype.$remove = function () {
            return $http['delete'](collectionUrl + "/" + this.$id(), {params: defaultParams}).then(resourceRespTransform);
        };


        return Resource;
    }

    return MmongolabResourceFactory;
}]);
