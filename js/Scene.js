var Scene = function(map_name){
    
    this.parent = ".wrapper";
    this.tile_w = 50;
    this.view = new View(this);
    this.map_name = map_name;
    this.map = null;  
    this.monsters = [];
    this.players = [];
    this.current_player = null;
    
    
    this.init();
};

Scene.prototype = {
    
    init: function(){
        
        var self = this;
        // Get map infos
        
        $.getJSON('maps/'+this.map_name+'.json', function(data){
            self.map = data;
            self.insertCharacters();
            self.view.drawWrapper();
            self.view.draw();
        }); 
        
    },
    
    /*
        Insert players and monsters on the scene
    */
    insertCharacters : function(){
        for(var i = 0; i< this.map.monsters.length; i++){
            var c = this.map.monsters[i];
            this.monsters.push( new Monster(c.type,c.x,c.y,'monster_'+i) );
        }
        
        for(var i = 0; i< this.map.players.length; i++){
            var c = this.map.players[i];
            var player = new Player(c.type,c.x,c.y,'player_'+i);
            
            if( typeof(c.slot_1) != 'undefined' ){
                player.addEquipment(c.slot_1,1);
            }
            if( typeof(c.slot_2) != 'undefined' ){
                player.addEquipment(c.slot_2,2);
            }
            
            this.players.push( player );
        }
    },
    
    /*
        Move monsters
    */
    moveMonsters : function(){
        
        // The zone where zombies are looking at
        var noiseLocation = this.getMaxNoiseZone();
        
        for( var i = 0; i < this.monsters.length ; i++ ){
            
            // Get monster 
            var monster = this.monsters[i];
            
            // Get path to go where the noise is
            var path = this.getPath( monster.x,monster.y,noiseLocation.x,noiseLocation.y );
            
            // Check is there is a direct path to player
            var resPlayerCheck = this.checkPlayerInView(monster);
            
            if( resPlayerCheck !== false){
                
                // If a player is returned, attack and stop moves for the monster
                if( resPlayerCheck.player ){                    
                    path = [];
                    this.handleAttack(resPlayerCheck.player);                 
                }                    
                //else go to player
                else{
                    path = resPlayerCheck;
                }
            }
                 
            //Loop on path. If max movement is passed, stop. Don t move if no path
            for( var j = 0; j < path.length ; j++ ){

                var coordinates = path[j];
                
                // Stop move if player or door in the way or max move reached
                if( this.checkPlayerPresenceOnTile(coordinates) || this.checkDoorPresenceOnTile(coordinates) || j >= monster.move_speed)
                    break;

                this.moveOneMonster(monster,coordinates,i,j);                  
            } 
        }
        
        return;
    },
    
    /*
        Move a monster at 1 tile and check if player is not already on it
    */
    moveOneMonster : function(monster,coordinates,i,j){
        var self = this;
        
        window.setTimeout(function(){            
            monster.moveTo(coordinates.x,coordinates.y);            
            self.view.draw();            
        },(i+j)*50);   
        
        return true;
    },
    
    /*
        Verify if player is on the destination tile
    */
    checkPlayerPresenceOnTile : function(coordinates){
        
        for( var i = 0; i < this.players.length ; i++ ){
            var player = this.players[i];
            if( coordinates.x == player.x && coordinates.y == player.y )
                return true;
        }
        
        return false;
    },
    
    /*
        Verify if monster is on the tile
    */
    checkMonsterPresenceOnTile : function(coordinates){
        
        for( var i = 0; i < this.monsters.length ; i++ ){
            var monster = this.monsters[i];
            if( coordinates.x == monster.x && coordinates.y == monster.y )
                return true;
        }
        
        return false;
    },
    
    /*
        Verify is player is in view from monster
    */
    checkPlayerInView : function(monster){
        
        for(var p = 0; p < this.players.length; p++){
            
            var player = this.players[p];
            var path = this.getPath( monster.x,monster.y,player.x,player.y );

            // If length = 1, in view 
            if( path.length == 1 ){
                return { 'player' : player };
            }else{
                
                //Add current position of monster to avoid bugs
                path.push({x:monster.x,y:monster.y});
                
                // check X direction
                var visibleInX = true;
                var referenceX = path[0].x;
                for( var i = 1; i < path.length ; i++ ){
                    var current = path[i];
                    if( referenceX != current.x )
                        visibleInX = false;
                }

                // check Y direction
                var visibleInY = true;
                var referenceY = path[0].y;
                for( var i = 1; i < path.length ; i++ ){
                    var current = path[i];
                    if( referenceY != current.y )
                        visibleInY = false;
                }

                if( !visibleInX && !visibleInY ){
                    return false;
                }else{
                    return path;
                }
            } 
        }        
    },
    
    /*
        Check if there is a door on the tile
    */
    checkDoorPresenceOnTile : function(coordinates){
        return this.map.evolutive_layer[coordinates.x][coordinates.y] != 0;
    },
    
    /*
        Return an array of coordinates with the count of monster
    */
    getMonstersCountPerTile : function(){
        var notifications_count = [];
        for( var i = 0; i < this.monsters.length ; i++ ){
            var monster = this.monsters[i];
            var res = null;
            for(var j=0;j<notifications_count.length;j++){
                if( notifications_count[j].x == monster.x && notifications_count[j].y == monster.y ){
                    res = j;
                    break;
                }
            }
            if( res === null ){
                notifications_count.push({x:monster.x,y:monster.y,count:1});
            }else{
                notifications_count[res].count = notifications_count[res].count+1;
            }
        }
        
        return notifications_count;
    },
    
    /*
        return the zone where the noise is louder
    */
    getMaxNoiseZone: function(){
        var player = this.players[0];
        return {x:player.x,y:player.y};
    },
    
    /*
        Retrieve a path from A to B
    */
    getPath : function(xStart,yStart,xEnd,yEnd){
        
        var graph = new Graph(this.map.collision_layer);
        var start = graph.grid[xStart][yStart];
        
        var end = graph.grid[xEnd][yEnd];
        var result = astar.search(graph, start, end);
        
        return result;
    },
    
    /*
        Reduce player's hp from 1
    */
    handleAttack: function(player){        
        if( player.takeDamage() <= 0 )
            //alert('game over');
        
        this.view.draw();
    },
    
    /*
        return the player object from id
    */
    getPlayerObjectFromId : function(id){
        for( var i = 0; i < this.players.length ; i++ ){
            var player = this.players[i];
            if( id == player.id )
                return player;
        }
        return false;
    }
};