describe("IndexedDB database", function () {

    beforeEach(function () {

        define('config', function () {
            return {
                db: {
                    name: 'testdb',
                    version: 1
                }
            }
        });

        define("Infra/logger", function () {
            return {
                log: function () { },
                error: function () { },
                info: function () { },
                warn: function () { },
                assert: function () { },
            }
        });
    });

    describe("When I open a database", function () {
        describe("without parameters", function(){
            it("the database should be opened", function (done) {
                    expect(function () {
                        require(['SUT/Infra/database.js'], function (db) {
                            db.open();
                            done();
                        });
                    }).to.not.throw();
            });
        });

        describe("with parameters", function () {
            it("the database should be opened", function (done) {
                expect(function () {
                    require(['SUT/Infra/database.js'], function (db) {
                        db.open('name', 1);
                        done();
                    });
                }).to.not.throw();
            });

            it("and I omit the version, the database should be opened", function (done) {
                expect(function () {
                    require(['SUT/Infra/database.js'], function (db) {
                        db.open('name');
                        done();
                    });
                }).to.not.throw();
            });
        });
    });

    describe("When I open a ", function () {
        it("test case", function () {
            expect(1 + 2).to.equal(3);
        });
    });
});