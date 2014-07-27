angular.module('test', ['mongolabResourceHttp'])
    .constant('MONGOLAB_CONFIG', {API_KEY: 'testkey', DB_NAME: 'testdb'})
    .factory('Project', function ($mongolabResourceHttp) {
        return $mongolabResourceHttp('projects');
    });

describe('mongolabResourceHttp', function () {

    var MONGLAB_DB_URL_PREFIX = 'https://api.mongolab.com/api/1/databases/testdb/';

    var testProject = {'_id': {'$oid': 1}, 'key': 'value'};
    var $httpBackend, resultPromise;

    var collectionUrl = function (urlPart, queryPart) {
        return  MONGLAB_DB_URL_PREFIX + 'collections/projects' + (urlPart || '') + '?apiKey=testkey' + (queryPart || '');
    };

    var runCommandUrl = function () {
        return  MONGLAB_DB_URL_PREFIX + 'runCommand?apiKey=testkey';
    };

    beforeEach(module('test'));
    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
    }));
    beforeEach(function () {
        this.addMatchers({
            toHaveSamePropertiesAs: function (expected) {
                return angular.equals(expected, this.actual);
            }
        });
    });

    describe('class methods', function () {
        it("should issue GET request for a query without parameters", inject(function (Project) {
            $httpBackend.expect('GET', collectionUrl()).respond([testProject]);
            Project.query({}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        }));

        it("should issue GET request with sort options", inject(function (Project) {
            $httpBackend.expect('GET', collectionUrl('', '&s=%7B%22priority%22:1%7D')).respond([testProject]);
            Project.query({}, {sort: {priority: 1}}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        }));

        it("should issue GET request with limit options", inject(function (Project) {
            $httpBackend.expect('GET', collectionUrl('', '&l=10')).respond([testProject]);
            Project.query({}, {limit: 10}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        }));

        it("should issue GET request with sort and limit options", inject(function (Project) {
            $httpBackend.expect('GET', collectionUrl('', '&l=10&s=%7B%22priority%22:1%7D')).respond([testProject]);
            Project.query({}, {sort: {priority: 1}, limit: 10}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        }));

        it("should issue GET all with sort options", inject(function (Project) {
            $httpBackend.expect('GET', collectionUrl('', '&s=%7B%22priority%22:1%7D')).respond([testProject]);
            Project.all({sort: {priority: 1}}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        }));

        it("should issue GET all", inject(function (Project) {
            $httpBackend.expect('GET', collectionUrl()).respond([testProject]);
            Project.all().then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise.length).toEqual(1);
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
        }));

        it('should issue GET request for distinct calls', inject(function (Project) {
            $httpBackend.expect('POST', runCommandUrl()).respond({values: ['value']});
            Project.distinct('name', {}).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise).toEqual(['value']);
        }));

        it("should issue GET request and return one element for getById", inject(function (Project) {
            $httpBackend.expect('GET', collectionUrl('/1')).respond(testProject);
            Project.getById('1').then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise).toHaveSamePropertiesAs(testProject);
        }));

        it("should issue GET request and return an array for getByObjectIds", inject(function (Project) {
            $httpBackend.expect('GET', collectionUrl('', '&q=%7B%22_id%22:%7B%22$in%22:%5B%7B%22$oid%22:1%7D%5D%7D%7D')).respond([testProject]);
            Project.getByObjectIds([1]).then(function (queryResult) {
                resultPromise = queryResult;
            });
            $httpBackend.flush();
            expect(resultPromise[0]).toHaveSamePropertiesAs(testProject);
            expect(resultPromise.length).toEqual(1);
        }));

        it('should issue GET request and return a single number for count', inject(function (Project) {
            var countResult, countCBResult;
            $httpBackend.expect('GET', collectionUrl('', '&c=true&q=%7B%22k%22:%22v%22%7D')).respond(200, 5);
            Project.count({k: 'v'}).then(function (result) {
                countResult = result;
            });

            $httpBackend.flush();
            expect(countResult).toEqual(5);
        }));
    });

    describe('instance methods', function () {

        var flushAndVerify = function () {
            $httpBackend.flush();
            expect(resultPromise).toHaveSamePropertiesAs(testProject);
        };

        it('should return undefined $id for new resources', inject(function (Project) {
            var project = new Project();
            expect(project.$id()).toBeUndefined();
        }));

        it('should return MongoDB $id if defined', inject(function (Project) {
            var project = new Project({_id: {$oid: 'testid'}});
            expect(project.$id()).toEqual('testid');
        }));

        it('should return non standard $id if defined', inject(function (Project) {
            var project = new Project({_id: 123456});
            expect(project.$id()).toEqual(123456);
        }));

        it('should support saving objects', inject(function (Project) {
            $httpBackend.expect('POST', collectionUrl()).respond(testProject);
            new Project({key: 'value'}).$save().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        }));

        it('should save a new object when using $saveOrUpdate', inject(function (Project) {
            $httpBackend.expect('POST', collectionUrl()).respond(testProject);
            new Project({key: 'value'}).$saveOrUpdate().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        }));

        it('should update an existing new object when using $saveOrUpdate', inject(function (Project) {
            $httpBackend.expect('PUT', collectionUrl('/1')).respond(testProject);
            new Project(testProject).$saveOrUpdate().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        }));

        it('should support updating objects', inject(function (Project) {
            $httpBackend.expect('PUT', collectionUrl('/1')).respond(testProject);
            new Project(testProject).$update().then(function (data) {
                resultPromise = data;
            });
            flushAndVerify();
        }));

        it('should support removing objects', inject(function (Project) {
            $httpBackend.expect('DELETE', collectionUrl('/1')).respond(testProject);
            new Project(testProject).$remove().then(function (data) {
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
