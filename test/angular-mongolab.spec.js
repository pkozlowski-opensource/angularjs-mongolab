angular.module('test', ['mongolabResourceHttp'])
    .constant('MONGOLAB_CONFIG', {API_KEY: 'testkey', DB_NAME: 'testdb'})
    .factory('Project', function ($mongolabResourceHttp) {
        return $mongolabResourceHttp('projects');
    });

describe('mongolabResourceHttp', function () {

    var MONGLAB_DB_URL_PREFIX = 'https://api.mongolab.com/api/1/databases/testdb/';

    var Project;
    var testProject = {'_id': {'$oid': 1}, 'key': 'value'};
    var $httpBackend, resultPromise;

    var collectionUrl = function (urlPart, queryPart) {
        return  MONGLAB_DB_URL_PREFIX + 'collections/projects' + (urlPart || '') + '?apiKey=testkey' + (queryPart || '');
    };

    var runCommandUrl = function () {
        return  MONGLAB_DB_URL_PREFIX + 'runCommand?apiKey=testkey';
    };

    beforeEach(module('test'));
    beforeEach(inject(function (_$httpBackend_, _Project_) {
        $httpBackend = _$httpBackend_;
        Project = _Project_;
    }));
    beforeEach(function () {
        this.addMatchers({
            toHaveSamePropertiesAs: function (expected) {
                return angular.equals(expected, this.actual);
            }
        });
    });

    describe('class methods', function () {
        it("should issue GET request for a query without parameters", function() {
            $httpBackend.expect('GET', collectionUrl()).respond([testProject]);
            Project.query({}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        });

        it("should issue GET request with sort options", function() {
            $httpBackend.expect('GET', collectionUrl('', '&s=%7B%22priority%22:1%7D')).respond([testProject]);
            Project.query({}, {sort: {priority: 1}}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        });

        it("should issue GET request with limit options", function() {
            $httpBackend.expect('GET', collectionUrl('', '&l=10')).respond([testProject]);
            Project.query({}, {limit: 10}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        });

        it("should issue GET request with sort and limit options", function() {
            $httpBackend.expect('GET', collectionUrl('', '&l=10&s=%7B%22priority%22:1%7D')).respond([testProject]);
            Project.query({}, {sort: {priority: 1}, limit: 10}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        });

        it("should issue GET all with sort options", function() {
            $httpBackend.expect('GET', collectionUrl('', '&s=%7B%22priority%22:1%7D')).respond([testProject]);
            Project.all({sort: {priority: 1}}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        });

        it("should issue GET all", function() {
            $httpBackend.expect('GET', collectionUrl()).respond([testProject]);
            Project.all().then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        });

        it('should issue GET request for distinct calls', function() {
            $httpBackend.expect('POST', runCommandUrl()).respond({values: ['value']});
            Project.distinct('name', {}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise).toEqual(['value']);
        });

        it("should issue GET request and return one element for getById", function() {
            $httpBackend.expect('GET', collectionUrl('/1')).respond(testProject);
            Project.getById('1').then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise).toHaveSamePropertiesAs(testProject);
        });

        it("should issue GET request and return an array for getByObjectIds", function() {
            $httpBackend.expect('GET', collectionUrl('', '&q=%7B%22_id%22:%7B%22$in%22:%5B%7B%22$oid%22:1%7D%5D%7D%7D')).respond([testProject]);
            Project.getByObjectIds([1]).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
            expect(resultPromise.length).toEqual(1);
        });

        it('should issue GET request and return a single number for count', function() {
            var countResult, countCBResult;
            $httpBackend.expect('GET', collectionUrl('', '&c=true&q=%7B%22k%22:%22v%22%7D')).respond(200, 5);
            Project.count({k: 'v'}).then(function (result) {
                countResult = result;
            });

            $httpBackend.flush();
            expect(countResult).toEqual(5);
        });
    });

    describe('instance methods', function () {

        var flushAndVerify = function () {
            $httpBackend.flush();
            expect(resultPromise).toHaveSamePropertiesAs(testProject);
        };

        it('should return undefined $id for new resources', function() {
            var project = new Project();
            expect(project.$id()).toBeUndefined();
        });

        it('should return MongoDB $id if defined', function() {
            var project = new Project({_id: {$oid: 'testid'}});
            expect(project.$id()).toEqual('testid');
        });

        it('should return non standard $id if defined', function() {
            var project = new Project({_id: 123456});
            expect(project.$id()).toEqual(123456);
        });

        it('should support saving objects', function() {
            $httpBackend.expect('POST', collectionUrl()).respond(testProject);
            new Project({key: 'value'}).$save().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        });

        it('should save a new object when using $saveOrUpdate', function() {
            $httpBackend.expect('POST', collectionUrl()).respond(testProject);
            new Project({key: 'value'}).$saveOrUpdate().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        });

        it('should update an existing new object when using $saveOrUpdate', function() {
            $httpBackend.expect('PUT', collectionUrl('/1')).respond(testProject);
            new Project(testProject).$saveOrUpdate().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        });

        it('should support updating objects', function() {
            $httpBackend.expect('PUT', collectionUrl('/1')).respond(testProject);
            new Project(testProject).$update().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        });

        it('should support removing objects', function() {
            $httpBackend.expect('DELETE', collectionUrl('/1')).respond(testProject);
            new Project(testProject).$remove().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        });
    });

    describe('non-regression suite', function () {

        it('issue 13 - should properly stringify query string with $or', function () {
            $httpBackend.expect('GET', collectionUrl('',
                '&q=%7B%22$or%22:%5B%7B%22attrib1%22:%7B%22$regex%22:%22some%22,%22$options%22:%22i%22%7D%7D,%7B%22attrib2%22:%7B%22$regex%22:%22%22,%22$options%22:%22i%22%7D%7D%5D%7D'))
                .respond([]);
            Project.query({"$or": [
                {"attrib1": {"$regex": "some", "$options": "i"}},
                {"attrib2": {"$regex": "", "$options": "i"}}
            ]
            }).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
        });

    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
