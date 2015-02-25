var internals = {
    node_env: process.env.NODE_ENVIRONMENT || 'development'
};


function logger(level) {
    return function() {
        if (internals.node_env === 'development') {
            return console[level].apply(console, Array.prototype.slice.call(arguments, 0));
        }
    };
}


module.exports = {
    error: logger('error'),
    info: logger('info'),
    log: logger('log'),
    warn: logger('warn')
};
