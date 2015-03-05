# "Deft Panda" by Calvin Wong
"Deft Panda" is a JavaScript game exploring the capabilities of the Enchant.js framework (particularly its object oriented JS, collision mapping, and event handling) and A Star pathfinding for A.I. using the Easystar.js library.

This was created for an open-ended CPE 378 (Interactive Entertainment Engineering) lab assignment at Cal Poly San Luis Obispo.

NOTE: Currently this requires an external mouse to work as intended, otherwise clicking with a laptop's built-in left mouse button will not remove bamboo. For some reason the "touch" event is not being caught by the listener when using a laptop's built-in mouse.
As a workaround, I've currently bound the "CTRL" key to serve the same function of eating bamboo.

# Game Context
You are Deft Panda, the most passionate bamboo-eater in the land.

Word has spread that the most delectable shoot of bamboo from every harvest season is hidden in a chest guarded by a relentless brown bear, but you are confident you can evade it.

Due to your cravings for a good meal, you set off for a bite of each harvest season's best bamboo shoot, eating every shoot you happen upon along the way (you can't help it...you're a panda bear). 

For some reason, every bamboo season has been getting more and more bountiful...

How many seasons will pass before your unsatiable hunger leads to your downfall?

# Win/Lose Conditions For Each Level
Win: Eat all the bamboo shoots on the map, then reach the red chest without losing all of your health points.
Lose: Lose all of your health points.

# Controls
Movement:       UP, LEFT, DOWN, RIGHT Directional Arrow Keys OR WASD

Pause/Unpause:  SHIFT

Eat Bamboo:     LEFT CLICK (Only when Deft Panda is touching a bamboo shoot)

# Debug Mode
If the flag "DEBUG_MODE" in "js/main.js" is set to TRUE, then LEFT CLICK will move Deft Panda to the mouse click location and pressing "CTRL" will display the current best path from the enemy brown bear to Deft Panda. This breaks normal gameplay, so leave the flag as FALSE unless you're simply curious or want to tinker.

# Resources
I do not own the sound effects, sprites, or music that I used for this educational project. All these assets belong to their respective owners.
