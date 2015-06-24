(function(){
	var $scoreContainer = $("#scoreContainer");
	$boardEasy = $("#boardEasy");
	$boardNormal = $("#boardNormal");
	$boardAdvanced = $("#boardAdvanced");
	$boardDifficult = $("#boardDifficult");
	var allImages = ["images/01.jpg", "images/02.jpg", "images/03.jpg", "images/04.jpg", "images/05.jpg", "images/06.jpg",
					 "images/07.jpg", "images/08.jpg", "images/09.jpg", "images/10.jpg", "images/11.jpg", "images/12.jpg",
					 "images/13.jpg", "images/14.jpg", "images/15.jpg", "images/16.jpg", "images/17.jpg", "images/18.jpg"];
	var newBoardArray = []; // Temporarily store the images when creating a new board
	var flippedImages = []; // Store the flipped images to check if they match
	var tilesMatched = 0; //Counts the number of tiles opened and matched
	var tile_1 = ""; //Temporarily holds the img element of the first opened tile
	var tile_2 = ""; //Temporarily holds the img element of the second opened tile
	//Create the flipping and matching audio elements throug the Audio Object which represents an HTML <audio> element
	var flipAudio = new Audio();
	flipAudio.src = "sounds/flip.mp3";
	var matchAudio = new Audio();
	matchAudio.src = "sounds/match.mp3";
	var openedPairs = 0;
	var score = 0;
	var bestScore = 0;
	var $overlay = $('<div id="overlay"></div>');
	var $overlayTime = $('<div id="overlayTime"></div>');
	var $nextLevel = $('<div id="nextLevel" class="levelButtons">Next Level</div>');
	var $startNewGame = $('<div class="levelButtons">Start New Game</div>');
	var $playAgain = $('<div id="playAgain" class="levelButtons">Play Again</div>');
	var $gameFinished = $('<h3>Congratulations, you have completed the game!</h3>');
	var $outOfTime = $('<h3>Sorry you have run out of time.</h3>');
	var minutes = 0;
	var timerRunning;
	var identifyBoard;
	//When click on the page title reload the window/go to home page
	$("#title").on("click", function(){
		location.reload();
	});
	//When click on Menu Icon show the menu
	$("#menuIcon").click(function(){
		$("#menu").toggle("fast");
	});
	//Menu Pages
	$("#menu ul li").click(function(){
		$("#menu").hide();
		//if a board is open timer stop
		clearInterval(timerRunning);
	});
	$("#menu ul li:first-child").click(function(){
		$(".menuPages").not("#instructions").hide();
		$("#instructions").show();
	});
	$("#menu ul li:nth-child(2)").click(function(){
		$(".menuPages").not("#about").hide();
		$("#about").show();
	});
	$("#menu ul li:last-child").click(function(){
		$(".menuPages").not("#contact").hide();
		$("#contact").show();
	});
	//When click on contact us in the About page open the Contact form
	$("#about_contact").click(function(){
		$("#menu ul li:last-child").click();
	});
	//Close the menu page by clicking on the X
	$(".menuPages img").click(function(){
		$(this).parent().hide();
		//if board is open timer resume
		if ($overlay.css("display") != "block") {
		startTimer((minutes/60), identifyBoard);
	}
	});
	//When click on a level slide up the levels div
	$(".levelButtons").on("click", function(){
		$("#levels").slideUp();
	});
	//When click on #buttonEasy show #boardEasy
	$("#buttonEasy").click(function() {
		$boardEasy.delay( 300 ).slideDown("fast");
		$scoreContainer.delay( 300 ).slideDown("fast");
		newBoard(6, $boardEasy);
		flipTiles();
		getBestScore('bestEasy');
		startTimer(0.5, $boardEasy);
	});
	//When click on #buttonNormal show #boardNormal
	$("#buttonNormal").click(function() {
		$boardNormal.delay( 300 ).slideDown("fast");
		$scoreContainer.delay( 300 ).slideDown("fast");
		newBoard(10, $boardNormal);
		flipTiles();
		getBestScore('bestNormal');
		startTimer(1, $boardNormal);
	});
	//When click on #buttonAdvanced show #boardNormal
	$("#buttonAdvanced").click(function() {
		$boardAdvanced.delay( 300 ).slideDown("fast");
		$scoreContainer.delay( 300 ).slideDown("fast");
		newBoard(14, $boardAdvanced);
		flipTiles();
		getBestScore('bestAdvanced');
		startTimer(1.5, $boardAdvanced);
	});
	//When click on #buttonDifficult show #boardDifficult
	$("#buttonDifficult").click(function() {
		$boardDifficult.delay( 300 ).slideDown("fast");
		$scoreContainer.delay( 300 ).slideDown("fast");
		newBoard(18, $boardDifficult);
		flipTiles();
		getBestScore('bestDifficult');
		startTimer(2, $boardDifficult);
	});
	//When click on #startGame start the game from level 1
	$("#startGame").click(function() {
		$("#buttonEasy").click();
	});

	//Generate new board
	function newBoard(imagesNeeded, theBoard) {
		var allImagesCopy = [];
		var tilesOnBoard = "";
		//Create a copy of the allImages array to be able to splice it
			for (var i = 0; i < allImages.length; i++) {
				allImagesCopy.push(allImages[i]);
			};
		//Randomly pick the images needed for the specific board depending of the imagesNeeded parameter
		newBoardArray = [];
			for (var i = 0; i < imagesNeeded; i++) {
			    // Randomly pick one from the allImagesCopy array
			    var randomTile = Math.floor(Math.random() * allImagesCopy.length);
			    var newTile = allImagesCopy[randomTile];
			    // Push 2 copies onto newBoardArray
			    newBoardArray.push(newTile);
			    newBoardArray.push(newTile);
			    // Remove from allImagesCopy array so it's not re-picked
			    allImagesCopy.splice(randomTile, 1);
			};
		//sort randomly the newBoardArray 
		newBoardArray.sort(function() {
	    return 0.5 - Math.random();
	    });
	    //Create the tiles on the board as divs with images from the newBoardArray
	    for (var i = 0; i < newBoardArray.length; i++){
	    	tilesOnBoard += "<div class='tiles'><img src='"+ newBoardArray[i] + "'></div>";
	    };
	    theBoard.html(tilesOnBoard);
	};

	function flipTiles() {
		//When clicking on a tile 
		$("div.tiles").on("click", function() {
			identifyBoard = $(this).parent();
			var $currentBoardID = $(this).parent().attr("id");//Identify the current board 
			//Disable further action if the image is already opened
			if ($(this).children("img").css("display") !== "none") {
				return;
			}
			else {
				//Show the image on click if no other tile is opened
				if(flippedImages.length === 0) {
					tile_1 = $(this).children("img");
					tile_1.show();
					flipAudio.play();
					flippedImages.push(tile_1.attr("src"));
				//or show the image if only one other tile is opened
				} else if (flippedImages.length === 1) {
					tile_2 = $(this).children("img");
					tile_2.show();
					flipAudio.play();
					flippedImages.push(tile_2.attr("src"));
					//if the opened images match keep them open
					if (flippedImages[0] === flippedImages[1]) {
						matchAudio.play();
						tilesMatched +=2; 
						clearTempVariable();
						tries();
						score +=10;
						$("#score span").text(score);
						bestScoreDisplay();
						//When all images are matched the game is over
						if (tilesMatched === newBoardArray.length) {
							clearInterval(timerRunning);
							tilesMatched = 0;
							calculateScoreTries($currentBoardID);
							calculateScoreTimer();
							$("#score span").text(score);
							bestScoreDisplay();
							saveBestScore($currentBoardID);
							$(this).parent().children().remove();
							showOverlay($currentBoardID);
							$nextLevel.click(function(){
								playNext($currentBoardID);
							});
							$playAgain.click(function(){
								playSameLevel($currentBoardID);
							});
							console.log($currentBoardID);
							//When the last level is finished instead of the Next Level button, a Start New Game button appears
							$startNewGame.click(function(){
								location.reload();
							});
						}
					//if the images don't match flip them back
					} else {
						setTimeout(flipBack, 900);
						tries();
					}
				};
			}
		});
	}
	function clearTempVariable(){
		flippedImages = [];
		tile_1 = "";
		tile_2 = "";
	}
	function flipBack() {
		tile_1.hide();
		tile_2.hide();
		clearTempVariable();
	}
	//Calculate the number of times a pair of images is opened
	function tries() {
		openedPairs++
		$("#openedPairs span").text(openedPairs);
	}
	function showOverlay(boardID) {
		board = identifyBoard;
		if (boardID == "boardDifficult") {
			$overlay.append($gameFinished);
			$overlay.append($startNewGame);
			$overlay.append($playAgain);
			$boardDifficult.append($overlay);
			$overlay.show();
			$nextLevel.hide();
		}
		else {
			$overlay.append($nextLevel);
			$overlay.append($playAgain);
			board.append($overlay);
			$overlay.show();
		}
	}
	function resetScore() {
		score = 0;
		$("#score span").text(score);
		openedPairs = 0;
		$("#openedPairs span").text(openedPairs);
	}
	//When all matches are made and the game is finished play next level
	function playNext(board) {
		resetScore();
		if (board == "boardEasy") {
			$boardEasy.remove();
			$overlay.hide();
		    $("#buttonNormal").click();
		} else if (board == "boardNormal") {
			$boardNormal.remove();
			$overlay.hide();
			$("#buttonAdvanced").click();		
		} else if (board == "boardAdvanced") {
			$boardAdvanced.remove();
			$overlay.hide();
			$("#buttonDifficult").click();		
		}
	}
	//When the game is finished and Play Again Button is clicked open the board again
	function playSameLevel(board) {
		resetScore();
		if (board == "boardEasy") {
			 $("#buttonEasy").click();
		} else if (board == "boardNormal") {
			 $("#buttonNormal").click();	
		} else if (board == "boardAdvanced") {
			 $("#buttonAdvanced").click();	
		} else if (board == "boardDifficult") {
			 $("#buttonDifficult").click();
		}
	}
	// Increase the score based on the number of tries
	function calculateScoreTries(board) {
		if (board == "boardEasy" && openedPairs < 10) {
			score += 20;
		} else if (board == "boardEasy" && openedPairs < 15) {
			score += 10;		
		} else if (board == "boardNormal" && openedPairs < 15) {
			score += 40;		
		} else if (board == "boardNormal" && openedPairs < 20) {
			score += 20;		
		} else if (board == "boardAdvanced" && openedPairs < 20) {
			score += 50;		
		} else if (board == "boardAdvanced" && openedPairs < 25) {
			score += 30;		
		} else if (board == "boardDifficult" && openedPairs < 30) {
			score += 60;		
		} else if (board == "boardDifficult" && openedPairs < 40) {
			score += 40;		
		}
	}
	function calculateScoreTimer() {
		score += minutes * 5;
	}

	//Store locally the Best Score value for each board
	function saveBestScore(board) {
		if (board == "boardEasy") {
			window.localStorage.setItem('bestEasy', bestScore);
		} else if (board == "boardNormal") {
			window.localStorage.setItem('bestNormal', bestScore);
		} else if (board == "boardAdvanced") {
			window.localStorage.setItem('bestAdvanced', bestScore);
		} else if (board == "boardDifficult") {
			window.localStorage.setItem('bestDifficult', bestScore);
		}
	}
	function getBestScore(value) {
		if (window.localStorage.getItem(value) === null) {
			bestScore = 0
		} else {
			bestScore = parseInt(window.localStorage.getItem(value));
		}
		$("#bestScore span").text(bestScore);
	}
	function bestScoreDisplay() {
		if (score > bestScore) {
			bestScore = score;
			$("#bestScore span").text(bestScore);
		}
	}
	function startTimer(minNeeded, currentBoard) {
		minutes = 60 * minNeeded
	    var display = $("#timer span");
	    var mins, seconds;
	    // The function that decreses the seconds at an interval
		timerRunning = setInterval(function() {
	    mins = parseInt(minutes / 60)
	    seconds = parseInt(minutes % 60);
	    seconds = seconds < 10 ? "0" + seconds : seconds;
	    
	    display.text(mins + ":" + seconds);
	    minutes--;

	  if (minutes < 0) {
	        minutes = 0;
	        noTimeLeft(currentBoard);
	    }
	    }, 1000);
	}
	//When the timer reaches 0 it stops and the game is over
	function noTimeLeft(currentBoard) {
		clearInterval(timerRunning);
		clearTempVariable();
		tilesMatched = 0;
		currentBoard.children().remove();
		$overlayTime.append($outOfTime);
		$overlayTime.append($playAgain);
		currentBoard.append($overlayTime);
		$overlayTime.show();
		identifyBoard = currentBoard;
		$("#timer span").css("color", "red");
		//When the timer runs out -> play the same level again
		$("#playAgain").click(function() {
			var currentBoard = identifyBoard.attr("id");
			playSameLevel(currentBoard);
			identifyBoard = "";
			$("#timer span").css("color", "#F35E06");
		});
	}
})();