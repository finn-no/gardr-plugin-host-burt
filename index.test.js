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
        startTracking: function (gardr) {}
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
            burtHost();
        }).to.throw();
    });

    it('should throw if missing burtScript options argument', function () {
        expect(function () {
            burtHost(options.without('burtScript'));
        }).to.throw();
    });

    it('should throw if missing startTracking function in options argument', function () {
        expect(function () {
            burtHost(options.without('startTracking'));
        }).to.throw();
    })

    it('should take an object litteral an return a function', function () {
        var burtPlugin = burtHost(options);
        expect(burtPlugin).to.be.a('function');
    });

    describe('plugin', function () {
        it('should define window.burtApi and add a function to it', function () {
            var burtPlugin = burtHost(options);
            burtPlugin(pluginApi);
            expect(global.burtApi).to.be.an('array');
            expect(global.burtApi).not.to.be.empty;
            expect(global.burtApi[0]).to.be.a('function');
        });

        it('should inject a script with burtScript as src', function () {
            var burtPlugin = burtHost(options);
            var spy = sinon.spy(Node.prototype, 'appendChild');

            burtPlugin(pluginApi);
            expect(spy).to.have.been.calledWithMatch(function (script) {
                return script.src === options.burtScript;
            });
            spy.restore();
        });

        it('should call burtApi.startTracking when the burtScript has loaded', function () {
            var burtPlugin = burtHost(options);
            burtPlugin(pluginApi);

            mockBurtScript();
            expect(burtApi.startTracking).to.have.been.calledWith(options.startTracking);
        });

        it('should start tracking on node when the burtScript has loaded', function () {
            var burtPlugin = burtHost(options);
            burtPlugin(pluginApi);

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
            var burtPlugin = burtHost(options);
            burtPlugin(pluginApi);

            var onItemRender;
            expect(pluginApi.on).to.have.been.calledWithMatch('item:beforerender', function (fn) {
                onItemRender = fn;
                return typeof fn == 'function';
            });

            var item = { id: 'test123', options: { container: document.createElement('div') } };
            onItemRender(item);

            setTimeout(function () {
                mockBurtScript();
                expect(global.burtApi.trackByNode).to.have.been.calledWith(item.options.container, { name: item.id });
                done();
            }, 0);
        });
    });
});
