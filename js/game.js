var targets, 
    mustJump, 
    isMovingLeft, 
    isMovingRight, 
    target, 
    enemy,
    bg, 
    platforms,
    scoreText, 
    levelText, 
    messageText,
    music,
    hero,
    enemyHitPlatform,
    heroHitPlatform;

var levelsCount = 10;
var targetsCount = level + 3;
var level = 1; // начальный уровень (потом будем запонимать где юзер остановится)
var score = 0; // количество очков (потом будем запонимать где .зер остановится)
var goingRight = 0;
var goingLeft = 0;
var action = 0;
var heroSpeed = 300;
var heroJumpSpeed = 500;
var enemySmell = 450;
var enemySpeed = 270 + level * 10;
var enemyJumpSpeed = 520;
var enemyActive = 1;
var canJump = 0;
			
var game = new Phaser.Game(1440, 720, Phaser.AUTO, '', {    
	init: function(){
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
	},
	preload: function(){
		game.load.audio('menuSample', 'assets/menuSample.mp3');
		game.load.audio('gameSample', 'assets/gameSample.mp3');
	
		game.load.image('target', 'assets/target.png');
		game.load.spritesheet('enemy', 'assets/enemy.png', 64, 81);
		game.load.spritesheet('hero', 'assets/hero.png', 50, 81);
		game.load.image('platform', 'assets/platform.png');
		game.load.image('title', 'assets/title.png');
		game.load.image('arrowButton', 'assets/arrowButton.png');
	
		// загружаем фоны
		for (i = level; i <= levelsCount; i++) {
			game.load.image('bg' + i, 'assets/level' + i + '.jpg');
		}
	},
	create: function(){
		
		if(game.world.width < game.world.height) console.log(1);
	
		music = game.add.audio('menuSample');
		music.loopFull();
	
		// включаем Arcade Physics system для игры
		game.physics.startSystem(Phaser.Physics.ARCADE);
	
		bg = game.add.sprite(0, 0, 'bg1');
		
		//добавляем фоны уровня
		startBg = game.add.sprite(game.world.centerX, game.world.centerY, 'title');
		startBg.anchor.setTo(0.5, 0.5);
	
		// добавляем текстовые блоки для вывода информации
		scoreText = game.add.text(15, 15, '', {
			fontSize: '32px',
			fill: '#fff'
		});
	
		levelText = game.add.text(game.world.centerX, 15, '', {
			fontSize: '32px',
			fill: '#fff'
		});
		levelText.anchor.setTo(0.5, 0);
	
		messageText = game.add.text(game.world.centerX, game.world.centerY + 250, 'Tap here to start!!!', {
			fontSize: '50px',
			fill: '#fff',
			stroke: '#000000',
			strokeThickness: 8
		});
		messageText.anchor.setTo(0.5, 0.5);
		messageText.inputEnabled = true;
		messageText.events.onInputDown.add(startGame, this);
		
		cons = game.add.text(10, game.world.height - 50, '', {
			fontSize: '50px',
			fill: '#fff',
			stroke: '#000000',
			strokeThickness: 8
		});
	},
	update: function(){
		cursors = game.input.keyboard.createCursorKeys();
		if (action) {
			game.physics.arcade.collide(targets, platforms);
			game.physics.arcade.collide(targets, flor);
			
			heroHitPlatform = game.physics.arcade.collide(hero, platforms);
			heroHitFlor = game.physics.arcade.collide(hero, flor);
				
			enemyHitPlatform = game.physics.arcade.collide(enemy, platforms);
			enemyHitFlor = game.physics.arcade.collide(enemy, flor);
			
			game.physics.arcade.overlap(hero, targets, collectTarget, null, this);
			game.physics.arcade.overlap(hero, enemy, die, null, this);
		
			hero.body.velocity.x = 0;
			if (cursors.left.isDown || isMovingLeft) {
				goingRight = 0;
				//  Move to the left
				
				hero.body.velocity.x = -heroSpeed;
					
				if( (heroHitPlatform || heroHitFlor) ){
					hero.animations.play('left');
				}else{
					hero.frame = 5;
				}
			} else if (cursors.right.isDown || isMovingRight) {
				goingRight = 1;
				//  Move to the right
				
				hero.body.velocity.x = heroSpeed;
				
				if( (heroHitPlatform || heroHitFlor) ){
					hero.animations.play('right');
				}else{
					hero.frame = 10;
				}
			} else {
				hero.animations.stop();
				if (goingRight) hero.frame = 8;
				else hero.frame = 7;
			}
			
			if (  (cursors.up.isDown && hero.body.touching.down && (heroHitPlatform || heroHitFlor))
			|| (mustJump && hero.body.touching.down && (heroHitPlatform || heroHitFlor)) ) {
				hero.animations.stop();
				hero.body.velocity.y = -heroJumpSpeed;
				if (goingRight) hero.frame = 10;
				else hero.frame = 5;
			}
	
			// enemy fill hero and change direction
			if (enemyActive) {
				if (enemy.position.x > hero.position.x + enemySmell) {
					direction = 2;
				} else if (enemy.position.x < hero.position.x - enemySmell) {
					direction = 1;
				}
			}
	
			// разрешаем прыжек
			if (hero.body.y <= enemy.body.y) canJump = 1;
	
			// если враг на полу
			if (enemyHitPlatform) {
				if (hero.body.y == enemy.body.y) {
					for (i = 0; i < platforms.length; i++) { // пробегаем по всем существующим платформам
						var thePlatform = platforms.getAt(i);
						if ((thePlatform.body.y > enemy.position.y - 200) && (thePlatform.body.y < enemy.position.y)) 
						// если платформа не выше 200px от врага
							if ((thePlatform.body.x < enemy.body.x) && (thePlatform.body.x + thePlatform.body.width > enemy.body.x)) 
								// не прыгаем пока мы под платформой
								canJump = 1;
					}
				}
			} else {
				for (i = 0; i < platforms.length; i++) { // пробегаем по всем существующим платформам
					var thePlatform = platforms.getAt(i);
					if ((thePlatform.body.y > enemy.position.y - 200) && (thePlatform.body.y < enemy.position.y)) 
						// если платформа не выше 200px от врага
						if ((thePlatform.body.x < enemy.body.x) && (thePlatform.body.x + thePlatform.body.width > enemy.body.x)) 
							// не прыгаем пока мы под платформой
							canJump = 0;
				}
			}
	
			if (enemyHitFlor && heroHitFlor) canJump = 0;
	
			if ((canJump == 1) && enemy.body.touching.down) {
				canJump = 0;
				enemy.body.velocity.y = -enemyJumpSpeed;
			}
	
			// walls change direction
			if (enemy.position.x >= game.world.width - enemy.width) {
				direction = 2;
			} else if (enemy.position.x <= 0) {
				direction = 1;
			}
			// move enemy
			if (direction == 1) {
				enemy.body.velocity.x = enemySpeed;
				if(enemyHitPlatform || enemyHitFlor){
					enemy.animations.play('right');
				}else{
					enemy.animations.stop();
					enemy.frame = 10;
				}
			} else if (direction == 2) {
				enemy.body.velocity.x = 0 - enemySpeed;
				if(enemyHitPlatform || enemyHitFlor){
					enemy.animations.play('left');
				}else{
					enemy.animations.stop();
					enemy.frame = 5;
				}
			}
		} 
	}
});


