/**
*  "Deft Panda" JavaScript game using Enchant.js
*  Author: Calvin Wong
*/

enchant();

window.onload = function() {
   //-- Globals
   var DEBUG_MODE = false;   
   var pandaSpeed = 4;
   var enemySpeedMilliseconds = 225;
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
                'res/bamboo.png',
                'res/deft_panda_tutorial_1.png',
                'res/deft_panda_tutorial_2.png',
                'res/deft_panda_tutorial_3.png',
                'res/Realistic_Punch.wav',
                'res/bear_growl.mp3',
                'res/crunch.mp3',
                'res/success.mp3',
                'res/failure.mp3',
                'res/harp_loop.mp3',
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
      var tutorial = new SceneTutorial();
      game.pushScene(tutorial);
   }
   // Start game
   game.start();

   /**
   * Scene for tutorial
   */
   var SceneTutorial = Class.create(Scene, {
       initialize: function() {
          Scene.apply(this);
          this.curTutorial = 1;

          this.tutorial = new Sprite(800, 600);
          this.tutorial.image = Game.instance.assets['res/deft_panda_tutorial_1.png'];

          var promptLabel = new Label("CLICK TO CONTINUE");
          promptLabel.x = 250;
          promptLabel.y = 500;
          promptLabel.color = 'white';
          promptLabel.font = '24px Tahoma, strong';
          promptLabel.textAlign = 'center';
          this.promptLabel = promptLabel;

          this.addChild(this.tutorial);
          this.addChild(promptLabel);

          Game.instance.assets['res/harp_loop.mp3'].play();

          this.addEventListener(Event.ENTER_FRAME, this.update);
          this.addEventListener(Event.TOUCH_START, this.nextTutorial);
       },

       update: function(evt) {
          //-- Loop BGM
          var bgMusic = Game.instance.assets['res/harp_loop.mp3'];
          if (bgMusic.currentTime >= bgMusic.duration){
             bgMusic.play();
          }

          this.promptLabel.tl.fadeOut(30);
          this.promptLabel.tl.fadeIn(30);          
       },

       nextTutorial: function(evt) {
          if (this.curTutorial <= 2) {
             this.curTutorial++;
             this.tutorial.image = Game.instance.assets['res/deft_panda_tutorial_' 
                   + this.curTutorial + ".png"];
          }
          else {
             Game.instance.assets['res/harp_loop.mp3'].stop();
             var mainScene = new SceneGame(1); // Start with 1 bamboo to collect
             Game.instance.pushScene(mainScene);
          }
       }
   });

   /**
   * The main Scene for the game
   */   
   var SceneGame = Class.create(Scene, {     //Extend the Scene class
       initialize: function(bambooGoal) {
           // Instance variables
           var game, bg, panda, hpLabel, bambooLabel, enemyGroup, bambooGroup, bgm;
           var totalBamboo = bambooGoal;
           this.totalBamboo = totalBamboo;
           var bambooNeeded = totalBamboo;
           this.bambooNeeded = bambooNeeded;
           this.paused = false;

           Scene.apply(this);                // Call superclass constructor
           game = Game.instance;             // Get game singleton instance

           // Play bgm (looping is performed in update)
           this.bgm = game.assets['res/FEMME - Shiki No Uta (Samurai Champloo Bump).mp3'];
           this.bgm.play();

           // Create the background/map
           bg = new Sprite(gameWidth, gameHeight);
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

           // Create the bamboo label
           bambooLabel = new Label('Bamboo Needed: ' + bambooNeeded);
           bambooLabel.x = gameWidth/2;
           bambooLabel.y = 0;
           bambooLabel.color = 'black';
           bambooLabel.font = 'bold 16px sans-serif';
           bambooLabel.textAlign = 'center';
           this.bambooLabel = bambooLabel;

           // Create the pause label
           pauseLabel = new Label('PAUSED');
           pauseLabel.x = 250;
           pauseLabel.y = 250;
           pauseLabel.color = 'white';
           pauseLabel.font = 'bold 32px sans-serif';
           pauseLabel.textAlign = 'center';
           this.pauseLabel = pauseLabel;                 

           // Enemy group Node
           enemyGroup = new Group();
           this.enemyGroup = enemyGroup;

           // Ex. px(40, 20) = cell(2, 1); 0-indexed w/ inverted y & 20px cells
           var enemy = new Enemy(5 * 20, 23 * 20);  // 1, 4 is a decent starting point
           enemyGroup.addChild(enemy);
           this.enemy = enemy;

           // Add bamboo for panda to collect
           bambooGroup = new Group();
           for (var i = 0; i < totalBamboo; i++) {
              var padding = 20; // Make sure bamboo is added inside map
              var bambooX = Math.floor(Math.random() * (gameWidth - padding));
              var bambooY = Math.floor(Math.random() * (gameHeight - padding));
              var bamboo = new Bamboo(bambooX, bambooY);
              bambooGroup.addChild(bamboo);
           }
           this.bambooGroup = bambooGroup;

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
           this.addChild(enemyGroup);
           this.addChild(bambooGroup);               
           this.addChild(hpLabel);
           this.addChild(bambooLabel);

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
           // If debugging, clicking will move the panda to the click location
           if (DEBUG_MODE) {
              this.panda.setPosition(evt.x, evt.y);
           }

           /* Incomplete dash logic is removed for this revision in favor of using
              the mouse click to pick up bamboo */

           // // Otherwise, clicking will dash the panda TOWARDS the click location
           // // if the player is currently being injured by the enemy
           // var pandaX = this.panda.x;
           // var pandaY = this.panda.y;
           // var dashDistance = 30;

           // // If player was just hurt and is relatively close to enemy, allow dash
           // // otherwise return without dashing
           // if (!this.panda.vulnerable && this.enemy.within(this.panda, 60)) {
           //     if (evt.x < pandaX) {
           //        pandaX -= dashDistance;
           //     }
           //     else {
           //        pandaX += dashDistance;
           //     }

           //     if (evt.y < pandaY) {
           //        pandaY -= dashDistance;
           //     }
           //     else {
           //        pandaY += dashDistance;
           //     }

           //     var game = Game.instance;
           //     var withinXBounds = pandaX > 20 && pandaX < gameWidth - 20;
           //     var withinYBounds = pandaY > 20 && pandaY < gameHeight - 20;
           //     if (withinXBounds && withinYBounds) {
           //        this.panda.tl.moveTo(pandaX, pandaY, 3); // Take 3 frames to move
           //     }
           // }           

           /* Logic for clicking to eat bamboo when close enough */
           var minDistToBamboo = 25;
           for (var i = this.bambooGroup.childNodes.length - 1; i >= 0; i--) {
              var bamboo, bGroup = this.bambooGroup;
              bamboo = bGroup.childNodes[i];
              if (bamboo.within(this.panda, minDistToBamboo)) {
                 bGroup.removeChild(bamboo);
                 this.bambooNeeded--;
                 Game.instance.assets['res/crunch.mp3'].play();
              }
           }
        },

        // A_BUTTON_DOWN handler (not actually 'A', but that's its name)
        // This is an example of using Game to get the current scene
        // Currently bound to 'CTRL' key, for eating bamboo
        // or to show enemy path in debug mode
        aHandler: function(evt) {
          // If debugging, pressing this button will display the best path
          // from the enemy to the player
          if (DEBUG_MODE) {
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
          }

           /* Logic for clicking to eat bamboo when close enough */
           var minDistToBamboo = 25;
           for (var i = this.bambooGroup.childNodes.length - 1; i >= 0; i--) {
              var bamboo, bGroup = this.bambooGroup;
              bamboo = bGroup.childNodes[i];
              if (bamboo.within(this.panda, minDistToBamboo)) {
                 bGroup.removeChild(bamboo);
                 this.bambooNeeded--;
                 Game.instance.assets['res/crunch.mp3'].play();
              }
           }          
        },        

        // B_BUTTON_DOWN handler (not actually 'B', but that's its name)
        // Currently bound to 'SHIFT' key, for pausing
        bHandler: function(evt) {
           var game = Game.instance;

           if (this.paused == true) {
              this.bgm.play();
              game.resume();
              this.removeChild(this.pauseLabel);        
           }
           else {
              this.bgm.stop();
              game.pause();
              this.addChild(this.pauseLabel);
           }
           this.paused = !this.paused;
        },

        // Perform checks and related updates
        update: function(evt) {
           //-- Loop BGM
           var bgMusic = this.bgm;
           if (bgMusic.currentTime >= bgMusic.duration){
              bgMusic.play();
           }

           //-- Display remaining bamboo
           if (this.bambooNeeded == 0) {
              this.bambooLabel.text = 'Get to the treasure!';
           }
           else {
              this.bambooLabel.text = 'Bamboo Needed: ' + this.bambooNeeded;
           }
           

           //-- Check win/lose conditions
           // Win = Panda reaches the chest at cell(3, 24)
           // NOTE: In future revisions, consider randomly placing chest
           //       and randomly placing player on opposite side
           var chestX = 3;
           var chestY = 24;
           if (Math.floor(this.panda.x/20) == chestX &&
               Math.floor(this.panda.y/20) == chestY &&
               this.bambooNeeded == 0) {
              this.bgm.stop();
              Game.instance.replaceScene(new SceneWin(this.totalBamboo));
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
           //    this.enemyGroup.addChild(enemy);
           // }

           //-- Update collision with enemy
           for (var i = this.enemyGroup.childNodes.length - 1; i >= 0; i--) {
              var enemy, og = this.enemyGroup;
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
                  var enemyGroup = Game.instance.currentScene.enemyGroup;
                  enemyGroup.addChild(newEnemy);
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
             if (game.currentScene.bambooNeeded == 0) {
                this.frame == 6 ? this.frame = 7 : this.frame = 6;
             }
             else {
                this.frame = (this.frame + 1) % 2;     // Switch b/t frame 0 and 1
             }
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

           this.tl.delay(enemySpeedMilliseconds).then(function() {
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

               // Don't do anything if player was just injured
               if (!scene.panda.vulnerable) {
                  return;
               }

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
   * Bamboo item for collection
   */
   var Bamboo = Class.create(Sprite, {

       initialize: function(x, y) {
           Sprite.apply(this,[32, 32]);
           this.image  = Game.instance.assets['res/bamboo.png'];    

           this.setPosition(x, y);

    
           // this.addEventListener(Event.ENTER_FRAME, this.update);

           console.log("Bamboo created at (" + x + ", " + y + ")");
       },

       setPosition: function (newX, newY) {
           this.x = newX;
           this.y = newY;
       },

       // // Remove bamboo on touch 
       // update: function(evt) { 
       //     var scene = Game.instance.currentScene;
       //     var panda = scene.panda;
       //     if (this.within(panda, 20)) {
       //         this.parentNode.removeChild(this);
       //         scene.bambooNeeded--;
       //     }
       // }
   }); // END Bamboo

   /**
   * Scene for losing the game
   */
   var SceneGameOver = Class.create(Scene, {
       initialize: function() {
           var gameOverLabel, scoreLabel;
           Scene.apply(this);

           this.backgroundColor = 'black';

           gameOverLabel = new Label("GAME OVER<br><br>Click to Restart");
           gameOverLabel.x = 250;
           gameOverLabel.y = 250;
           gameOverLabel.color = 'white';
           gameOverLabel.font = '32px Tahoma, strong';
           gameOverLabel.textAlign = 'center';

           this.addChild(gameOverLabel);
           Game.instance.assets['res/failure.mp3'].play();

           this.addEventListener(Event.TOUCH_START, this.restart);           
       },

       restart: function() {
           Game.instance.replaceScene(new SceneGame(1));
       }
   });

  /**
   * Scene for winning the game
   */
   var SceneWin = Class.create(Scene, {
       initialize: function(oldTotalBamboo) {
           var winLabel, scoreLabel;
           Scene.apply(this);

           this.backgroundColor = 'white';
           this.oldTotalBamboo = oldTotalBamboo;

           winLabel = new Label("YOU WIN!<br><br>Click for Next Level");
           winLabel.x = 250;
           winLabel.y = 250;
           winLabel.color = 'black';
           winLabel.font = '32px Tahoma, strong';
           winLabel.textAlign = 'center';

           this.addChild(winLabel);
           Game.instance.assets['res/success.mp3'].play();

           this.addEventListener(Event.TOUCH_START, this.restart);           
       },

       restart: function() {
           var newTotalBamboo = this.oldTotalBamboo + 1;
           Game.instance.replaceScene(new SceneGame(newTotalBamboo));
       }
   });      

}; // END window.onload