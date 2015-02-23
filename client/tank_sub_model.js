pc.script.create('tank_sub_model', function (context) {
    // Creates a new Tank_sub_model instance
    var Tank_sub_model = function (entity) {
        this.entity = entity;
        this.entity.addLabel('sub-part');
    };

    Tank_sub_model.prototype = {
        initialize: function () { },
        update: function (dt) { }
    };

    return Tank_sub_model;
});