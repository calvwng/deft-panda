enchant();
 
window.onload = function() {
   var game = new Game(800, 600); // NOTE: BG image grid is 40x30 cells (W X H)

   // Preload resources
   game.preload('res/map.png',
                'res/panda_sheet.png',
                'res/enemy_sheet.png',
                'res/map_tiles.gif',
                'res/FEMME - Shiki No Uta (Samurai Champloo Bump).mp3');

   // Game settings
   game.fps = 30;
   game.scale = 1;
   game.keybind(87, 'up');    // W
   game.keybind(65, 'left');  // A
   game.keybind(83, 'down');  // S
   game.keybind(68, 'right'); // D
   game.keybind(16, 'b');     // SHIFT IN


   // // Setting up game grid and EasyStar.js A* Pathfinding
   // var easystar = new EasyStar.js();
   // var grid = [];
   // for (var r = 0; r < 30; r++) {
   //    // Fill all cells with 0s
   //    var column = Array.apply(null, new Array(5)).map(Number.prototype.valueOf, 0);
   //    grid.push(column);
   // }
   // easystar.setGrid(grid);             // Set grid
   // easystar.setAcceptableTiles([0]);   // Mark which cell type is "walkable"   


   game.onload = function() {
      // Once Game finishes loading
      var scene, bg;
      var scene = new SceneGame();       
      game.pushScene(scene);
   }
   // Start game
   game.start();
 

   /**
   * The main Scene for the game
   */   
   var SceneGame = Class.create(Scene, {     //Extend the Scene class
       initialize: function() {
           // Instance variables
           var game, bg, panda, hpLabel, obstructGroup, bgm;

           Scene.apply(this);                // Call superclass constructor
           game = Game.instance;             // Get game singleton instance

           // Play bgm (looping is performed in update)
           this.bgm = game.assets['res/FEMME - Shiki No Uta (Samurai Champloo Bump).mp3'];
           // this.bgm.play();

           // Create the background/map
           bg = new Sprite(800,600);
           bg.image = game.assets['res/map.png']; 

           // Create the panda
           panda = new Panda();       // Each sprite is 32x32
           panda.image = game.assets['res/panda_sheet.png'];
           panda.x = game.width/2;
           panda.y = game.height/2;
           this.panda = panda;               // Declare & set SceneGame's panda

           // Create the health label
           hpLabel = new Label('HP: 100');
           hpLabel.x = 0;
           hpLabel.y = 0;
           hpLabel.color = 'black';
           hpLabel.font = 'bold 16px sans-serif';
           hpLabel.textAlign = 'center';
           hpLabel.hpLabel = hpLabel;

           // Obstruction group Node
           obstructGroup = new Group();
           this.obstructGroup = obstructGroup;

         var map = new Map(20, 20);
         map.image = game.assets['res/map.png'];
         var grid = [];
         for (var r = 0; r < 30; r++) {
            // Fill cells with 0s as placeholders, since not using tile images
            var column = Array.apply(null, new Array(40)).map(Number.prototype.valueOf, 0);
            grid.push(column);
         }
         map.loadData(grid);   
         map.collisionData = [
            [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  1,  1,  1,  1,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  1,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  1,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  1,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  1,  0,  0,  1,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],    

            [  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  1,  1,  1,  1,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 1,  1,  1,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  1,  1,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  1,  1,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  1,  1,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  1,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  1,  1,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1, 1,  1,  0,  0,  0,  0,  0,  0,  0,  1],

            [  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 1,  1,  1,  0,  0,  0,  0,  0,  0,  1],
            [  1,  1,  0,  1,  1,  1,  1,  0,  1,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  1,  0,  0,  0,  0,  0,  0,  1],
            [  1,  0,  0,  0,  0,  0,  1,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  1,  1,  0,  0,  0,  0,  0,  1],
            [  1,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  1,  1,  1,  0,  0,  0,  1],
            [  1,  0,  0,  1,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  1,  1,  1,  0,  1,  0,  1],
            [  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  1,  1,  0,  0,  0,  1],
            [  1,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  1,  0,  1],
            [  1,  0,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  1,  1],
            [  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
            [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 1,  1,  1,  1,  1,  1,  1,  1,  1,  1],  
         ];
         game.map = map;
         





           // Add child nodes, from bottom up
           this.addChild(bg);   
           // this.addChild(map);            // Apparently didn't need this
           this.addChild(obstructGroup);             
           this.addChild(panda);
           this.addChild(hpLabel);

           // Touch listener
           this.addEventListener(Event.TOUCH_START, this.handleTouchControl);
           // Button listeners
           this.addEventListener(Event.B_BUTTON_DOWN, this.bHandler);
           // Update
           this.addEventListener(Event.ENTER_FRAME, this.update);
           this.generateEnemyTimer = 0;

           // DEBUG: enemy for testing
           var testEnemy = new Enemy(Math.floor(Math.random()*3));
           testEnemy.x = 110;
           testEnemy.y = 450;
           obstructGroup.addChild(testEnemy);
        },

        // Event.TOUCH_START handler
        handleTouchControl: function(evt) {
           this.panda.setPosition(evt.x, evt.y);
        },

        bHandler: function() {
           this.bgm.stop();
           Game.instance.replaceScene(new SceneGameOver());
        },

        // Perform checks and related updates
        update: function(evt) {
           // Loop BGM
           var bgMusic = this.bgm;
           if (bgMusic.currentTime >= bgMusic.duration){
              bgMusic.play();
           }           

           // Update enemy generation
           // this.generateEnemyTimer += evt.elapsed * 0.001;
           if (this.generateEnemyTimer >= 0.5) {
              var enemy;
              this.generateEnemyTimer -= 0.5;
              enemy = new Enemy(Math.floor(Math.random()*3));
              this.addChild(enemy);
           }

           // Update enemy collision
           for (var i = this.obstructGroup.childNodes.length - 1; i >= 0; i--) {
              var enemy, og = this.obstructGroup;
              enemy = og.childNodes[i];
              if (enemy.within(this.panda, 16)){
                 og.removeChild(enemy); 
                 break;
              }
          }           
        }        
    });

    /**
    * The Panda player character
    */
    var Panda = Class.create(Sprite, {
       // The player character.     
       initialize: function() {
           // Call superclass constructor
           Sprite.apply(this,[32, 32]);      // Each sprite is 32x32
           this.image = Game.instance.assets['res/panda_sheet.png'];
           // Animate
           this.animationDuration = 0;       // Animation timer
           // this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);

           this.addEventListener('enterframe', function() {
                this.vx = 0;
                this.vy = 0;
                var game = Game.instance;
                if (game.input.left) {
                    // this.direction = 1;
                    this.vx = -4;
                } else if (game.input.right) {
                    // this.direction = 2;
                    this.vx = 4;
                } else if (game.input.up) {
                    // this.direction = 3;
                    this.vy = -4;
                } else if (game.input.down) {
                    // this.direction = 0;
                    this.vy = 4;
                }
                var map = Game.instance.map;
                this.vx += this.x;
                this.vy += this.y;
                if (0 <= this.vx && this.vx < map.width && 0 <= this.vy && this.vy < map.height) {
                    if (!map.hitTest(this.vx, this.vy)) {
                        this.moveTo(this.vx, this.vy);
                    }
                    else {
                        console.log("collision");
                    }
                }
                
           });  

         },

        // Event.ENTER_FRAME Handler function for updating movement & animation
        updateAnimation: function (evt) {        
          this.animationDuration += evt.elapsed * 0.001;    // ms to sec   
          if (this.animationDuration >= 0.25) {
            this.frame = (this.frame + 1) % 2;     // Switch b/t frame 0 and 1
            this.animationDuration -= 0.25;
          }

          // Handle panda movement with WASD controls
          var input = Game.instance.input;
          if (input.up && !input.down) {
            this.y -= 1;
          }
          else if (input.down && !input.up) {
            this.y += 1;
          }
          if (input.left && !input.right) {
            this.x -= 1;
          }
          else if (input.right && !input.left) {
            this.x += 1;
          }

        },

        setPosition: function (newX, newY) {
           this.x = newX;
           this.y = newY;
        }      
   });

   // Enemy
   var Enemy = Class.create(Sprite, {
       initialize: function(lane) {
           // Call superclass constructor
           Sprite.apply(this,[32, 32]);
           this.image  = Game.instance.assets['res/enemy_sheet.png'];      
           this.setPosition(110, 450);
           //this.addEventListener(Event.ENTER_FRAME, this.update);
       },

       setPosition: function (newX, newY) {
           this.x = newX;
           this.y = newY;
       },

       update: function(evt) { 
           var ySpeed, game;

           game = Game.instance;
           ySpeed = 300;

           this.y += ySpeed * evt.elapsed * 0.001; // Move enemy
           if (this.y > game.height) {
              this.parentNode.removeChild(this);        
           }
       }                   
   }); // END Enemy

   /**
   * Scene for ending the game
   */
   var SceneGameOver = Class.create(Scene, {
       initialize: function() {
           var gameOverLabel, scoreLabel;
           Scene.apply(this);

           this.backgroundColor = 'black';

           gameOverLabel = new Label("GAME OVER<br><br>Click to Restart");
           gameOverLabel.x = Game.instance.width/2;
           gameOverLabel.y = Game.instance.height/2;
           gameOverLabel.color = 'white';
           gameOverLabel.font = '32px strong';
           gameOverLabel.textAlign = 'center';

           this.addChild(gameOverLabel);

           this.addEventListener(Event.TOUCH_START, this.restart);           
       },

       restart: function() {
           Game.instance.replaceScene(new SceneGame());
       }
   });   

}; // END window.onload