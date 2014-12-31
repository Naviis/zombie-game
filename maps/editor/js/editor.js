var Editor = function(){
    this.width = 10;
    this.height = 10;
    this.current_tile = $('.selected');
    this.current_layer = 0;
    this.grid_hidden = false;
    this.map = {
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
                    self.map.tiles_layers[self.current_layer][y][x] = self.current_tile.attr('data-class');
                    self.draw();
                break;
                
                case 'collision':
                    self.map.collision_layer[y][x] = 0;
                    self.draw();
                break;
                
                case 'evolutive':
                    self.map.evolutive_layer[y][x] = self.current_tile.attr('data-class');
                    //Reset tile layers
                    for( var l = 0; l < self.map.tiles_layers.length; l++ ){
                        var layer = self.map.tiles_layers[l];
                        if( l == 0 ){
                            layer[y][x] = 'tile_base_1';
                        }else{
                            layer[y][x] = '';
                        }
                    }
                    self.draw();
                break;
                
                case 'erase_tile':
                    var content = self.current_layer == 0 ? 'tile_base_1' : '';
                    self.map.tiles_layers[self.current_layer][y][x] = content;
                    self.draw();
                break;
                    
                case 'erase_collision':
                    self.map.collision_layer[y][x] = 1;
                    self.draw();
                break;
                
                case 'erase_evolutive':
                    self.map.evolutive_layer[y][x] = 0;
                    self.draw();
                break;
            }
            
        });
        
    },
    
    changeMapSize : function(){
        
        // Change tiles arrays
        for( var l = 0; l < this.map.tiles_layers.length; l++ ){
            
            var layer = this.map.tiles_layers[l];
            
            for( var h = 0; h < this.height; h++ ){
                
                if( typeof(layer[h]) == 'undefined' ){
                    layer[h] = [];
                }
                
                for( var w = 0; w < this.width; w++ ){
                    if( typeof(layer[h][w]) == 'undefined' ){
                        layer[h][w] = l == 0 ? 'tile_base_1' : '';
                    }
                }
            }
        }
        
        // Change collision array
        var collision = this.map.collision_layer;
        for( var h = 0; h < this.height; h++ ){

            if( typeof(collision[h]) == 'undefined' ){
                collision[h] = [];
            }

            for( var w = 0; w < this.width; w++ ){
                if( typeof(collision[h][w]) == 'undefined' ){
                    collision[h][w] = 1;
                }
            }
        }
        
        // Change evolutive array
        var evolutive = this.map.evolutive_layer;
        for( var h = 0; h < this.width; h++ ){

            if( typeof(evolutive[h]) == 'undefined' ){
                evolutive[h] = [];
            }

            for( var w = 0; w < this.height; w++ ){
                if( typeof(evolutive[h][w]) == 'undefined' ){
                    evolutive[h][w] = 0;
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
        for( var y = 0; y < this.map.evolutive_layer.length ; y++ ){
            for( var x = 0; x < this.map.evolutive_layer[0].length ; x++ ){
                var value = this.map.evolutive_layer[y][x];
                
                if( value !== 0 ){
                    var $tile = $('<div class="tile evolutive"></div>').addClass(value).attr('id','tile_'+x+'_'+y);
                    this.drawTile($tile,x,y);
                }
                
            }
        }
        
        /* Draw Collision */
        for( var y = 0; y < this.map.collision_layer.length ; y++ ){
            for( var x = 0; x < this.map.collision_layer[0].length ; x++ ){
                var value = this.map.collision_layer[y][x];
                
                if( value == 0 ){
                    var $tile = $('<div class="tile collision"></div>');
                    this.drawTile($tile,x,y);
                }
                
            }
        }
        
    },
    
    drawTile : function($tile,x,y){
        var $parent = $('.wrapper');
        $tile.css({left: 50*x, top: 50*y });
        $parent.append($tile);
    },
}

var editor = new Editor();