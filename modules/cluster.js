function Cluster(args) {
    this.size = args.size;
    this.width = args.width;
    this.height = args.height;

    this.nodes = [ ];
    this.length = 0;

    for(var y = 0; y < this.height; y++) {
        for(var x = 0; x < this.width; x++) {
            var node = [ ];
            node.x = x;
            node.y = y;
            node.ind = this.nodes.length;
            node.root = this;
            this.nodes.push(node);
        }
    }
}


Cluster.prototype.add = function(item) {
    var node = this.pick(item.pos);
    node.push(item);
    item.node = node;
    this.length++;
};


Cluster.prototype.remove = function(item) {
    if (! item.node)
        return;

    var ind = item.node.indexOf(item);

    if (ind === -1) {
        item.node = null;
        return;
    }

    item.node.splice(ind, 1);
    item.node = null;
    this.length--;
    return true;
};


Cluster.prototype.update = function() {
    for(var i = 0; i < this.nodes.length; i++) {
        var e = this.nodes[i].length;
        while(e--) {
            this.updateItem(this.nodes[i][e]);
        }
    }
};


Cluster.prototype.updateItem = function(item) {
    var nodeInd = this.ind(item.pos);

    // didn't move
    if (nodeInd === item.node.ind)
        return;

    // moved out
    var ind = item.node.indexOf(item);
    item.node.splice(ind, 1);
    item.node = null;

    // moved in
    item.node = this.nodes[nodeInd];
    item.node.push(item);
};


Cluster.prototype.ind = function(point) {
    return Math.max(0, Math.min(this.width - 1, Math.floor(point[0] / this.size))) % this.width + Math.max(0, Math.min(this.height - 1, Math.floor(point[1] / this.size))) * this.width;
};


Cluster.prototype.pick = function(point) {
    return this.nodes[this.ind(point)];
};


Cluster.prototype.forEach = function(fn) {
    for(var i = 0; i < this.nodes.length; i++) {
        for(var e = 0; e < this.nodes[i].length; e++) {
            fn(this.nodes[i][e]);
        }
    }
};


Cluster.prototype.forEachAround = function(point, range, fn) {
    var node = this.pick(point);

    for(var y = Math.max(0, node.y - range); y <= Math.min(this.height - 1, node.y + range); y++) {
        for(var x = Math.max(0, node.x - range); x <= Math.min(this.width - 1, node.x + range); x++) {
            var around = this.nodes[y * this.width + x];
            for(var e = 0; e < around.length; e++) {
                fn(around[e]);
            }
        }
    }
};


module.exports = Cluster;
