/**
*  "Deft Panda" JavaScript game using Enchant.js
*  Author: Calvin Wong
*/

enchant();

window.onload = function() {
   //-- Globals
   var pandaSpeed = 2.5;
   var enemyCanMoveDiagonally = true;
   var gameWidth = 800;
   var gameHeight = 600;

   //-- Game setup
   var game = new Game(gameWidth, gameHeight); 
   // NOTE: BG image grid is 40 cells by 30 cells (W X H)
   //       Each cell is 20x20 pixels

   // Preload resources
   game.preload('res/map.png',
                'res/panda_sheet.png',
                'res/enemy_sheet.png',
                'res/map_tiles.gif',
                'res/Realistic_Punch.wav',
                'res/bear_growl.mp3',
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
           this.bgm.play();

           // Create the background/map
           bg = new Sprite(800,600);
           bg.image = game.assets['res/map.png']; 

           // Create the panda
           panda = new Panda(34 * 20, 2 * 20);       // Each sprite is 32x32
           panda.image = game.assets['res/panda_sheet.png'];
           this.panda = panda;               // Declare & set SceneGame's panda

           // Create the health label
           hpLabel = new Label('HP: ');
           hpLabel.x = 0;
           hpLabel.y = 0;
           hpLabel.color = 'black';
           hpLabel.font = 'bold 16px sans-serif';
           hpLabel.textAlign = 'center';
           this.hpLabel = hpLabel;

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
              [  1,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  1,  1,  1,  0,  1,  0,  1],
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
           enemyCanMoveDiagonally ? easystar.enableDiagonals() : 0;        // Allow diagonal movement 
           game.easystar = easystar;

           //-- Add child nodes in layers from bottom up
           // this.addChild(map);     // Apparently didn't need this since I set the game's map already
           this.addChild(bg);
           this.addChild(panda);
           this.addChild(obstructGroup);               
           this.addChild(hpLabel);

           // Ex. px(40, 20) = cell(2, 1); 0-indexed w/ inverted y & 20px cells
           var enemy = new Enemy(5 * 20, 23 * 20);  // 1, 4 is a decent starting point
           obstructGroup.addChild(enemy);
           this.enemy = enemy;           

           //-- Set up event listeners

           // Touch listener
           this.addEventListener(Event.TOUCH_START, this.handleTouchControl);
           // Button listeners
           this.addEventListener(Event.A_BUTTON_DOWN, this.aHandler);
           this.addEventListener(Event.B_BUTTON_DOWN, this.bHandler);
           // Update
           this.addEventListener(Event.ENTER_FRAME, this.update);

           // this.generateEnemyTimer = 0;  // Unused in this revision
        },

        // Event.TOUCH_START handler
        handleTouchControl: function(evt) {
           this.panda.setPosition(evt.x, evt.y);
        },

        // A_BUTTON_DOWN handler (not actually 'A', but that's its name)
        // This is an example of using Game to get the current scene
        aHandler: function(evt) {
          var scene = Game.instance.currentScene;
          var panda = scene.panda;
          var enemy = scene.enemy;
          var pandaX = Math.floor(panda.x/20);
          var pandaY = Math.floor(panda.y/20);
          var enemyX = Math.floor(enemy.x/20);
          var enemyY = Math.floor(enemy.y/20);
          var easystar = Game.instance.easystar;
          easystar.findPath(enemyX, enemyY, pandaX, pandaY, this.tracePath);
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

           //-- Check win/lose conditions
           // Win = Panda reaches the chest at cell(3, 24)
           // NOTE: In future revisions, consider randomly placing chest
           //       and randomly placing player on opposite side
           var chestX = 3;
           var chestY = 24;
           if (Math.floor(this.panda.x/20) == chestX &&
               Math.floor(this.panda.y/20) == chestY) {
              this.bgm.stop();
              Game.instance.replaceScene(new SceneWin());
           }
           // Lose = Panda's hp reaches 0
           if (this.panda.hp <= 0) {
              this.bgm.stop();
              Game.instance.replaceScene(new SceneGameOver());
           }

           //-- Update enemy generationm if desired (unused in this revision)
           // this.generateEnemyTimer += evt.elapsed * 0.001;
           // if (this.generateEnemyTimer >= 0.5) {
           //    var enemy;
           //    this.generateEnemyTimer -= 0.5;
           //    enemy = new Enemy(Math.floor(Math.random()*3));
           //    this.obstructGroup.addChild(enemy);
           // }

           //-- Update collision with enemy
           for (var i = this.obstructGroup.childNodes.length - 1; i >= 0; i--) {
              var enemy, og = this.obstructGroup;
              enemy = og.childNodes[i];
              if (this.panda.vulnerable && enemy.within(this.panda, 16)) {
                 Game.instance.assets['res/Realistic_Punch.wav'].play();
                 Game.instance.assets['res/bear_growl.mp3'].play();
                 this.panda.hp -= 1;
                 this.toggleVulnerability(this.panda); // Make panda invincible for 60 frames

                 for (var f = 0; f < 3; f++) { 
                   this.panda.tl.fadeOut(5);
                   this.panda.tl.fadeIn(5);                  
                 }
                 this.tl.delay(60).then( function() {  // Panda is vulnerable after 60 frames
                    this.toggleVulnerability(this.panda); 
                 });
              }
           }

           var healthBar = "";
           for (i = 0; i < this.panda.hp; i++) {
              healthBar += " | ";
           }
           this.hpLabel.text = "HP:" + healthBar;
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
        },

        toggleVulnerability: function(character) {
           character.vulnerable = !character.vulnerable;  
        }
    });

    /**
    * The Panda player character
    */
    var Panda = Class.create(Sprite, {

       initialize: function(x, y) {
           Sprite.apply(this,[32, 32]);      // Each sprite is 32x32
           this.image = Game.instance.assets['res/panda_sheet.png'];

           //-- Instance variables
           this.hp = 5;
           this.vulnerable = true;

           this.setPosition(x, y);

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
             this.dx = -pandaSpeed;
          } 
          else if (input.right && !input.left) {
             this.dx = pandaSpeed;
          } 
          if (input.up && !input.down) {
             this.dy = -pandaSpeed;
          } 
          else if (input.down && !input.up) {
             this.dy = pandaSpeed;
          }
          
          this.dx += this.x;
          this.dy += this.y;

          if (0 <= this.dx && this.dx < map.width && 0 <= this.dy && this.dy < map.height) {
              if (!map.hitTest(this.dx, this.dy)) {
                  this.moveTo(this.dx, this.dy);
              }
              else {
                  // TODO: Add a slight knockback to make movement more fluid?
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

           this.hp = 8;
           this.vulnerable = true;
           
           this.setPosition(x, y);
    
           this.addEventListener(Event.ENTER_FRAME, this.update);
       },

       setPosition: function (newX, newY) {
           this.x = newX;
           this.y = newY;
       },

       update: function(evt) { 
           var game = Game.instance;

           if (this.hp == 0) {
              this.parentNode.removeChild(this);        
           }

           var easystar = game.easystar;
           var scene = game.currentScene;

           this.tl.setTimeBased();

           this.tl.delay(250).then(function() {
              easystar.findPath(Math.floor(this.x/20), Math.floor(this.y/20), 
                    Math.floor(scene.panda.x/20), Math.floor(scene.panda.y/20),
                    this.pathHandler);
              this.calculatePath();
           });
         },

         calculatePath: function() {
            // console.log("Calculating path");
            Game.instance.easystar.calculate();
         },

         // This is not within the scope of Enemy; this is within Easystar's scope
         pathHandler: function(path) {
            if (path != null) {
               var scene = Game.instance.currentScene;
               var enemy = scene.enemy;

               // console.log("Path length is " + path.length);
               if (path.length <= 2) {
                  enemy.x = scene.panda.x
                  enemy.y = scene.panda.y;
                  // console.log("Panda was reached at " + scene.panda.x + ", " + scene.panda.y);
                  return;
               }
               else if (path.length > 1) {
                  // enemy.tl.moveTo(path[1].x * 20, path[1].y * 20, 2);  // Why didn't this work, despite it working before?
                  enemy.x = path[1].x * 20;
                  enemy.y = path[1].y * 20;

                  // console.log("Next pixel coord is " + path[1].x * 20 + ", " + path[1].y * 20);
                  // console.log("and target destination is " + path[path.length - 1].x * 20 + ", " + path[path.length - 1].y * 20);
               }
            }
            else {
               // console.log("Path was not found.");
            }
         }            
   }); // END Enemy

   /**
   * Scene for losing the game
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

      /**
   * Scene for winning the game
   */
   var SceneWin = Class.create(Scene, {
       initialize: function() {
           var winLabel, scoreLabel;
           Scene.apply(this);

           this.backgroundColor = 'white';

           winLabel = new Label("YOU WIN :]<br><br>Click to Restart");
           winLabel.x = Game.instance.width/2;
           winLabel.y = Game.instance.height/2;
           winLabel.color = 'black';
           winLabel.font = '32px strong';
           winLabel.textAlign = 'center';

           this.addChild(winLabel);

           this.addEventListener(Event.TOUCH_START, this.restart);           
       },

       restart: function() {
           Game.instance.replaceScene(new SceneGame());
       }
   });      

}; // END window.onload