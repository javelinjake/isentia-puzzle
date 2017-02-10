function PuzzleCtrl(AppSettings, $timeout) {
  'ngInject';

  // ViewModel
  const vm = this;

  // Set all the variables for the game
  var _stage;
  var _canvas;
  var _img;
  var _pieces;
  var _puzzleWidth;
  var _puzzleHeight;
  var _pieceWidth;
  var _pieceHeight;
  var _currentPiece;
  var _currentDropPiece;
  var _mouse;

  // Set the puzzle count
  vm.puzzleCount = 0;

  // Set the image
  _img = new Image();
  _img.addEventListener('load', onImage, false);
  _img.src = '/images/isentia.jpg';

  // When image is loaded
  function onImage() {
    _pieceWidth = Math.floor(_img.width / AppSettings.puzzleDifficulty)
    _pieceHeight = Math.floor(_img.height / AppSettings.puzzleDifficulty)
    _puzzleWidth = _pieceWidth * AppSettings.puzzleDifficulty;
    _puzzleHeight = _pieceHeight * AppSettings.puzzleDifficulty;

    // Set up the canvas
    setCanvas();

    // Initialise the puzzle
    initPuzzle();
  }

  function setCanvas() {
    _canvas = document.getElementById('canvas');
    _stage = _canvas.getContext('2d');
    _canvas.width = _puzzleWidth;
    _canvas.height = _puzzleHeight;
    _canvas.style.border = '1px solid black';
  }

  function initPuzzle() {
    _pieces = [];
    _mouse = {
      x: 0,
      y: 0
    };
    _currentPiece = null;
    _currentDropPiece = null;
    _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);

    // Build the pieces according to difficulty
    buildPieces();
  }

  function buildPieces() {
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for (i = 0; i < AppSettings.puzzleDifficulty * AppSettings.puzzleDifficulty; i++) {
      piece = {};
      piece.sx = xPos;
      piece.sy = yPos;
      _pieces.push(piece);
      xPos += _pieceWidth;
      if (xPos >= _puzzleWidth) {
        xPos = 0;
        yPos += _pieceHeight;
      }
    }

    // Shuffle the puzzle once pieces have been setup
    shufflePuzzle();
  }

  function shufflePuzzle() {
    _pieces = shuffleArray(_pieces);
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for (i = 0; i < _pieces.length; i++) {
      piece = _pieces[i];
      piece.xPos = xPos;
      piece.yPos = yPos;
      _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
      _stage.strokeRect(xPos, yPos, _pieceWidth, _pieceHeight);
      xPos += _pieceWidth;
      if (xPos >= _puzzleWidth) {
        xPos = 0;
        yPos += _pieceHeight;
      }
    }

    // On mouse click on puzzle piece
    document.onmousedown = onPuzzleClick;
  }

  function onPuzzleClick(e) {
    if (e.layerX || e.layerX == 0) {
      _mouse.x = e.layerX - _canvas.offsetLeft;
      _mouse.y = e.layerY - _canvas.offsetTop;
    } else if (e.offsetX || e.offsetX == 0) {
      _mouse.x = e.offsetX - _canvas.offsetLeft;
      _mouse.y = e.offsetY - _canvas.offsetTop;
    }

    // Check what puzzle piece has been clicked
    _currentPiece = checkPieceClicked();
    if (_currentPiece != null) {
      _stage.clearRect(_currentPiece.xPos, _currentPiece.yPos, _pieceWidth, _pieceHeight);
      _stage.save();
      _stage.globalAlpha = .9;
      _stage.drawImage(_img, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
      _stage.restore();

      // Update the puzzle on mouse move
      document.onmousemove = updatePuzzle;

      // Update the puzzle on mouse release
      document.onmouseup = pieceDropped;
    }
  }

  function checkPieceClicked() {
    var i;
    var piece;
    for (i = 0; i < _pieces.length; i++) {
      piece = _pieces[i];
      if (_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)) {
        //PIECE NOT HIT
      } else {
        return piece;
      }
    }
    return null;
  }

  function updatePuzzle(e) {
    _currentDropPiece = null;
    if (e.layerX || e.layerX == 0) {
      _mouse.x = e.layerX - _canvas.offsetLeft;
      _mouse.y = e.layerY - _canvas.offsetTop;
    } else if (e.offsetX || e.offsetX == 0) {
      _mouse.x = e.offsetX - _canvas.offsetLeft;
      _mouse.y = e.offsetY - _canvas.offsetTop;
    }
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var i;
    var piece;
    for (i = 0; i < _pieces.length; i++) {
      piece = _pieces[i];
      if (piece == _currentPiece) {
        continue;
      }
      _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
      _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
      if (_currentDropPiece == null) {
        if (_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)) {
          //NOT OVER
        } else {
          _currentDropPiece = piece;
          _stage.save();
          _stage.globalAlpha = .4;
          _stage.fillStyle = AppSettings.puzzleHoverColour;
          _stage.fillRect(_currentDropPiece.xPos, _currentDropPiece.yPos, _pieceWidth, _pieceHeight);
          _stage.restore();
        }
      }
    }
    _stage.save();
    _stage.globalAlpha = .6;
    _stage.drawImage(_img, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
    _stage.restore();
    _stage.strokeRect(_mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
  }

  function pieceDropped() {
    document.onmousemove = null;
    document.onmouseup = null;
    if (_currentDropPiece != null) {
      var tmp = {
        xPos: _currentPiece.xPos,
        yPos: _currentPiece.yPos
      };
      _currentPiece.xPos = _currentDropPiece.xPos;
      _currentPiece.yPos = _currentDropPiece.yPos;
      _currentDropPiece.xPos = tmp.xPos;
      _currentDropPiece.yPos = tmp.yPos;

      // Count number of times piece has been clicked and released
      $timeout(function() {
        vm.puzzleCount++;
      });
    }

    // Check if the puzzle is complete after each release
    resetPuzzleAndCheckWin();
  }

  function resetPuzzleAndCheckWin() {
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for (i = 0; i < _pieces.length; i++) {
      piece = _pieces[i];
      _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
      _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
      if (piece.xPos != piece.sx || piece.yPos != piece.sy) {
        gameWin = false;
      }
    }
    if (gameWin) {

      // If the game has been won set to true, success messaging appears
      vm.gameWin = true;
    }
  }

  // Reset game on ng-click
  vm.resetGame = function() {
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
    initPuzzle();

    // Set game win and puzzle count to false and 0
    vm.gameWin = false;
    vm.puzzleCount = 0;
  }

  function shuffleArray(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

}

export default {
  name: 'PuzzleCtrl',
  fn: PuzzleCtrl
};
