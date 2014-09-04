var win = global, d = document;

var validateOpts = require('define-options')({
    burtScript         : 'string    - url to the burt script',
    burtStartTracking  : 'function  - init function to pass to burtApi.startTracking'
});

var itemsToTrack = [];
function trackByNode (item) {
    if ( win.burtApi.trackByNode ) {
        win.burtApi.trackByNode(item.options.container, {name : item.id,  type : 'xdi', xdiId : item.id});
    } else {
        itemsToTrack.push(item);
    }
}

function burtPlugin (gardrPluginApi, options) {
    validateOpts(options);
    win.burtApi = win.burtApi || [];

    gardrPluginApi.on('item:beforerender', trackByNode);

    win.burtApi.push(function () {
        win.burtApi.startTracking(options.burtStartTracking);
        itemsToTrack.forEach(trackByNode);
    });

    var s = d.createElement('script');
    s.src = options.burtScript;
    d.getElementsByTagName('head')[0].appendChild(s);
}

module.exports = burtPlugin;