function startLevel() {
	// сбрасываем очки
	score = 0;
	targetsCount = level + 3;
	//enemyActive = 0;

	scoreText.text = 'Points: ' + score + '/' + targetsCount;
	levelText.text = 'Level: ' + level;

	//добавляем фон уровня
	bg.loadTexture('bg' + level);
	
	addPlatforms();

	addHero();
	addEnemy();

	//go action
	action = 1;
}

function addPlatforms() {
	// добавляем мир уровня
	platforms = game.add.group();
	platforms.enableBody = true;

	flor = game.add.group();
	flor.enableBody = true;

	//пол
	var florr = flor.create(0, game.world.height - 5, 'platform');
	florr.scale.setTo(10, 1);
	florr.body.immovable = true;

	//платформы
	horCount = 10;
	vertCount = 3;
	miss = level;
	for (var y = 1; y < vertCount + 1; y++) {
		for (var x = 0; x < horCount - 1; x++) {
			miss++;
			if (miss % 2) {
				var levelPlatform = platforms.create(x * 207 + 1, game.world.height - y * 250, 'platform');
				levelPlatform.body.immovable = true;
			}
		}
	}
}

function addTarget() {
	// добавляем звезду	
	targets = game.add.group();
	targets.enableBody = true;
	target = targets.create(enemy.position.x, enemy.position.y, 'target');
	// устанавливаем гравитацию для звезд
	target.body.gravity.y = 560;
	//рандомное подпрыгивание звезд при падении
	target.body.bounce.y = 0.5;
}

