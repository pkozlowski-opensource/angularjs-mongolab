angular.module('test', ['mongolabResourceHttp'])
  .constant('MONGOLAB.API_KEY', 'testkey')
  .constant('MONGOLAB.DB_NAME', 'testdb')
  .factory('Project', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('projects');
  });

describe('mongolabResourceHttp', function () {

  var testProject = {'_id':{'$oid':1}, 'key':'value'};
  var $httpBackend, resultPromise, resultCallBack;
  var createUrl = function (testPart) {
    return  'https://api.mongolab.com/api/1/databases/testdb/collections/projects' + testPart + '?apiKey=testkey';
  };

  var successCallBack = function(data) {
    resultCallBack = data;
  };

  beforeEach(module('test'));
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend');
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

    it('should support saving objects', inject(function (Project) {
      $httpBackend.expect('POST', createUrl('')).respond(testProject);
      new Project({key:'value'}).$save(successCallBack).then(function(data){
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