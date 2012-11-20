[![Build Status](https://secure.travis-ci.org/angularjs-mongolab/resource-http.png)](http://travis-ci.org/angularjs-mongolab/resource-http)

# Promise-aware [MongoLab](https://mongolab.com/home) $resource for [AngularJS](http://angularjs.org/)
***

##Introduction

This repository hosts a Mongolab [$resource](http://docs.angularjs.org/api/ngResource.$resource)-like adapter for [AngularJS](http://angularjs.org/).
It is based on [$http](http://docs.angularjs.org/api/ng.$http) and is working with [promises]().

This is a small wrapper around the AngularJS $http that makes setting up and working with MongoLab easy. It has an interface very similar to $resource but works with promises.
It significient reduces the amount of boilerplate code one needs to write when interacting with MongoDB / MongoLab (especially around URLs handling, resource objects creation and identifiers handling).

## Examples
To see it in action check this plunker: (http://embed.plnkr.co/Y8sg4V).

## Usage instructions

Firstly you need to include both AngularJS and the `mongolabResourceHttp.js` script from this repository (see examples above for the exact URLs).

Then, you need to configure 2 parameters:
* MongoLab key (`API_KEY`)
* database name (`DB_NAME`)

Configuration parameters needs to be specified in a constant `MONGOLAB_CONFIG` on an application's module:
```JavaScript
var app = angular.module('app', ['mongolabResourceHttp']);

app.constant('MONGOLAB_CONFIG',{API_KEY:'[your key goes here]', DB_NAME:'angularjs'});
```
Then, creating new resources is very, very easy and boils down to calling `$mongolabResource` with a MongoDB collection name:
```JavaScript
app.factory('Project', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('projects');
});
```
As soon as the above is done you are ready to inject and use a freshly created resource in your services and controllers:
```JavaScript
app.controller('AppController', function ($scope, Project) {
  Project.query(function(projects){
     $scope.projects = projects;
  });
});
```

## Documentation

Since this $resource-like implementation is based on `$http` it accepts callbacks in its methods calls and returns a promise.
Each resource created with the `$mongolabResourceHttp` will be equipped with the following methods:
* on the class level:
    * `Resource.all([options], successcb, errorcb)`
    * `Resource.query(criteriaObject,[options], successcb, errorcb)`
    * `Resource.getById(idString, successcb, errorcb)`
    * `Resource.getByIds(idsArray, successcb, errorcb)`
* on an instance level:
    * `resource.$id()`
    * `resource.$save(successcb, errorcb)`
    * `resource.$update(successcb, errorcb)`
    * `resource.$saveOrUpdate(successcb, updateSuccesscb, errorcb, updateErrorcb)`
    * `resource.$remove(successcb, errorcb)`

Resource `all` and `query` supported options:
  * `sort`: ex `Resource.all({ sort: {priority: 1} }, cb);`
  * `limit`: ex `Resource.all({ limit: 10 }, cb);`
  * `fields`: 
    { 1 - Includes field, 0 - excludes field }
    ex `Resource.all({ fields: {name: 1, notes: 0} }, cb);`
  * `skip`: ex `Resource.all({ skip: 10 }, cb);`

## Contributting

New contributions are always welcomed. Just open a pull request making sure that it contains tests, doc updates.
Checked if the Travis-CI build is alright.

## Contributtors

* Hannes Finck (https://github.com/bluenavajo)
* Tom Wilson (https://github.com/twilson63)