var win = global, d = document;

function loadBurt (initFn) {
    win.burtApi = win.burtApi || [];
    win.burtApi.push(function () {
        win.burtApi.startTracking(initFn);
    });

    var s = d.createElement('script');
    s.src = '//m.burt.io/f/finn-no.js';
    d.getElementsByTagName('script')[0].appendChild(s);
}

function factory (initFn) {
    return function () {
        loadBurt(initFn);
    };
}
module.exports = factory;
