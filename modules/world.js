var Cluster = require('./cluster');


function World(args) {
    args = args || { };

    var size = args.clusterSize;
    var clusterWidth = Math.floor(args.width / size);
    var clusterHeight = Math.floor(args.height / size);

    this.width = clusterWidth * size;
    this.height = clusterHeight * size;

    this.clusters = { };
    if (args.indexes) {
        for (var i = 0; i < args.indexes.length; i++) {
            this.clusters[args.indexes[i]] = new Cluster({
                size: size,
                width: clusterWidth,
                height: clusterHeight
            });
        }
    }

    this.length = 0;
}

World.prototype.forEach = function(cluster, fn) {
    this.clusters[cluster].forEach(fn);
};


World.prototype.add = function(cluster, item) {
    this.length++;
    item.world = this;
    this.clusters[cluster].add(item);
};


World.prototype.remove = function(cluster, item) {
    if (this.clusters[cluster].remove(item)) {
        this.length--;
        item.world = null;
    }
};


World.prototype.update = function() {
    for (var key in this.clusters) {
        this.clusters[key].update();
    }
};


World.prototype.forEachAround = function(cluster, point, range, fn) {
    if (typeof(range) == 'function') {
        fn = range;
        range = 1;
    }

    this.clusters[cluster].forEachAround(point, range, fn);
};


module.exports = World;
