var Monster = function(type,x,y,id){
    this.id = id;
    this.type = type;
    this.name = config.monsters_types[type].name;
    this.HP = config.monsters_types[type].HP;
    this.move_speed = config.monsters_types[type].move_speed;
    this.resistance = config.monsters_types[type].resistance;
    
    this.x = x;
    this.y = y;
};

Monster.prototype = {
    
    moveTo : function(x,y){
        this.x = x;
        this.y = y;
    }
};