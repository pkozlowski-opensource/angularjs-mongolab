[![Build Status](https://secure.travis-ci.org/pkozlowski-opensource/angularjs-mongolab.png)](http://travis-ci.org/pkozlowski-opensource/angularjs-mongolab)
[![devDependency Status](https://david-dm.org/pkozlowski-opensource/angularjs-mongolab/dev-status.png?branch=master)](https://david-dm.org/pkozlowski-opensource/angularjs-mongolab#info=devDependencies)

## Promise-aware [MongoLab](https://mongolab.com/home) $resource-like adapter for [AngularJS](http://angularjs.org/)

### Introduction

This repository hosts a Mongolab [$resource](http://docs.angularjs.org/api/ngResource.$resource)-like adapter for [AngularJS](http://angularjs.org/).
It is based on [$http](http://docs.angularjs.org/api/ng.$http) and is working with [promises](https://docs.angularjs.org/api/ng/service/$q).

This is a small wrapper around the AngularJS $http that makes setting up and working with MongoLab easy. It has an interface very similar to $resource but works with promises.
It significantly reduces the amount of boilerplate code one needs to write when interacting with MongoDB / MongoLab (especially around URLs handling, resource objects creation and identifiers handling).

### Examples
To see it in action check this plunker: (http://plnkr.co/edit/Bb8GSA?p=preview).

### Usage instructions

Firstly you need to include both AngularJS and the `mongolabResourceHttp.js` script from this repository (see examples above for the exact URLs).

Then, you need to configure 2 parameters:
* MongoLab key (`API_KEY`)
* database name (`DB_NAME`)

Configuration parameters needs to be specified in a constant `MONGOLAB_CONFIG` on an application's module:
```JavaScript
var app = angular.module('app', ['mongolabResourceHttp']);

app.constant('MONGOLAB_CONFIG',{API_KEY:'your key goes here', DB_NAME:'angularjs'});
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
  Project.all().then(function(projects){
    $scope.projects = projects;
  });
});
```

### Documentation

Since this $resource-like implementation is based on `$http` and returns a promise.
Each resource created with the `$mongolabResourceHttp` will be equipped with the following methods:
* on the class level:
    * `Resource.all([options])`
    * `Resource.query(criteriaObject,[options])`
    * `Resource.getById(idString)`
    * `Resource.getByIds(idsArray)`
    * `Resource.count(criteriaObject)`
    * `Resource.distinct(fieldName, criteriaObject)`
* on an instance level:
    * `resource.$id()`
    * `resource.$save()`
    * `resource.$update()`
    * `resource.$saveOrUpdate()`
    * `resource.$remove()`

Resource `all` and `query` supported options:
  * `sort`: ex.: `Resource.all({ sort: {priority: 1} });`
  * `limit`: ex.: `Resource.all({ limit: 10 });`
  * `fields`: `1` - includes a field, `0` - excludes a field, ex.: `Resource.all({ fields: {name: 1, notes: 0} });`
  * `skip`: ex.: `Resource.all({ skip: 10 });`

### Contributting

New contributions are always welcomed. Just open a pull request making sure that it contains tests, doc updates.
Checked if the [Travis-CI build](https://travis-ci.org/pkozlowski-opensource/angularjs-mongolab) is alright.

### Contributtors

https://github.com/pkozlowski-opensource/angularjs-mongolab/graphs/contributors
