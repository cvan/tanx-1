var users = new Events();
users._list = { };

users.add = function(data) {
    this._list[data.id] = data;
};

users.remove = function(id) {
    delete this._list[id];
};

users.get = function(id) {
    return this._list[id] || null;
};

users.bind = function(socket) {
    socket.on('user.add', function(data) {
        users.add(data);
    });
    
    socket.on('user.sync', function(data) {
        for(var i = 0; i < data.length; i++)
            users.add(data[i]);
    });
    
    socket.on('user.remove', function(data) {
        users.remove(data.id);
    });
    
    socket.on('user.name', function(data) {
        var user = users.get(data.id);
        if (! user)
            return;
            
        user.name = data.name;
        users.emit(user.id + ':name', data.name);
    });
};