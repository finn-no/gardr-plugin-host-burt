var win = global, d = document;
var reqOpts = ['init', 'burtScript'];

var validateOpts = require('define-options')({
    burtScript       : 'string    - url to the burt script',
    startTracking    : 'function  - init function to pass to burtApi.startTracking'
});

function factory (options) {
    validateOpts(options);

    return function (gardr) {
        loadBurt(options, gardr);
    };
}
var itemsToTrack = [];
function trackByNode (item) {
    if ( win.burtApi.trackByNode ) {
        win.burtApi.trackByNode(item.options.container, {name : item.id});
    } else {
        itemsToTrack.push(item);
    }
}

function loadBurt (options, gardr) {
    win.burtApi = win.burtApi || [];

    gardr.on('item:beforerender', trackByNode);

    win.burtApi.push(function () {
        win.burtApi.startTracking(options.startTracking);
        itemsToTrack.forEach(trackByNode);
    });

    var s = d.createElement('script');
    s.src = options.burtScript;
    d.getElementsByTagName('script')[0].appendChild(s);
}

module.exports = factory;
