var View = function(scene){
    
    this.scene = scene;
    
    return this;
};

View.prototype = {
    
   /*
    Draw the map wrapper
   */
   drawWrapper : function(){
        var $parent = $(this.scene.parent);        
        $parent.css({width: this.scene.map.tiles_layers[0][0].length*this.scene.tile_w, height: this.scene.map.tiles_layers[0].length*this.scene.tile_w});
        
        var wH = $(window).height();
        var pH = $parent.height();
        
        if(pH < wH)
            $parent.css({'margin-top': (wH-pH)/2});
    },
    
    /*
        Redraw the canvas
    */
    draw : function(){
        
        var self = this;
        var $parent = $(this.scene.parent);
        
        $parent.html('')
    
        /* Draw tiles */
        for( var l = 0; l < this.scene.map.tiles_layers.length ; l++ ){
            var layer = this.scene.map.tiles_layers[l];
            for( var y = 0; y < layer.length ; y++ ){
                for( var x = 0; x < layer[0].length ; x++ ){
                    var value = layer[y][x];
                    
                    if( value != '' ){
                        var $tile = $('<div class="tile"></div>').addClass(value)
                                                             .attr('id','tile_'+x+'_'+y)
                                                             .css({'z-index':l});
                        this.drawTile($tile,x,y);
                    }                    
                }
            }
        }
        
        /* Draw evolutives */
        for( var y = 0; y < this.scene.map.evolutive_layer.length ; y++ ){
            for( var x = 0; x < this.scene.map.evolutive_layer[0].length ; x++ ){
                var value = this.scene.map.evolutive_layer[y][x];
                
                if( value !== 0 ){
                    var $tile = $('<div class="tile evolutive"></div>').addClass(value).attr('id','tile_'+x+'_'+y);
                    this.drawTile($tile,x,y);
                }
                
            }
        }
        
        /* Draw players */
        for( var i = 0; i < this.scene.players.length ; i++ ){
            var player = this.scene.players[i];
            var $tile = $('<div class="tile player"></div>').addClass('player_'+player.type).attr('id',player.id);
            this.drawTile($tile,player.x,player.y);
            
            this.addEvent('player',$tile);
        }
        
        /* Draw Monsters */
        for( var i = 0; i < this.scene.monsters.length ; i++ ){
            var monster = this.scene.monsters[i];
            var $tile = $('<div class="tile monster"></div>').addClass('monster_'+monster.type).attr('id',monster.id);
            this.drawTile($tile,monster.x,monster.y);
        }
        
        /* Draw notifications */
        var counts = this.scene.getMonstersCountPerTile();
        for(var i=0;i<counts.length;i++){
            var tile = counts[i];
            if( tile.count >= 2 ){
                var $tile = $('#tile_'+tile.x+'_'+tile.y);
                var $notification = $('<div class="notification"></div>').html(tile.count);
                $tile.append($notification);
            }
        }
        
    },
    
    /*
        Draw a tile on the scene
    */
    drawTile : function($tile,x,y){
        var $parent = $(this.scene.parent);
        $tile.css({left: this.scene.tile_w*x, top: this.scene.tile_w*y });
        $parent.append($tile);
    },
    
    /*
        Activate events 
    */
    addEvent : function(type,$element){
        
        var self = this;
        
        switch(type){
            
            // Player
            
            case 'player':
                $element.click(function(){
                    
                    // Visual select
                    $('.player_selected').removeClass('player_selected');
                    $(this).addClass('player_selected');
                    self.scene.current_player = self.scene.getPlayerObjectFromId($element.attr('id'));
                    
                    // Update panel
                    $('.panel_inner').fadeOut('fast',function(){
                        
                        // Avatar
                        var avatar = $('<img></img>').attr('src','images/avatars/'+self.scene.current_player.type+'.jpg');
                        $('.panel_avatar').html(avatar);
                        $('.panel_name').html(self.scene.current_player.type);
                        
                        // AP
                        $('.panel_actions_points ul').html('');
                        
                        for(var i=0; i< 3; i++){
                            var $li = $('<li></li>');
                            if( i < self.scene.current_player.PA)
                                $li.addClass('active');
                            $('.panel_actions_points ul').append($li);
                        }
                        
                        // inventory
                        $('.slot_1,.slot_2').html('');
                        if( self.scene.current_player.slot_1 !== null ){
                            var $e = $('<img></img>').attr('src','images/equipments/'+self.scene.current_player.slot_1.type+'.jpg');
                            $('.slot_1').html($e);
                        }
                        
                        if( self.scene.current_player.slot_2 !== null ){
                            var $e = $('<img></img>').attr('src','images/equipments/'+self.scene.current_player.slot_2.type+'.jpg');
                            $('.slot_2').html($e);
                        }
                        
                        $(this).fadeIn('fast');
                    });                    
                    
                });
            break;
                
        }
    },
};