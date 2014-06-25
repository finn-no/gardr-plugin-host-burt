var burtHost = require('./index.js');

function mockBurtScript () {
    var burtApi = global.burtApi;
    burtApi.startTracking = sinon.spy();
    burtApi.trackByNode = sinon.spy();
    burtApi[0]();
}

describe('burt-host', function () {
    var options = {
        burtScript: 'about:blank',
        burtStartTracking: function (gardr) {}
    };
    var pluginApi;

    options.without = function without (removeKey) {
        var obj = {};
        for (var key in this) {
            if (key !== removeKey) { obj[key] = this[key]; }
        }
        return obj;
    };

    beforeEach(function () {
        pluginApi = {
            on: sinon.spy()
        };
    });

    afterEach(function () {
        global.burtApi = undefined;
    });

    it('should throw if no options argument', function () {
        expect(function () {
            burtHost(pluginApi);
        }).to.throw();
    });

    it('should throw if missing burtScript options argument', function () {
        expect(function () {
            burtHost(pluginApi, options.without('burtScript'));
        }).to.throw();
    });

    it('should throw if missing burtStartTracking function in options argument', function () {
        expect(function () {
            burtHost(pluginApi, options.without('burtStartTracking'));
        }).to.throw();
    })

    describe('plugin', function () {
        it('should define window.burtApi and add a function to it', function () {
            burtHost(pluginApi, options);
            expect(global.burtApi).to.be.an('array');
            expect(global.burtApi).not.to.be.empty;
            expect(global.burtApi[0]).to.be.a('function');
        });

        it('should inject a script with burtScript as src', function () {
            var spy = sinon.spy(Node.prototype, 'appendChild');
            burtHost(pluginApi, options);
            expect(spy).to.have.been.calledWithMatch(function (script) {
                return script.src === options.burtScript;
            });
            spy.restore();
        });

        it('should call burtApi.startTracking when the burtScript has loaded', function () {
            burtHost(pluginApi, options);

            mockBurtScript();
            expect(burtApi.startTracking).to.have.been.calledWith(options.burtStartTracking);
        });

        it('should start tracking on node when the burtScript has loaded', function () {
            burtHost(pluginApi, options);

            mockBurtScript();
            var onItemRender;
            expect(pluginApi.on).to.have.been.calledWithMatch('item:beforerender', function (fn) {
                onItemRender = fn;
                return typeof fn == 'function';
            });
            expect(onItemRender).to.exist;
            var item = { options: { container: document.createElement('div') } };
            onItemRender(item);
            expect(global.burtApi.trackByNode).to.have.been.calledWith(item.options.container);
        });

        it('should queue items rendered before the burt script has loaded', function (done) {
            burtHost(pluginApi, options);

            var onItemRender;
            expect(pluginApi.on).to.have.been.calledWithMatch('item:beforerender', function (fn) {
                onItemRender = fn;
                return typeof fn == 'function';
            });

            var item = { id: 'test123', options: { container: document.createElement('div') } };
            onItemRender(item);

            setTimeout(function () {
                mockBurtScript();
                expect(global.burtApi.trackByNode).to.have.been.calledWith(item.options.container, { name: item.id, type: 'xdi', xdiId : item.id });
                done();
            }, 0);
        });
    });
});
