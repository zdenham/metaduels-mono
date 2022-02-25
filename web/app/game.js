import * as PIXI from "pixi.js";
import { cheapColi } from "./coli.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";
import characterData from "./characters.json";

class Game {
  constructor() {

  ////////////////////////////////////////////////////////////////////setup\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    this.app = new PIXI.Application(1200, 400);
    this.textObj = new TextStyles(this.app.renderer);
    this.utils = new SpriteUtilities(PIXI);
    this.scenes = {
      intro: {},
      select: {},
      game: {},
      gameOver: {},
      youWin: {}
    };

    this.powers = [];
    this.action = [];
    this.gameEffects = [];
    this.power = [];
    this.finishHim = false;

    //Metaduels//
    this.playerNFTCharacter = "scorpion";
    this.opponentNFTCharacter = "scorpion";
    this.playerAddress = "0x12...k6nL";
    this.opponentAddress = "0x71...976F";
    this.playerWagerImage = PIXI.Texture.fromImage('assets/images/placeholder/wager15.png');
    this.opponentWagerImage = PIXI.Texture.fromImage('assets/images/placeholder/wager25.png');

    this.healthIcon = PIXI.Texture.fromImage('assets/images/buttons/heart-full.png');
    this.healthIconEmpty = PIXI.Texture.fromImage('assets/images/buttons/heart-empty.png');
    this.attackIcon = PIXI.Texture.fromImage('assets/images/buttons/attack.png');
    this.shieldIcon = PIXI.Texture.fromImage('assets/images/buttons/shield-full.png');
    this.shieldIconHalf = PIXI.Texture.fromImage('assets/images/buttons/shield-half.jpg');
    this.shieldIconEmpty = PIXI.Texture.fromImage('assets/images/buttons/shield-empty.png');
    this.rechargeIcon = PIXI.Texture.fromImage('assets/images/buttons/recharge.png');
    this.rechargeHover = PIXI.Texture.fromImage('assets/images/buttons/recharge-hover.png');
    this.rechargeSelect = PIXI.Texture.fromImage('assets/images/buttons/recharge-select.png');
    this.shieldHover = PIXI.Texture.fromImage('assets/images/buttons/shield-hover.png');
    this.shieldSelect = PIXI.Texture.fromImage('assets/images/buttons/shield-select.png');
    this.attackHover = PIXI.Texture.fromImage('assets/images/buttons/attack-hover.png');
    this.attackSelect = PIXI.Texture.fromImage('assets/images/buttons/attack-select.png');
    this.confirmButton = PIXI.Texture.fromImage('assets/images/buttons/confirm.png');
    this.buttonsPushed = false;

    this.logo = PIXI.Texture.fromImage('assets/images/placeholder/metaduels-logo.png');
    this.round = 1;

    this.didAttack = false;
    this.didRecharge = false;
    this.didShield = false;
    this.ammo = 1;
    this.health = 2;
    this.shields = 1;
    //Metaduels//

    this.initScenes();

    this.backgrounds = {};

    this.keys = {};

    this.gravity = 1.3;
    this.groundY = 155;

    this.attachEvents();

    this.sound = null;

    // create some textures from an image path
    this.textureButton = PIXI.Texture.fromImage('assets/images/buttons/button.png');
    this.textureButtonDown = PIXI.Texture.fromImage('assets/images/buttons/button-chosen.png');
    this.textureButtonOver = PIXI.Texture.fromImage('assets/images/buttons/button-highlight.png');

    this.buttons = [];

    this.buttonPositions = [
        100, 340,
        160, 340,
        220, 340,
        1100, 340,
        1040, 340,
        980, 340,
        400, 340,
        800, 340
    ];

    var noop = function () {
	    console.log('click');
    };

    PIXI.loader
      .add([
        "assets/images/powers/yelo.json",
        "assets/images/powers/fire.json",
        "assets/images/powers/death.json",
        "assets/images/characters/scorpion.json",
        "assets/images/characters/claudia.json",
        "assets/images/characters/pao.json",
        "assets/images/characters/aram.json",
        "assets/images/backgrounds/fight.json",
        "assets/images/backgrounds/intro.png",
        "assets/images/backgrounds/win.jpg",
        "assets/images/characters/aram.jpg",
        "assets/images/characters/scorpion.jpg",
        "assets/images/characters/claudia.png",
        "assets/images/characters/pao.png",
        "assets/images/characters/claudia-portrait.png",
        "assets/images/characters/pao-portrait.png",
        "assets/images/backgrounds/combat.jpg",
        "assets/images/backgrounds/mddojobg.jpg",
        "assets/sounds/fight.mp3",
        "assets/sounds/hitsounds/mk3-00100.mp3",
        "assets/sounds/hitsounds/mk3-00105.mp3",
        "assets/sounds/hitsounds/mk3-00155.mp3",
        "assets/sounds/hitsounds/mk3-00165.mp3",
        "assets/sounds/hitsounds/mk3-00170.mp3",
        "assets/sounds/male/mk3-03000.mp3",
        "assets/sounds/short/mk3-00054.mp3",
        "assets/sounds/short/mk3-00053.mp3",
        "assets/sounds/vsmusic.mp3",
        "assets/sounds/fightScream.mp3",
        "assets/sounds/hitscream.mp3",
        "assets/sounds/finish.mp3",
        "assets/sounds/scream.mp3",
        "assets/audio/Carson/carson-failedattack.mp3",
        "assets/audio/Carson/carson-lostlife.mp3",
        "assets/audio/Carson/carson-reload.mp3",
        "assets/audio/Carson/carson-successattack.mp3",
        "assets/audio/Carson/carson-successattackwoosh.mp3",
        "assets/audio/Man Ape/manape-failedattack.mp3",
        "assets/audio/Man Ape/manape-lostlife.mp3",
        "assets/audio/Man Ape/manape-recharge.mp3",
        "assets/audio/Man Ape/manape-successattack.mp3",
        "assets/audio/Man Ape/manape-successattackwoosh.mp3",
        "assets/audio/Misc/attackfusion.mp3",
        "assets/audio/Misc/bodyhitground.mp3",
        "assets/audio/Misc/buttonclick.mp3",
        "assets/audio/Misc/buttonhover.mp3",
        "assets/audio/Misc/deathbirdschirp.mp3",
        "assets/audio/Misc/duelsbg.mp3",
        "assets/audio/Misc/lostlife.mp3"    
      ])
      .load(() => {
        this.initGame();
      });
    document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  initScenes() {
    for (let scene in this.scenes) {
      this.scenes[scene] = new PIXI.Container();
      this.scenes[scene].alpha = 0;
      this.app.stage.addChild(this.scenes[scene]);
    }
  }

  setActiveScene(sceneName) {
    for (let scene in this.scenes) {
      this.scenes[scene].visible = false;
      if (scene === sceneName) {
        this.scenes[scene].visible = true;
      }
    }
  }

  playSound(event, options = { loop: false, bg: false }) {
    let soundPath = "";
    switch (event) {
      case "jump":
        soundPath = "assets/sounds/hitsounds/mk3-00155.mp3";
        break;
      case "kick":
        soundPath = "assets/sounds/hitsounds/mk3-00100.mp3";
        break;
      case "punch":
        soundPath = "assets/sounds/hitsounds/mk3-00105.mp3";
        break;
      case "hit":
        soundPath = "assets/sounds/male/mk3-03000.mp3";
        break;
      case "nopunch":
        soundPath = "assets/sounds/hitsounds/mk3-00165.mp3";
        break;
      case "nokick":
        soundPath = "assets/sounds/hitsounds/mk3-00170.mp3";
        break;
      case "intro":
        soundPath = "assets/sounds/short/mk3-00054.mp3";
        break;
      case "vs":
        soundPath = "assets/sounds/short/mk3-00053.mp3";
        break;
      case "fight":
        soundPath = "assets/sounds/fight.mp3";
        break;
      case "vsmusic":
        soundPath = "assets/sounds/vsmusic.mp3";
        break;
      case "fightScream":
        soundPath = "assets/sounds/fightScream.mp3";
        break;
      case "scream":
        soundPath = "assets/sounds/scream.mp3";
        break;
      case "hitscream":
        soundPath = "assets/sounds/hitscream.mp3";
        break;
      case "gameover":
        soundPath = "assets/sounds/yousuck.mp3";
        break;
      case "welldone":
        soundPath = "assets/sounds/welldone.mp3";
        break;
      case "finish":
        soundPath = "assets/sounds/finish.mp3";
        break;
      case "button-click":
        soundPath = "assets/audio/Misc/buttonclick.mp3";
        break;
      case "button-hover":
        soundPath = "assets/audio/Misc/buttonclick.mp3";
        break;
      default:
        break;
    }

    if (options.bg) {
      this.bgSound = new Howl({
        src: [soundPath],
        loop: options.loop
      });
      this.bgSound.play();
    } else {
      this.sound = new Howl({
        src: [soundPath],
        loop: options.loop
      });
      this.sound.play();
    }
  }

  stopSound() {
    if (this.sound) {
      this.sound.stop();
    }
  }

  stopBgSound() {
    this.bgSound.stop();
  }

  loadBackgrounds() {
    this.backgrounds.intro = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/mddojobg.jpg"].texture
    );
    this.setBGScale(this.backgrounds.intro);
    this.scenes.intro.addChild(this.backgrounds.intro);

    this.backgrounds.select = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/mddojobg.jpg"].texture
    );
    this.setBGScale(this.backgrounds.select);
    this.scenes.select.addChild(this.backgrounds.select);

