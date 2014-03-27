var win = global, d = document;
var reqOpts = ['init', 'burtScript'];

var validateOpts = require('define-options')({
    burtScript       : 'string    - url to the burt script',
    startTracking    : 'function  - init function to pass to burtApi.startTracking'
}, true);

/**
 * @param {{burtScript: string, init: function}} options
 */
function factory (options) {
    validateOpts(options);

    return function (gardr) {
        loadBurt(options, gardr);
    };
}

function loadBurt (options, gardr) {
    win.burtApi = win.burtApi || [];
    win.burtApi.push(function () {
        win.burtApi.startTracking(options.startTracking);

        gardr.events.on('item:render', function (item) {
            window.burtApi.trackByNode(item.iframe.element);
        });
    });

    var s = d.createElement('script');
    s.src = options.burtScript;
    d.getElementsByTagName('script')[0].appendChild(s);
}

module.exports = factory;