function addHero() {
	//Добавляем героя
	hero = game.add.sprite(game.world.centerX, game.world.height - 150, 'hero');
	game.physics.arcade.enable(hero);
	hero.body.bounce.y = 0.1;
	hero.body.gravity.y = 400;
	hero.body.collideWorldBounds = true;
	//  Our two animations, walking left and right.
	hero.animations.add('left', [0, 1, 2, 3, 4, 5, 6], 20, true);
	hero.animations.add('right', [9, 10, 11, 12, 13, 14, 15], 20, true);
}

function addEnemy() {
	enemys = game.add.group();

	direction = Math.round(1 - 0.5 + Math.random() * (2 - 1 + 1));

	if (direction == 1)
		x = hero.position.x - 500;
	else
		x = hero.position.x + 500;

	enemy = enemys.create(x, 100, 'enemy');

	game.physics.arcade.enable(enemy);
	enemy.body.bounce.y = 0.1;
	enemy.body.gravity.y = 500;
	enemy.body.collideWorldBounds = true;
	//  Our two animations, walking left and right.
	enemy.animations.add('left', [0, 1, 2, 3, 4, 5, 6], 25, true);
	enemy.animations.add('right', [9, 10, 11, 12, 13, 14, 15], 25, true);

	if (direction == 1)
		enemy.frame = 3;
	else
		enemy.frame = 0;

	addTarget();
}

function collectTarget(hero, target) {
	// Remove target
	target.kill();

	//  Add and update the score
	score++;
	scoreText.text = 'Points: ' + score + '/' + targetsCount;

	enemyActive = 1;

	if (score == targetsCount) {
		if (level < levelsCount) {
			stopLevel();

			level++;
			levelText.text = 'Level: ' + level;

			startLevel();
		} else {
			stopLevel();
			action = 0;
			startBg.visible = true;
			messageText.text = 'YOU WON!!! Tap here to start!!!';
		}
	} else
		addTarget();
}

function die() {
	music.stop();
	music = game.add.audio('menuSample');
	music.loopFull();
	stopLevel();
	action = 0;
	startBg.visible = true;
	messageText.text = 'Game over... Tap here to start!!!';

	game.leftArrow.kill();
	game.rightArrow.kill();
	game.actionButton.kill();
}

function stopLevel() {
	enemy.kill();
	// Remove all
	platforms.callAll('kill');
	targets.callAll('kill');
	hero.kill();
}


function startGame(){
	startBg.visible = false;
	messageText.text = '';

	music.stop();
	music = game.add.audio('gameSample');
	music.loopFull();

	createOnscreenControls();

	startLevel();
}

function createOnscreenControls() {
	game.leftArrow = game.add.button(50, game.world.height - 150, 'arrowButton');
	game.rightArrow = game.add.button(450, game.world.height - 150, 'arrowButton');
	game.actionButton = game.add.button(game.world.width - 100, game.world.height - 150, 'arrowButton');
	
	game.leftArrow.alpha = 0.5;
	game.rightArrow.alpha = 0.5;
	game.actionButton.alpha = 0.5;

	game.rightArrow.scale.setTo(-1, 1);
	
	game.leftArrow.angle = 20;
	game.rightArrow.angle = -10;
	game.actionButton.angle = 90;
	
	game.leftArrow.fixedToCamera = true;
	game.rightArrow.fixedToCamera = true;
	game.actionButton.fixedToCamera = true;

	game.actionButton.events.onInputDown.add(function () {
		mustJump = true;
	}, this);

	game.actionButton.events.onInputUp.add(function () {
		mustJump = false;
	}, this);

	//left
	game.leftArrow.events.onInputDown.add(function () {
		isMovingLeft = true;
	}, this);

	game.leftArrow.events.onInputUp.add(function () {
		isMovingLeft = false;
	}, this);

	//right
	game.rightArrow.events.onInputDown.add(function () {
		isMovingRight = true;
	}, this);

	game.rightArrow.events.onInputUp.add(function () {
		isMovingRight = false;
	}, this);
}