angular.module('test', ['mongolabResourceHttp'])
  .constant('MONGOLAB_CONFIG',{API_KEY:  'testkey', DB_NAME: 'testdb'})
  .factory('Project', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('projects');
  });

describe('mongolabResourceHttp', function () {

  var testProject = {'_id':{'$oid':1}, 'key':'value'};
  var $httpBackend, resultPromise, resultCallBack;
  var createUrl = function (urlPart, queryPart) {
    return  'https://api.mongolab.com/api/1/databases/testdb/collections/projects' + urlPart + '?apiKey=testkey' + (queryPart||'');
  };

  var successCallBack = function(data) {
    resultCallBack = data;
  };

  beforeEach(module('test'));
  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));
  beforeEach(function () {
    this.addMatchers({
      toHaveSamePropertiesAs:function (expected) {
        return angular.equals(expected, this.actual);
      }
    });
  });

  describe('class methods', function () {

    it("should issue GET request for a query without parameters", inject(function (Project) {
      $httpBackend.expect('GET', createUrl('')).respond([testProject]);
      Project.query({}, successCallBack).then(function(queryResult){
        resultPromise = queryResult;
      });
      $httpBackend.flush();
      expect(resultPromise.length).toEqual(1);
      expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
      expect(resultPromise).toEqual(resultCallBack);
    }));

    it("should issue GET request and return one element for getById", inject(function (Project) {
      $httpBackend.expect('GET', createUrl('/1')).respond(testProject);
      Project.getById('1', successCallBack).then(function(queryResult){
        resultPromise = queryResult;
      });
      $httpBackend.flush();
      expect(resultPromise).toHaveSamePropertiesAs(testProject);
      expect(resultPromise).toEqual(resultCallBack);
    }));

    it("should issue GET request and return an array for getByObjectIds", inject(function (Project) {
      $httpBackend.expect('GET', createUrl('','&q=%7B%22_id%22%3A%7B%22%24in%22%3A%5B%7B%22%24oid%22%3A1%7D%5D%7D%7D')).respond([testProject] );
      Project.getByObjectIds([1], successCallBack).then(function(queryResult){
        resultPromise = queryResult;
      });
      $httpBackend.flush();
      expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
      expect(resultPromise.length).toEqual(1);
    }));
  });

  describe('instance methods', function () {

    var flushAndVerify = function(){
      $httpBackend.flush();
      expect(resultPromise).toHaveSamePropertiesAs(testProject);
      expect(resultPromise).toEqual(resultCallBack);
    };

    it('should return undefined $id for new resources', inject(function (Project) {
      var project = new Project();
      expect(project.$id()).toBeUndefined();
    }));

    it('should return MongoDB $id if defined', inject(function (Project) {
      var project = new Project({_id:{$oid:'testid'}});
      expect(project.$id()).toEqual('testid');
    }));

    it('should return non standard $id if defined', inject(function (Project) {
      var project = new Project({_id:123456});
      expect(project.$id()).toEqual(123456);
    }));

    it('should support saving objects', inject(function (Project) {
      $httpBackend.expect('POST', createUrl('')).respond(testProject);
      new Project({key:'value'}).$save(successCallBack).then(function(data){
        resultPromise = data;
      });
      flushAndVerify();
    }));

    it('should save a new object when using $saveOrUpdate', inject(function (Project) {
      $httpBackend.expect('POST', createUrl('')).respond(testProject);
      new Project({key:'value'}).$saveOrUpdate(successCallBack, angular.noop).then(function(data){
        resultPromise = data;
      });
      flushAndVerify();
    }));

    it('should update an existing new object when using $saveOrUpdate', inject(function (Project) {
      $httpBackend.expect('PUT', createUrl('')).respond(testProject);
      new Project(testProject).$saveOrUpdate(angular.noop, successCallBack).then(function(data){
        resultPromise = data;
      });
      flushAndVerify();
    }));

    it('should support updating objects', inject(function (Project) {
      $httpBackend.expect('PUT', createUrl('/1')).respond(testProject);
      new Project(testProject).$update(successCallBack).then(function(data){
        resultPromise = data;
      });
      flushAndVerify();
    }));

    it('should support removing objects', inject(function (Project) {
      $httpBackend.expect('DELETE', createUrl('/1')).respond(testProject);
      new Project(testProject).$remove(successCallBack).then(function(data){
        resultPromise = data;
      });
      flushAndVerify();
    }));
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});