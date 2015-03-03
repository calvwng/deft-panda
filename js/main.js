/**
*  "Deft Panda" JavaScript game using Enchant.js
*  Author: Calvin Wong
*/

enchant();
 
window.onload = function() {
   var game = new Game(800, 600); 
   // NOTE: BG image grid is 40 cells by 30 cells (W X H)
   //       Each cell is 20x20 pixels

   // Preload resources
   game.preload('res/map.png',
                'res/panda_sheet.png',
                'res/enemy_sheet.png',
                'res/map_tiles.gif',
                'res/FEMME - Shiki No Uta (Samurai Champloo Bump).mp3');

   // Game settings/configuration
   game.fps = 30;
   game.scale = 1;
   // JavaScript keycode bindings
   game.keybind(87, 'up');    // W
   game.keybind(65, 'left');  // A
   game.keybind(83, 'down');  // S
   game.keybind(68, 'right'); // D
    game.keybind(17, 'a');     // CTRL
   game.keybind(16, 'b');     // SHIFT IN

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

           //-- Create an invisible map/grid for collision mapping
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
              [  0,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
              [  0,  1,  1,  1,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
              [  0,  0,  0,  1,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  1,  1,  1, 0,  0,  0,  0,  0,  0,  0,  0,  0,  1],
              [  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  1,  0,  0,  0,  1, 1,  0,  0,  0,  0,  0,  0,  0,  0,  1],
              [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0, 0,  1,  1,  0,  0,  0,  0,  0,  0,  1],
              [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0, 0,  0,  0,  1,  1,  0,  0,  0,  0,  1],
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
              [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 1,  1,  1,  1,  1,  1,  1,  1,  1,  1]  
           ];
           game.map = map;

           //-- Setting up EasyStar.js A* Pathfinding
           var easystar = new EasyStar.js();
           easystar.setIterationsPerCalculation(1000);  // Change if execution is too slow
           easystar.setGrid(map.collisionData);             // Set grid
           easystar.setAcceptableTiles([0]);   // Mark which cell type is "walkable"
           game.easystar = easystar;

           //-- Add child nodes, from bottom up

           this.addChild(bg);   
           // this.addChild(map);            // Apparently didn't need this
           this.addChild(obstructGroup);             
           this.addChild(panda);
           this.addChild(hpLabel);

           //-- Set up event listeners

           // Touch listener
           this.addEventListener(Event.TOUCH_START, this.handleTouchControl);
           // Button listeners
           this.addEventListener(Event.A_BUTTON_DOWN, this.aHandler);
           this.addEventListener(Event.B_BUTTON_DOWN, this.bHandler);
           // Update
           this.addEventListener(Event.ENTER_FRAME, this.update);
           this.generateEnemyTimer = 0;

           // DEBUG: single enemy for testing
           // px(40, 20) = cell(2, 1); 0-indexed w/ inverted y & 20px cells
           var testEnemy = new Enemy(1 * 20, 4 * 20); 
           obstructGroup.addChild(testEnemy);
           this.testEnemy = testEnemy;
        },

        // Event.TOUCH_START handler
        handleTouchControl: function(evt) {
           this.panda.setPosition(evt.x, evt.y);
        },

        // A_BUTTON_DOWN handler (not actually 'A', but that's its name)
        aHandler: function(evt) {
          var scene = Game.instance.currentScene;
          var panda = scene.panda;
          var enemy = scene.testEnemy;
          var pandaX = Math.floor(panda.x/20);
          var pandaY = Math.floor(panda.y/20);
          var enemyX = Math.floor(enemy.x/20);
          var enemyY = Math.floor(enemy.y/20);
          var easystar = Game.instance.easystar;
          easystar.findPath(pandaX, pandaY, enemyX, enemyY, this.tracePath);
          Game.instance.easystar.calculate();
        },        

        // B_BUTTON_DOWN handler (not actually 'B', but that's its name)
        bHandler: function(evt) {
           this.bgm.stop();
           Game.instance.replaceScene(new SceneGameOver());
        },

        // Perform checks and related updates
        update: function(evt) {
           //-- Loop BGM
           var bgMusic = this.bgm;
           if (bgMusic.currentTime >= bgMusic.duration){
              bgMusic.play();
           }           

           //-- Update enemy generation
           // this.generateEnemyTimer += evt.elapsed * 0.001;
           if (this.generateEnemyTimer >= 0.5) {
              var enemy;
              this.generateEnemyTimer -= 0.5;
              enemy = new Enemy(Math.floor(Math.random()*3));
              this.addChild(enemy);
           }

           //-- Update enemy collision
           for (var i = this.obstructGroup.childNodes.length - 1; i >= 0; i--) {
              var enemy, og = this.obstructGroup;
              enemy = og.childNodes[i];
              if (enemy.within(this.panda, 16)){
                 og.removeChild(enemy); 
                 break;
              }
          }

          // -- Easystar.js Pathfinding
          // var easystar = Game.instance.easystar;
          // var pandaX = Math.floor(this.panda.x/20);
          // var pandaY = Math.floor(this.panda.y/20);
          // var enemyX = Math.floor(this.testEnemy.x/20);
          // var enemyY = Math.floor(this.testEnemy.y/20);
          // easystar.findPath(pandaX, pandaY, enemyX, enemyY, this.tracePath);
        },

        tracePath: function(path) {
            if (path == null) {
               console.log("Path was not found.");
            }
            else {
               // alert("Path was found. The first Point is " + path[0].x + " " + path[0].y);
               for (var i = 0; i < path.length; i++) {
                  var newEnemy = new Enemy(path[i].x * 20, path[i].y * 20); // *20 for pixel -> cell
                  var obstructGroup = Game.instance.currentScene.obstructGroup;
                  obstructGroup.addChild(newEnemy);
               }
            }
        }
    });

    /**
    * The Panda player character
    */
    var Panda = Class.create(Sprite, {

       initialize: function() {
           Sprite.apply(this,[32, 32]);      // Each sprite is 32x32
           this.image = Game.instance.assets['res/panda_sheet.png'];
           //-- Animate
           this.animationDuration = 0;       // Animation timer

           this.addEventListener('enterframe', this.update);
         },

        // Event.ENTER_FRAME Handler function for updating movement & animation
        update: function (evt) {
          var game = Game.instance;
          var input = game.input;
          var map = game.map;

          this.animationDuration += evt.elapsed * 0.001;    // ms to sec   
          if (this.animationDuration >= 0.25) {
             this.frame = (this.frame + 1) % 2;     // Switch b/t frame 0 and 1
             this.animationDuration -= 0.25;
          }


          //-- Handle movement input and map collision for Panda
          this.dx = 0;
          this.dy = 0;
          
          if (input.left && !input.right) {
             this.dx = -4;
          } 
          else if (input.right && !input.left) {
             this.dx = 4;
          } 
          if (input.up && !input.down) {
             this.dy = -4;
          } 
          else if (input.down && !input.up) {
             this.dy = 4;
          }
          
          this.dx += this.x;
          this.dy += this.y;

          if (0 <= this.dx && this.dx < map.width && 0 <= this.dy && this.dy < map.height) {
              if (!map.hitTest(this.dx, this.dy)) {
                  this.moveTo(this.dx, this.dy);
              }
              else {
                  // TODO: Add a little knockback to make movement more fluid
              }
          }
        },

        setPosition: function (newX, newY) {
           this.x = newX;
           this.y = newY;
        }      
   });

   // Enemy
   var Enemy = Class.create(Sprite, {

       initialize: function(x, y) {
           Sprite.apply(this,[32, 32]);
           this.image  = Game.instance.assets['res/enemy_sheet.png'];      
           this.setPosition(x, y);
           this.addEventListener(Event.ENTER_FRAME, this.update);
       },

       setPosition: function (newX, newY) {
           this.x = newX;
           this.y = newY;
       },

       update: function(evt) { 
           var game = Game.instance;

           if (this.x <= 0 || this.x >= game.width || 
               this.y <= 0 || this.y >= game.height) {
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