    this.backgrounds.battle = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/mddojobg.jpg"].texture
    );
    this.setBGScale(this.backgrounds.battle);
    this.scenes.game.addChild(this.backgrounds.battle);

    this.backgrounds.win = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/mddojobg.jpg"].texture
    );
    this.setBGScale(this.backgrounds.win);
    this.scenes.youWin.addChild(this.backgrounds.win);
  }


  ////////////////////////////////////////////////game\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

  // Set intro Container, first scene
  initGame() {
    this.loadBackgrounds();
    this.chooseMoveScene();
    this.gameLoop();
  }

  gameLoop() {   // This is all you Zaccy. Unless you need help then hmu
    this.app.ticker.add(() => {
      if (!this.scenes.game.visible) return;

      this.characters.forEach((character, index) => {
        let collision;
        const opponent = index === 0 ? this.characters[1] : this.characters[0];

        switch (this.action[index]) {
          case "attack":
            if (character.actions.punch) {
              character.actions.punch.visible = true;
              console.log("attack did");

              //choose attack button
              this.didAttack = true;
              this.didRecharge = false;
              this.didShield = false;

              //play sounds and animations
              this.playSound("hit");
              this.loseHealthAnimation(this.healthIcon);

              //enable confirm button

            }
            break;

          case "recharge":
            if (character.actions.stance) {
              character.actions.stance.visible = true;
              console.log("recharge");

              //choose attack button
              this.didAttack = true;
              this.didRecharge = false;
              this.didShield = false;

              //enable confirm button

              //play sounds and animations
              this.playSound("kick");
            }
            break;

          case "shield":
            if (character.actions.duck) {
              character.actions.duck.visible = true;
              console.log("shield did");

              //choose attack button
              this.didAttack = true;
              this.didRecharge = false;
              this.didShield = false;

              //enable confirm button

              //play sounds and animations
              this.playSound("kick");
            }
            break;

          case "confirm":
            if (character.actions.stance) {
              character.actions.staticjump.visible = true;
              console.log("confirm");
              this.youWin();
              //turn off other buttons
              //check if opponent has confirmed
              //if yes, calculate results
              //if no, wait
            }
            break;

            default:
              character.actions.stance.visible = true;
      }
      });
     });
    }

  finish(side) {
    var winner = side === "left" ? 1 : 0;
    this.playSound("finish");
    this.finishHim = true;
    let finishHimText = this.textObj.finishText("FINISH HIM!", "center", 100);
    this.scenes.game.addChild(finishHimText);
    this.characters.forEach((character, index) => {
      if (winner !== index) {
        character.isDeath = true;
        this.action[index] = "stance";
        character.vx = 0;
      }
    });
  }

  introScreen() {
    this.setActiveScene("intro");
    this.playSound("intro");

    let startText = this.textObj.customText(
      "Press Enter to start",
      "center",
      280
    );

    let titleText = this.textObj.finishText("METADUELS", "center", 120, 140);

    var mlogo = new PIXI.Sprite(this.logo);

    this.scenes.intro.addChild(mlogo);
    this.scenes.intro.addChild(startText);
    this.scenes.intro.addChild(titleText);

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.intro.alpha += 0.05;
    };
    animate();
  }

  chooseMoveScene() {
    console.log("choose move scene started");
    this.characters = [];

    this.setActiveScene("select");
    this.stopSound();
    this.playSound("fight", { loop: true, bg: true });
    let introPrompt = this.textObj.customText(
    "choose your move", 532,200);
    this.scenes.select.addChild(introPrompt);

    /*
    * intialize player in both scenes
    */

    //setup characters
    this.setupCharacters(this.opponentNFTCharacter);
    this.setupCharacters(this.playerNFTCharacter, true);

    /*
    * set buttons to each do their own ability, then confirm based on both player inputs
    */

    //setup buttons
    for (var i = 0; i < 8; i++)
      {
      if(i == 0 || i == 3) {
        var button = new PIXI.Sprite(this.attackIcon);
        //set attack actions
        //button.on('mousedown', )
      }
      else if(i == 1 || i == 4) {
        var button = new PIXI.Sprite(this.shieldIcon);
        //set shield actions
      }
      else if(i == 2 || i == 5) {
        var button = new PIXI.Sprite(this.rechargeIcon);
        //set recharge actions
      }
      else {
      var button = new PIXI.Sprite(this.confirmButton);
      //set confirm action
      }
      //GET BUTTON FUNCTIONS TO STOP CALLING THEMSELVES
      button.buttonMode = true;
      button.anchor.set(0.5);
      button.position.x = this.buttonPositions[i*2];
      button.position.y = this.buttonPositions[i*2 + 1];
      button.interactive = true;
      button
      .on('mousedown', this.onButtonDown(this))
      .on('mouseup', this.onButtonUp(this))
      .on('touchend', this.onButtonOut(this))
      .on('mouseupoutside', this.onButtonOut(this))
      .on('touchendoutside', this.onButtonOut(this))
      .on('mouseover', this.onButtonOver(this))
	    button.tap = this.noop;
	    button.click = this.noop;

      this.scenes.select.addChild(button);

      this.buttons.push(button);
      }


    /*
    * define player and opponent values based on start and gameplay
    */

    //define player One UI
    let name1 = this.textObj.customText(
    this.playerAddress, 60,20);
    var wagerImage = new PIXI.Sprite(this.playerWagerImage);
    wagerImage.position.x = 60;
    wagerImage.position.y = 50;
    var health1 = new PIXI.Sprite(this.healthIcon);
    health1.position.x = 190;
    health1.position.y = 50;
    var health2 = new PIXI.Sprite(this.healthIcon);
    health2.position.x = 240;
    health2.position.y = 50;
    var shield = new PIXI.Sprite(this.shieldIcon);
    shield.position.x = 300;
    shield.position.y = 50;
    this.scenes.select.addChild(name1);
    this.scenes.select.addChild(health1);
    this.scenes.select.addChild(health2);
    this.scenes.select.addChild(shield);
    this.scenes.select.addChild(wagerImage);

    //define player 2 UI 
    let name2 = this.textObj.customText(
    this.opponentAddress, 1060,20);
    var wagerImage2 = new PIXI.Sprite(this.opponentWagerImage);
    wagerImage2.position.x = 1020;
    wagerImage2.position.y = 50;
    var health3 = new PIXI.Sprite(this.healthIcon);
    health3.position.x = 960;
    health3.position.y = 50;
    var health4 = new PIXI.Sprite(this.healthIcon);
    health4.position.x = 900;
    health4.position.y = 50;
    var shield2 = new PIXI.Sprite(this.shieldIcon);
    shield2.position.x = 840;
    shield2.position.y = 50;
    this.scenes.select.addChild(name2);
    this.scenes.select.addChild(health3);
    this.scenes.select.addChild(health4);
    this.scenes.select.addChild(shield2);
    this.scenes.select.addChild(wagerImage2);

    this.round++;
    this.buttonsPushed = true;
    //this.battleScene();

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.select.alpha += 0.05;
    };
    animate();
  }

  battleScene() {
    console.log("battle scene started");

    /*
    * on battle start import player's moves from choose scene
    * loop back to choose scene or win scene once a winner is determined
    */

    this.stopSound();
    this.playSound("vs");

    this.setActiveScene("game");
    this.stopSound();
    this.playSound("fight", { loop: true, bg: true });

    let roundText = this.textObj.customText(
    ("ROUND " + this.round), 560,20);
    this.scenes.game.addChild(roundText);

    //define player One UI
    let name1 = this.textObj.customText(
    this.playerAddress, 60,20);
    var wagerImage = new PIXI.Sprite(this.playerWagerImage);
    wagerImage.position.x = 60;
    wagerImage.position.y = 50;
    var health1 = new PIXI.Sprite(this.healthIcon);
    health1.position.x = 190;
    health1.position.y = 50;
    var health2 = new PIXI.Sprite(this.healthIcon);
    health2.position.x = 240;
    health2.position.y = 50;
    var shield = new PIXI.Sprite(this.shieldIcon);
    shield.position.x = 300;
    shield.position.y = 50;
    this.scenes.game.addChild(name1);
    this.scenes.game.addChild(health1);
    this.scenes.game.addChild(health2);
    this.scenes.game.addChild(shield);
    this.scenes.game.addChild(wagerImage);

    //define player 2 UI 
    let name2 = this.textObj.customText(
    this.opponentAddress, 1060,20);
    var wagerImage2 = new PIXI.Sprite(this.opponentWagerImage);
    wagerImage2.position.x = 1020;
    wagerImage2.position.y = 50;
    var health3 = new PIXI.Sprite(this.healthIcon);
    health3.position.x = 960;
    health3.position.y = 50;
    var health4 = new PIXI.Sprite(this.healthIcon);
    health4.position.x = 900;
    health4.position.y = 50;
    var shield2 = new PIXI.Sprite(this.shieldIcon);
    shield2.position.x = 840;
    shield2.position.y = 50;
    this.scenes.game.addChild(name2);
    this.scenes.game.addChild(health3);
    this.scenes.game.addChild(health4);
    this.scenes.game.addChild(shield2);
    this.scenes.game.addChild(wagerImage2);

    //do intro animation
    const fightAnim = this.createAnimation("fight", 44);
    fightAnim.loop = false;
    fightAnim.visible = false;
    fightAnim.animationSpeed = 0.42;
    fightAnim.scale.x = 2;
    fightAnim.scale.y = 2;
    fightAnim.x = (1200 - fightAnim.width) / 2 + 16;
    fightAnim.y = (400 - fightAnim.height) / 3;

    setTimeout(() => {
      fightAnim.visible = true;
      fightAnim.play();
      this.playSound("fightScream");
    }, 1000);
    this.scenes.game.addChild(fightAnim);
    

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.game.alpha += 0.05;
    };
    animate();
  }

  youWin(winner) {
    this.setActiveScene("youWin");

    let title = this.textObj.customText("Someone Won!", "center", 200);
    let titleContinue = this.textObj.customText(
      "Press Enter to Restart",
      "center",
      480
    );

    this.scenes.youWin.addChild(title);
    this.scenes.youWin.addChild(titleContinue);
    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.youWin.alpha += 0.05;
    };
    animate();

    this.stopBgSound();
    this.playSound("welldone");
  }

  gameOver() {
    this.setActiveScene("gameOver");
    this.stopSound();
    let title = this.textObj.customText("GAME OVER", "center", 200);
    let titleContinue = this.textObj.customText(
      "Press Enter to Restart",
      "center",
      250
    );

    this.scenes.gameOver.addChild(title);
    this.scenes.gameOver.addChild(titleContinue);
    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.gameOver.alpha += 0.05;
    };
    animate();
  }

  ///////////////////////////////////////////////////////////////more setup\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

  onButtonDown(parent)
  {
  console.log(parent.buttonsPushed);
  if(parent.buttonsPushed == true) {
    this.isdown = true;
    this.texture = PIXI.Texture.fromImage('assets/images/buttons/attack-select.png');
    this.alpha = 1;
    console.log("button is down");

    parent.playSound("button-click");

    //console.log(this.parent);
    //this.setActiveScene("gameOver");
    parent.battleScene();

    //if(this.button.)
    }
  }

  
  onButtonUp(parent)
  {
    this.isdown = false;
    if (this.isOver)
    {
        this.texture = PIXI.Texture.fromImage('assets/images/buttons/attack-hover.png');
    }
    else
    {
        this.texture = PIXI.Texture.fromImage('assets/images/buttons/attack.png');
    }  
  }

  onButtonOver(parent)
  {
    this.isOver = true;
    if (this.isdown)
    {
        return;
    }
    this.texture = PIXI.Texture.fromImage('assets/images/buttons/attack-hover.png');
    parent.playSound("button-hover");

  }

  onButtonOut(parent)
  {
    this.isOver = false;
    if (this.isdown)
    {
        return;
    }
    this.texture = PIXI.Texture.fromImage('assets/images/buttons/attack.png'); 
  }

  groupSprites(container, options) {
    for (let i = 0; i < options.length; i++) {
      container.addChild(options[i]);
    }
  }

  setBGScale(sprite) {
    const winAspectRatio = 1200 / 400;
    const bgAspectRatio = sprite.texture.width / sprite.texture.height;
    let ratio;

    if (winAspectRatio > bgAspectRatio) {
      ratio = 1200 / sprite.texture.width;
    } else {
      ratio = 400 / sprite.texture.height;
    }

    sprite.scale.x = ratio;
    sprite.scale.y = ratio;

    sprite.x = (1200 - sprite.width) / 2;
    sprite.y = (400 - sprite.height) / 2;
  }

  attachEvents() {
    window.addEventListener("keydown", e => {
      if (this.scenes.intro.visible) {
        if (e.key === "Enter") {
          this.chooseScreen();
        }
      }

      if (this.scenes.gameOver.visible) {
        if (e.key === "Enter") {
          this.introScreen();
        }
      }

      if (this.scenes.youWin.visible) {
        if (e.key === "Enter") {
          window.location.reload(false);
        }
      }
    });
  }

  createAnimation(id, numberFrames, reverse = false) {
    let frames = [];

    if (!reverse) {
      for (let i = 1; i <= numberFrames; i++) {
        frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
      }
    } else {
      for (let i = numberFrames; i > 0; i--) {
        frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
      }
    }

    const anim = new PIXI.extras.AnimatedSprite(frames);

    return anim;
  }

  setupKeys(character, opponent) {
    //Metaduels//
    this.keys.attack = this.keys.attack || [];
    this.keys.recharge = this.keys.recharge || [];
    this.keys.shield = this.keys.shield || [];
    this.keys.confirm = this.keys.confirm || [];

    let player = opponent ? 1 : 0;

    if (opponent) {
      this.keys.attack[player] = Keyboard(56); // 8
      this.keys.recharge[player] = Keyboard(57); // 9
      this.keys.shield[player] = Keyboard(48); // 0
      this.keys.confirm[player] = Keyboard(13); // Enter
    } else {
      this.keys.attack[player] = Keyboard(49); // 1
      this.keys.recharge[player] = Keyboard(50); // 2
      this.keys.shield[player] = Keyboard(51); // 3
      this.keys.confirm[player] = Keyboard(9); // TAB
    }

    this.keys.attack[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.punch) {
            this.action[player] = "attack";
        }
      }
    };

    this.keys.recharge[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.stance) {
            this.action[player] = "recharge";
        }
      }
    };

    this.keys.shield[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.duck) {
            this.action[player] = "shield";
        }
      }
    };

    this.keys.confirm[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.stance) {
            this.action[player] = "confirm";
        }
      }
    };
    //Metaduels//
  }

  setupPowers(opponent) {
    const player = opponent ? 0 : 1;

    this.powers[player] = {};

    this.powers[player].yelo = this.createAnimation("yelo-moving", 1);
    this.powers[player].yelo.visible = false;
    this.powers[player].yelo.x = 0;
    this.powers[player].yelo.vx = 15;
    if (player === 1) {
      this.powers[player].yelo.vx = -15;
    }

    this.scenes.game.addChild(this.powers[player].yelo);
  }

  setupFatality(opponent) {
    const player = opponent ? 0 : 1;

    this.powers[player].fire = this.createAnimation("fire0", 7);
    this.powers[player].fire.loop = true;
    this.powers[player].fire.animationSpeed = 0.25;
    this.powers[player].fire.visible = false;
    this.powers[player].fire.x = 0;
    this.powers[player].fire.vx = 15;
    if (player === 1) {
      this.powers[player].fire.vx = -15;
    }

    this.scenes.game.addChild(this.powers[player].fire);
  }

  setupScreenLines() {
    this.gameEffects[0] = this.createAnimation("Action Lines 100.png", 12);
    this.gameEffects[0].loop = true;
    this.gameEffects[0].animationSpeed = 0.25;
    this.gameEffects[0].visible = false;
    this.gameEffects[0].x = 0;
    this.gameEffects[0].vx = 15;

    this.scenes.game.addChild(this.gameEffects[0]);
  }

  setupCharacters(selectedPlayer, opponent) {
  console.log("setting up a player started " + selectedPlayer);
    const player = opponent ? 1 : 0;

    characterData.characters.forEach(data => {
      if (data.name === selectedPlayer) {
        if (data.active) {
        console.log("data name: " + data.name);
          const character = new PIXI.Container();
          const animations = [];
          const actions = {};

          character.x = opponent ? 800 : 400;
          character.y = this.groundY;
          character.scale.x = opponent ? -data.scale : data.scale;
          character.scale.y = data.scale;

          data.animations.forEach(animation => {
            const sprite = this.createAnimation(
              `${data.name}-${animation.name}`,
              animation.frames
            );
            sprite.name = animation.name;
            sprite.animationSpeed = animation.animationSpeed;
            sprite.anchor.set(0.5, 0);

            if (animation.loop === true) {
              sprite.play();
            } else {
              sprite.loop = false;
            }

            if (animation.loop === "one") {
              sprite.play(1);
            }

            if (!animation.visible) {
              sprite.visible = false;
            }

            animations.push(sprite);
            actions[animation.name] = sprite;
          });

          this.groupSprites(character, animations);

          character.actions = actions;
          character.animations = animations;
          character.opponent = data.opponent;
          character.active = data.active;
          character.isDeath = false;

          this.characters.push(character);

          this.setupKeys(character, opponent);
        }
      }
    });

    this.characters.forEach(character => {
      if (character.active) {
        this.scenes.game.addChild(character);
        //this.scenes.select.addChild(character);
        console.log(character);
      }
    });

    this.action[player] = "stance";
  }

  loseHealthAnimation(heart) {
  heart.visible = false;
  //time = deltaTime;
  }

  shakeScreen() {
    this.utils.shake(this.scenes.game, 0.01, true);
  }


}

export default Game;
