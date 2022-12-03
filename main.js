import Phaser, { Game } from "phaser";
let cursors;
let spacebar;
let restartKey;
let startGameKey;
let startGameText;
let startingGame;
let character;
let attacking;
let npc;
let zombies;
let zombiesPNG;
let zombieKills;
let zombieKillsText;
let lastKeyPress;
let gameOverText;
let gameOverPrinted;
let resetGameText;
let npcLastDirection;
let numberOfZombies;
let npcCollisions;
//create an array of 30 so each zombie had their own index number
let zombiesLastDirection;
//pre determined zombie positions on the map
let zombiePositions;
let characterPositions;
//let characterNpcCollision; -- declare the variable
let gameOver;
//game config
const game = new Game({
  type: Phaser.AUTO,
  width: 1440,
  height: 960,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  scene: {
    preload() {
      //creating a array of the png zombie names to itterate through
      zombiesPNG = [
        "bloody_zombie-NESWNight",
        "bloody_zombie-NESWNightAlt",
        "headless_zombie-NESWNight",
        "headless_zombie-NESWNightAlt",
        "rotting_zombie-NESWNight",
        "zombie-NESWNight",
        "rotting_zombie-NESWNightAlt",
        "zombie-NESWNightAlt",
      ];
      //for each png assign an atlas -> pngs referenced via JSON
      zombiesPNG.forEach((zombie) => {
        this.load.atlas(
          "zombie" + zombiesPNG.indexOf(zombie),
          `/myAssets/24x32/${zombie}.png`,
          "/myAssets/zombie.json"
        );
      });
      //load the PNG of the world sprites to use
      this.load.image("overworld", "/myAssets/Overworldnight.png");
      //loading a tilesmap called tilesmap using the newestMap2 JSON
      this.load.tilemapTiledJSON("tilesmap", "/myAssets/map.json");
      //loading the character atlas using the JSON as a reference
      this.load.atlas(
        "character",
        "/myAssets/gfx/characterNight.png",
        "/myAssets/character.json"
      );
      //loading the npc atlas using the JSON as a reference
      this.load.atlas(
        "npc",
        "/myAssets/npcNight.png",
        "/myAssets/characterNpc.json"
      );
    },
    create() {
      npcCollisions = [];
      startingGame = false;
      gameOverPrinted = false;
      zombieKills = 0;
      attacking = false;
      zombies = [];
      numberOfZombies = 100;
      zombiesLastDirection = new Array(numberOfZombies);
      zombiePositions = [
        { x: 44, y: 54 },
        { x: 39, y: 320 },
        { x: 1280, y: 384 },
        { x: 688, y: 448 },
        { x: 656, y: 848 },
        { x: 128, y: 416 },
        { x: 384, y: 288 },
        { x: 128, y: 800 },
        { x: 720, y: 928 },
        { x: 320, y: 528 },
        { x: 704, y: 864 },
        { x: 624, y: 464 },
        { x: 1024, y: 256 },
        { x: 272, y: 368 },
        { x: 32, y: 256 },
        { x: 368, y: 384 },
        { x: 448, y: 784 },
        { x: 1296, y: 176 },
        { x: 240, y: 208 },
        { x: 160, y: 464 },
        { x: 64, y: 384 },
        { x: 992, y: 192 },
        { x: 592, y: 816 },
      ];
      characterPositions = [
        { x: 1040, y: 256 },
        { x: 1056, y: 100 },
        { x: 880, y: 816 },
        { x: 918, y: 100 },
        { x: 1184, y: 100 },
        { x: 1408, y: 640 },
        { x: 1376, y: 80 },
        { x: 16, y: 416 },
        { x: 96, y: 784 },
        { x: 16, y: 928 },
      ];
      gameOver = false;
      //refercing the tilemap to create a tileset
      const map = this.make.tilemap({ key: "tilesmap" });
      //refercing the tilemap image to create a tileset
      const tileset = map.addTilesetImage("Overworld", "overworld");
      //creating non interactive layers
      const layers = ["Group 1/ground", "Group 1/path"];
      //creating an array of sprite names, and the length = the amount of sprites in the animation
      const characterSprites = [
        { name: "walkDown", length: 3 },
        { name: "walkUp", length: 3 },
        { name: "walkLeft", length: 3 },
        { name: "walkRight", length: 3 },
        { name: "attackDown", length: 3 },
        { name: "attackUp", length: 3 },
        { name: "attackLeft", length: 3 },
        { name: "attackRight", length: 3 },
        { name: "liftDown", length: 2 },
        { name: "liftUp", length: 2 },
        { name: "liftLeft", length: 2 },
        { name: "liftRight", length: 2 },
      ];
      //creating an array of sprite names, and the length = the amount of sprites in the animation
      const npcSprites = [
        { name: "npcWalkDown", length: 3 },
        { name: "npcWalkUp", length: 3 },
        { name: "npcWalkLeft", length: 3 },
        { name: "npcWalkRight", length: 3 },
        { name: "npcAttackDown", length: 3 },
        { name: "npcAttackUp", length: 3 },
        { name: "npcAttackLeft", length: 3 },
        { name: "npcAttackRight", length: 3 },
      ];
      //creating an array of sprite names, and the length = the amount of sprites in the animation
      const zomSprites = [
        { name: "zomWalkUp", length: 2 },
        { name: "zomWalkRight", length: 2 },
        { name: "zomWalkDown", length: 2 },
        { name: "zomWalkLeft", length: 2 },
      ];
      //water layer is created first
      const water = map.createLayer("Group 1/water", tileset, 0, 0);
      //creating layers through a for each loop
      layers.forEach((layer) => {
        map.createLayer(layer, tileset, 0, 0);
      });
      //creating more layers
      const bridge = map.createLayer("Group 1/bridge", tileset, 0, 0);
      const shrub = map.createLayer("Group 1/shrub", tileset, 0, 0);
      const fence = map.createLayer("Group 1/fence", tileset, 0, 0);
      const building = map.createLayer("Group 1/building", tileset, 0, 0);
      const pond = map.createLayer("Group 1/pond", tileset, 0, 0);
      map.createLayer("Group 1/pondlife", tileset, 0, 0);
      //creating the npc
      let charPosition =
        characterPositions[
          Math.floor(Math.random() * characterPositions.length)
        ];
      npc = this.physics.add.sprite(charPosition.x, charPosition.y - 10, "npc");
      npc.setCollideWorldBounds(true);
      npc.setScale(0.5);
      npc.setBounce(1);
      //creating the character

      character = this.physics.add.sprite(
        charPosition.x,
        charPosition.y,
        "character"
      );
      character.setCollideWorldBounds(true);
      character.setScale(0.6);
      //creating zombies with a random position and random sprite then pushing to an array
      for (let i = 0; i < numberOfZombies; i++) {
        let position =
          zombiePositions[Math.floor(Math.random() * zombiePositions.length)];
        let zombie = this.physics.add.sprite(
          (position.x +=
            /*random number between 20 & 60 rounded to the nearest 10 */
            Math.ceil(Math.random() * 9)),
          (position.y +=
            /*random number between 10 & 30 rounded to the nearest 10 */
            Math.ceil(Math.random() * 9)),
          //creating the zombies sprite randomly between 0-3
          `zombie${Math.floor(Math.random() * zombiesPNG.length)}`
        );
        zombie.setScale(0.5);
        //pusing to the zombie array so I can reference them
        zombies.push(zombie);
      }
      //assigning key input
      cursors = this.input.keyboard.createCursorKeys();
      spacebar = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      startGameKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ENTER
      );
      //creating animation for all character sprites
      characterSprites.forEach((animation) => {
        this.anims.create({
          key: animation.name,
          frames: this.anims.generateFrameNames("character", {
            prefix: animation.name,
            end: animation.length,
            zeroPad: 2,
          }),
          frameRate: 8,
        });
      });
      //creating animation for all npc sprites
      npcSprites.forEach((animation) => {
        this.anims.create({
          key: animation.name,
          frames: this.anims.generateFrameNames("npc", {
            prefix: animation.name,
            end: animation.length,
            zeroPad: 2,
          }),
          frameRate: 6,
        });
      });
      //creating the animation for all 4 zombies and referencing with the same index
      for (let i = 0; i < zombiesPNG.length; i++) {
        zomSprites.forEach((animation) => {
          this.anims.create({
            key: `${animation.name}${i}`,
            frames: this.anims.generateFrameNames(`zombie${i}`, {
              prefix: animation.name,
              end: animation.length,
              zeroPad: 2,
            }),
            frameRate: 6,
          });
        });
      }
      //array for collision names
      const collisions = [bridge, water, building, fence, pond, shrub];
      zombies.forEach((zombie) => {
        //setting collision between the zombie and all the collision points
        collisions.forEach((collision) => {
          this.physics.add.collider(collision, zombie);
        });
        //setting collision between each zombie
        zombies.forEach((collisionZombie) => {
          if (zombies.indexOf(zombie) !== zombies.indexOf(collisionZombie)) {
            this.physics.add.collider(zombie, collisionZombie);
          }
        });
      });
      //adding collision for the character and npc
      collisions.forEach((collision) => {
        this.physics.add.collider(collision, character);
        let collTemp = this.physics.add.collider(collision, npc);
        npcCollisions.push(collTemp);
      });
      //this.physics.add.collider(npc, character);
      character.setSize(15, 22);
      npc.setSize(15, 22);
      //each number references a sprite from the sprite sheet
      building.setCollision([
        214, 215, 254, 255, 294, 295, 47, 48, 49, 50, 51, 87, 88, 89, 90, 91,
        127, 128, 129, 130, 131, 167, 168, 169, 170, 171, 12, 13, 14, 15, 16,
        52, 53, 54, 55, 56, 92, 93, 94, 95, 96, 132, 133, 134, 135, 136, 172,
        173, 174, 175, 176,
      ]);
      bridge.setCollision([286, 288]);
      fence.setCollision([683, 684, 685, 483, 723, 762, 725, 761, 724]);
      water.setCollision([284]);
      pond.setCollision([284]);
      shrub.setCollision([
        645, 646, 647, 685, 686, 687, 563, 204, 205, 206, 450, 451, 490, 491,
        152, 153, 192, 193, 1175, 406, 522, 523, 524, 561, 562, 563, 564, 601,
        600, 602, 603, 604, 561, 601, 642, 641, 334, 335, 292, 293, 45, 46, 490,
        491, 374, 375, 332, 333, 85, 86, 412, 413, 414, 207, 208, 209, 210, 211,
        481,
      ]);
      //set the bounds of the camera to the size of the map
      this.cameras.main.setBounds(0, 0, 1440, 960);
      this.cameras.main.setZoom(5);
      //camera follows the character
      this.cameras.main.startFollow(character);
      //set it so when the camera moves it doesn't look ganky
      this.cameras.main.roundPixels = true;
      //when each independent zombie hits the npc or character run the function
      zombies.forEach((zombie) => {
        this.physics.add.collider(character, zombie, hitZombie, null, this);
        let temp = this.physics.add.collider(
          npc,
          zombie,
          npcHitZombie,
          null,
          this
        );
        npcCollisions.push(temp);
      });
      zombieKillsText = this.add.text(
        this.cameras.main.scrollX + 580,
        this.cameras.main.scrollY + 385,
        "",
        {
          fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
          fontSize: "16px",
          fill: "#808080",
        }
      );
      startGameText = this.add.text(
        this.cameras.main.scrollX + 620,
        this.cameras.main.scrollY + 455,
        "Press Enter to Start",
        {
          fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
          fontSize: "25px",
          fill: "#D2042D",
        }
      );
      zombies.forEach((zombie) => {
        let positionCreate;
        do {
          positionCreate =
            zombiePositions[Math.floor(Math.random() * zombiePositions.length)];
        } while (
          Math.sqrt(Math.pow(positionCreate.x - character.body.position.x, 2)) <
            250 &&
          Math.sqrt(Math.pow(positionCreate.y - character.body.position.y, 2)) <
            250
        );
        positionCreate.x += Math.ceil(Math.random() * 9);
        positionCreate.y += Math.ceil(Math.random() * 9);
        zombie.setPosition(positionCreate.x, positionCreate.y);
      });
    },
    update() {
      zombieKillsText.setPosition(
        this.cameras.main.scrollX + 580,
        this.cameras.main.scrollY + 385
      );
      zombieKillsText.setText("Zombies Killed: " + zombieKills);
      //if gameover stop the game
      if (!startingGame) {
        zombieKillsText.setText("");
        this.physics.pause();
        this.anims.pauseAll();
      }
      if (startGameKey.isDown && !startingGame) {
        startGameText.destroy();
        this.physics.resume();
        this.anims.resumeAll();
        startingGame = true;
      }

      if (gameOver) {
        if (!gameOverPrinted) {
          zombieKillsText.destroy();
          gameOverText = this.add.text(
            this.cameras.main.scrollX + 642,
            this.cameras.main.scrollY + 440,
            "Game Over",
            {
              fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
              fontSize: "32px",
              fill: "#D2042D",
            }
          );
          resetGameText = this.add.text(
            this.cameras.main.scrollX + 667,
            this.cameras.main.scrollY + 485,
            "Press F to Reset",
            {
              fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
              fontSize: "16px",
              fill: "#D2042D",
            }
          );
          gameOverPrinted = true;
        }
        if (restartKey.isDown) {
          this.physics.resume();
          this.anims.resumeAll();
          this.registry.destroy(); // destroy registry
          this.events.off(); // disable all active events
          this.scene.restart(); // restart current scene
          gameOver = false;
        } else {
          return;
        }
      }
      //set attacking to false every frame to make sure it's accurate
      attacking = false;
      //resizeing the hit box of the character
      character.setSize(15, 22);
      //if the distance between each individual zombie is less than 200 the zombie will track the character
      zombies.forEach((zombie) => {
        let distance = Phaser.Math.Distance.BetweenPoints(character, zombie);
        if (distance < 400) {
          this.physics.moveToObject(
            zombie,
            character,
            /*random number between 10 and 30 rounded to nearest 10 */
            Math.ceil(
              Math.random() * (50 /*max*/ - 10 /*min*/ + 1) + 10 /*min*/
            )
          );
        } else {
          //don't move
          zombie.setVelocity(0, 0);
        }
        //check which velocity is greatest
        if (
          Math.pow(zombie.body.velocity.x, 2) >
          Math.pow(zombie.body.velocity.y, 2)
        ) {
          //if x < 0 the zombie is moving left
          if (zombie.body.velocity.x < 0) {
            zombie.anims.play(
              //reference the same zombie animation as the original as the key includes their number
              `zomWalkLeft${zombie.texture.key.split("zombie")[1]}`,
              true
            );
            //set the last direction of the zombie and stores it in a array to reference
            zombiesLastDirection[zombies.indexOf(zombie)] = "left";
          } else {
            //if x > 0 the zombie is moving right
            zombie.anims.play(
              `zomWalkRight${zombie.texture.key.split("zombie")[1]}`,
              true
            );
            zombiesLastDirection[zombies.indexOf(zombie)] = "right";
          }
        } else if (
          Math.pow(zombie.body.velocity.x, 2) <
          Math.pow(zombie.body.velocity.y, 2)
        ) {
          if (zombie.body.velocity.y < 0) {
            zombie.anims.play(
              `zomWalkUp${zombie.texture.key.split("zombie")[1]}`,
              true
            );
            zombiesLastDirection[zombies.indexOf(zombie)] = "up";
          } else {
            zombie.anims.play(
              `zomWalkDown${zombie.texture.key.split("zombie")[1]}`,
              true
            );
            zombiesLastDirection[zombies.indexOf(zombie)] = "down";
          }
        } else {
          switch (zombiesLastDirection[zombies.indexOf(zombie)]) {
            //if the last direction is a certain direction set them to be the first frame in that direction
            case "up":
              zombie.anims.play(
                `zomWalkUp${zombie.texture.key.split("zombie")[1]}`
              );
              break;
            case "down":
              zombie.anims.play(
                `zomWalkDown${zombie.texture.key.split("zombie")[1]}`
              );
              break;
            case "right":
              zombie.anims.play(
                `zomWalkRight${zombie.texture.key.split("zombie")[1]}`
              );
              break;
            case "left":
              zombie.anims.play(
                `zomWalkLeft${zombie.texture.key.split("zombie")[1]}`
              );
              break;
          }
        }
      });
      let distanceBetweenNPCCharacter = Phaser.Math.Distance.BetweenPoints(
        character,
        npc
      );
      //if the npc gets lost teleport to character
      if (distanceBetweenNPCCharacter > 200) {
        npc.body.position.x = character.body.position.x;
        npc.body.position.y = character.body.position.y;
      }
      //move to character if distance is greater than 25
      if (distanceBetweenNPCCharacter > 25) {
        this.physics.moveToObject(npc, character, 80);
      } else if (distanceBetweenNPCCharacter > 23) {
        //stay still if distance is greater than 23 - stops npc going into character
        npc.setVelocity(0, 0);
      }

      //character attack
      if (spacebar.isDown && startingGame) {
        attacking = true;
        character.setVelocity(0, 0);
        switch (lastKeyPress) {
          case "up":
            character.anims.play("attackUp", true);
            character.setSize(15, 22);

            break;
          case "down":
            character.anims.play("attackDown", true);
            character.setSize(15, 22);
            break;
          case "right":
            character.anims.play("attackRight", true);
            character.setSize(15, 22);
            break;
          case "left":
            character.anims.play("attackLeft", true);
            character.setSize(15, 22);
            break;
        }
      } else if (cursors.left.isDown && startingGame) {
        character.setVelocity(-80, 0);
        character.anims.play("walkLeft", true);
        lastKeyPress = "left";
      } else if (cursors.right.isDown && startingGame) {
        character.setVelocity(80, 0);
        character.anims.play("walkRight", true);
        lastKeyPress = "right";
      } else if (cursors.up.isDown && startingGame) {
        character.anims.play("walkUp", true);
        character.setVelocity(0, -80);
        lastKeyPress = "up";
      } else if (cursors.down.isDown && startingGame) {
        character.anims.play("walkDown", true);
        character.setVelocity(0, 80);
        lastKeyPress = "down";
      } else {
        character.setSize(15, 22);
        character.setVelocity(0, 0);
        switch (lastKeyPress) {
          case "up":
            character.anims.play("walkUp");
            break;
          case "down":
            character.anims.play("walkDown");
            break;
          case "right":
            character.anims.play("walkRight");
            break;
          case "left":
            character.anims.play("walkLeft");
            break;
        }
      }
      if (Math.pow(npc.body.velocity.x, 2) > Math.pow(npc.body.velocity.y, 2)) {
        if (npc.body.velocity.x < 0) {
          npc.anims.play("npcWalkLeft", true);
          npcLastDirection = "left";
        } else {
          npc.anims.play("npcWalkRight", true);
          npcLastDirection = "right";
        }
      } else if (
        Math.pow(npc.body.velocity.x, 2) < Math.pow(npc.body.velocity.y, 2)
      ) {
        if (npc.body.velocity.y < 0) {
          npc.anims.play("npcWalkUp", true);
          npcLastDirection = "up";
        } else {
          npc.anims.play("npcWalkDown", true);
          npcLastDirection = "down";
        }
      } else {
        switch (npcLastDirection) {
          case "up":
            npc.anims.play("npcWalkUp");
            break;
          case "down":
            npc.anims.play("npcWalkDown");
            break;
          case "right":
            npc.anims.play("npcWalkRight");
            break;
          case "left":
            npc.anims.play("npcWalkLeft");
            break;
        }
      }
    },
  },
});
//when a zombie hits a person, end game
function hitZombie(player, zombie) {
  let positionHit;
  do {
    positionHit =
      zombiePositions[Math.floor(Math.random() * zombiePositions.length)];
  } while (
    Math.sqrt(Math.pow(positionHit.x - character.body.position.x, 2)) < 250 &&
    Math.sqrt(Math.pow(positionHit.y - character.body.position.y, 2)) < 250
  );
  //add a random number to the position
  positionHit.x += Math.ceil(Math.random() * 5);
  positionHit.y += Math.ceil(Math.random() * 5);
  if (
    (zombiesLastDirection[zombies.indexOf(zombie)] === "left" &&
      lastKeyPress === "right" &&
      attacking === true) ||
    (zombiesLastDirection[zombies.indexOf(zombie)] === "right" &&
      lastKeyPress === "left" &&
      attacking === true) ||
    (zombiesLastDirection[zombies.indexOf(zombie)] === "up" &&
      lastKeyPress === "down" &&
      attacking === true) ||
    (zombiesLastDirection[zombies.indexOf(zombie)] === "down" &&
      lastKeyPress === "up" &&
      attacking === true)
  ) {
    zombie.body.position.x = positionHit.x;
    zombie.body.position.y = positionHit.y;
    zombieKills++;
  } else {
    this.physics.pause();
    this.anims.pauseAll();

    player.setTintFill(0xffffff);
    player.setAlpha(0.4);
    gameOver = true;
  }
}

function npcHitZombie(npc) {
  npc.setBounce(0);
  npcCollisions.forEach((collision) => {
    collision.active = false;
  });
  npc.setTintFill(0xffffff);
  npc.setAlpha(0.4);
}

// function checkOverlap(spriteA, spriteB) {
//   var boundsA = spriteA.getBounds();
//   var boundsB = spriteB.getBounds();

//   return Phaser.Rectangle.intersects(boundsA, boundsB);
// }
