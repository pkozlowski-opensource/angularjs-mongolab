angular.module('test', ['mongolabResourceHttp'])
  .constant('MONGOLAB.API_KEY', 'testkey')
  .constant('MONGOLAB.DB_NAME', 'testdb')
  .factory('Project', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('projects');
  });

describe('mongolabResourceHttp', function () {

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

  describe('class methods', function () {

    it("should issue GET request for a query without parameters", inject(function (Project) {
      $httpBackend.expect('GET', createUrl('')).respond([{'_id':{'$oid':1}, 'key':'value'}]);
      Project.query({}, successCallBack).then(function(queryResult){
        resultPromise = queryResult;
      });
      $httpBackend.flush();
      expect(resultPromise.length).toEqual(1);
      expect(resultCallBack.length).toEqual(1);
    }));
  });

  describe('instance methods', function () {

    it('should return undefined $id for new resources', inject(function (Project) {
      var project = new Project();
      expect(project.$id()).toBeUndefined();
    }));

    it('should return MongoDB $id if defined', inject(function (Project) {
      var project = new Project({_id:{$oid:'testid'}});
      expect(project.$id()).toEqual('testid');
    }));

  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});