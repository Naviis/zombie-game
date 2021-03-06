var Editor = function(){
    this.width = 10;
    this.height = 10;
    this.current_tile = $('.selected');
    this.current_layer = 0;
    this.grid_hidden = false;
    this.map = {
        map_name: '',
        tiles_layers : [[]],
        collision_layer : [],
        evolutive_layer : [],
        monsters : [],
        players : []
    }
    
    this.changeMapSize();
    this.draw();
    this.addEvents();
}

Editor.prototype = {
    
    addEvents : function(){
        
        var self = this;
        
        //Name
        $('input[name=name]').change(function(){
            self.map.map_name = $(this).val();
        });
        
        //Width
        $('input[name=width]').change(function(){
            self.width = $(this).val();
            self.changeMapSize();
            self.draw();
        });
        
        //Height
        $('input[name=height]').change(function(){
            self.height = $(this).val();
            self.changeMapSize();
            self.draw();
        });
        
        // Show grid
        $('input[name=show_grid]').click(function(){
            self.grid_hidden = !$(this).prop('checked');
            self.draw();
        });
        
        //Add layer
        $('.panel_addLayer').click(function(){
            var $select = $(".panel_layers");
            var layers_nb = $select.find('option').length-1;
            var new_nb = layers_nb+1;
            $(".panel_layers").append('<option value="'+new_nb+'">Calque '+new_nb+'</option>').val(new_nb);
            self.current_layer = new_nb;
            self.map.tiles_layers.push([]);
            self.changeMapSize();
        });
        
        //Change layer
        $(".panel_layers").change(function(){
           self.current_layer = $(this).val(); 
        });
        
        // Select texture
        $('body').on('click','.panel_tiles .tile',function(){
            self.current_tile = $(this);
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
        });
        
        //Paint
        $('body').on('click','.tile_interactive',function(){
            
            var type = typeof($(self.current_tile).attr('data-type')) == 'undefined' ? 'none' : $(self.current_tile).attr('data-type');
            var x = $(this).attr('data-x');
            var y = $(this).attr('data-y');
            
            switch(type){
                    
                case 'none':
                    self.map.tiles_layers[self.current_layer][x][y] = self.current_tile.attr('data-class');
                    self.draw();
                break;
                
                case 'collision':
                    self.map.collision_layer[x][y] = 0;
                    self.draw();
                break;
                
                case 'evolutive':
                    self.map.evolutive_layer[x][y] = self.current_tile.attr('data-class');
                    //Reset tile layers
                    for( var l = 0; l < self.map.tiles_layers.length; l++ ){
                        var layer = self.map.tiles_layers[l];
                        if( l == 0 ){
                            layer[x][y] = 'tile_base_1';
                        }else{
                            layer[x][y] = '';
                        }
                    }
                    self.draw();
                break;
                
                case 'erase_tile':
                    var content = self.current_layer == 0 ? 'tile_base_1' : '';
                    self.map.tiles_layers[self.current_layer][x][y] = content;
                    self.draw();
                break;
                    
                case 'erase_collision':
                    self.map.collision_layer[x][y] = 1;
                    self.draw();
                break;
                
                case 'erase_evolutive':
                    self.map.evolutive_layer[x][y] = 0;
                    self.draw();
                break;
                
                case 'erase_monster':
                    for(var m = 0; m < self.map.monsters.length; m++){
                        var monster = self.map.monsters[m];
                        if(x == monster.x && y == monster.y){
                            self.map.monsters.splice(m,1);
                        }
                    }
                    self.draw();
                break;
                
                case 'erase_player':
                    for(var p = 0; p < self.map.players.length; p++){
                        var player = self.map.players[p];
                        if(x == player.x && y == player.y){
                            self.map.players.splice(p,1);
                        }
                    }
                    self.draw();
                break;
                
                case 'monster':
                    var monster_type = self.current_tile.attr('data-monster-type');
                    self.map.monsters.push({"type": monster_type,"x":x,"y":y});
                    self.draw();
                break;
                    
                case 'player':
                    var player_type = self.current_tile.attr('data-player-type');
                    self.map.players.push({"type":player_type,"x":x,"y":y,"slot_1":"pistol"});
                    self.draw();
                break;
            }       
            
        });
        
        // export
        $('.export').click(function(){
            var content = JSON.stringify(self.map);
            $('.export_result span').html(content).parent().fadeIn();
        });
        
        // close export
        $('.close').click(function(){
            $('.export_result').fadeOut();
        });
        
    },
    
    changeMapSize : function(){
        
        // Change tiles arrays
        for( var l = 0; l < this.map.tiles_layers.length; l++ ){
            
            var layer = this.map.tiles_layers[l];
            
            for( var x = 0; x < this.height; x++ ){
                
                if( typeof(layer[x]) == 'undefined' ){
                    layer[x] = [];
                }
                
                for( var y = 0; y < this.width; y++ ){
                    if( typeof(layer[x][y]) == 'undefined' ){
                        layer[x][y] = l == 0 ? 'tile_base_1' : '';
                    }
                }
            }
        }
        
        // Change collision array
        var collision = this.map.collision_layer;
        for( var x = 0; x < this.height; x++ ){

            if( typeof(collision[x]) == 'undefined' ){
                collision[x] = [];
            }

            for( var y = 0; y < this.width; y++ ){
                if( typeof(collision[x][y]) == 'undefined' ){
                    collision[x][y] = 1;
                }
            }
        }
        
        // Change evolutive array
        var evolutive = this.map.evolutive_layer;
        for( var x = 0; x < this.width; x++ ){

            if( typeof(evolutive[x]) == 'undefined' ){
                evolutive[x] = [];
            }

            for( var y = 0; y < this.height; y++ ){
                if( typeof(evolutive[x][y]) == 'undefined' ){
                    evolutive[x][y] = 0;
                }
            }
        }        
        
        this.drawWrapper();
        
    },
    
    drawWrapper : function(){
        var $parent = $('.wrapper');        
        
        $parent.css({width: this.map.tiles_layers[0][0].length*50, height: this.map.tiles_layers[0].length*50});
        
        var wH = $(window).height();
        var pH = $parent.height();
        
        if(pH < wH){
            $parent.css({'margin-top': (wH-pH)/2});
        }else{
            $parent.css({'margin': '0 auto' });
        }
            
    },
    
    draw : function(){
        var self = this;
        var $parent = $('.wrapper');
        
        $parent.html('');
        
        /* Draw interactive */
        for( var x = 0; x < this.map.tiles_layers[0].length ; x++ ){
            for( var y = 0; y < this.map.tiles_layers[0][0].length ; y++ ){
                var value = 'tile_interactive';
                value += this.grid_hidden ? ' hide' : '';
                var $tile = $('<div class="tile"></div>').addClass(value)
                                                         .attr('data-x',x)
                                                         .attr('data-y',y);
                this.drawTile($tile,x,y);
            }
        }
        
        /* Draw tiles */
        for( var l = 0; l < this.map.tiles_layers.length ; l++ ){
            var layer = this.map.tiles_layers[l];
            for( var x = 0; x < layer.length ; x++ ){
                for( var y = 0; y < layer[0].length ; y++ ){
                    var value = layer[x][y];
                    
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
        for( var x = 0; x < this.map.evolutive_layer.length ; x++ ){
            for( var y = 0; y < this.map.evolutive_layer[0].length ; y++ ){
                var value = this.map.evolutive_layer[x][y];
                
                if( value !== 0 ){
                    var $tile = $('<div class="tile evolutive"></div>').addClass(value).attr('id','tile_'+x+'_'+y);
                    this.drawTile($tile,x,y);
                }
                
            }
        }
        
        /* Draw Collision */
        for( var x = 0; x < this.map.collision_layer.length ; x++ ){
            for( var y = 0; y < this.map.collision_layer[0].length ; y++ ){
                var value = this.map.collision_layer[x][y];
                
                if( value == 0 ){
                    var $tile = $('<div class="tile collision"></div>');
                    this.drawTile($tile,x,y);
                }
                
            }
        }
        
        /* Draw Monsters */
        for( var i = 0; i < this.map.monsters.length ; i++ ){
            var monster = this.map.monsters[i];
            var $tile = $('<div class="tile monster"></div>').addClass('monster_'+monster.type).attr('id',monster.id);
            this.drawTile($tile,monster.x,monster.y);
        }
        
        /* Draw players */
        for( var i = 0; i < this.map.players.length ; i++ ){
            var player = this.map.players[i];
            var $tile = $('<div class="tile player"></div>').addClass('player_'+player.type).attr('id',player.id);
            this.drawTile($tile,player.x,player.y);
        }
        
    },
    
    drawTile : function($tile,x,y){
        var $parent = $('.wrapper');
        $tile.css({top: 50*x, left: 50*y });
        $parent.append($tile);
    },
}

var editor = new Editor();