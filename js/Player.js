var Player = function(type,x,y,id){
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.HP = 2;
    this.PA = 3;
    this.slot_1 = null;
    this.slot_2 = null;
    
    return this;
};

Player.prototype = {
    
    takeDamage : function(){        
        this.HP--;        
        return this.HP;
    },
    
    addEquipment : function(type,slot){
        
        var e = new Equipment(type);
        
        if( slot == 1 ){
            this.slot_1 = e;
        }
        if( slot == 2){
            this.slot_2 = e;
        }
    }
};