var Equipment = function(type){
    this.type = type;
    this.name = config.equipments_types[type].name;
    this.damage = config.equipments_types[type].damage;
    this.dice = config.equipments_types[type].dice;
    this.min_score = config.equipments_types[type].min_score;
};

Equipment.prototype = {
    
};