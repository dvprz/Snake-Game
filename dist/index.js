(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.snakeGameFactory = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var Queue =
  /*#__PURE__*/
  function () {
    function Queue() {
      _classCallCheck(this, Queue);

      this.items = {};
      this.count = 0;
      this.lowestCount = 0;
    }

    _createClass(Queue, [{
      key: "enqueue",
      value: function enqueue(element) {
        this.items[this.count] = element;
        this.count++;
      }
    }, {
      key: "dequeue",
      value: function dequeue() {
        if (this.isEmpty()) return undefined;
        var result = this.items[this.lowestCount];
        delete this.items[this.lowestCount];
        this.lowestCount++;
        return result;
      }
    }, {
      key: "peek",
      value: function peek() {
        if (this.isEmpty()) return undefined;
        return this.items[this.lowestCount];
      }
    }, {
      key: "clear",
      value: function clear() {
        this.items = {};
        this.count = 0;
        this.lowestCount = 0;
      }
    }, {
      key: "isEmpty",
      value: function isEmpty() {
        return this.size() === 0;
      }
    }, {
      key: "size",
      value: function size() {
        return this.count - this.lowestCount;
      }
    }]);

    return Queue;
  }();

  var Deque =
  /*#__PURE__*/
  function () {
    function Deque() {
      _classCallCheck(this, Deque);

      this.count = 0;
      this.lowestCount = 0;
      this.items = {};
    }

    _createClass(Deque, [{
      key: "addFront",
      value: function addFront(element) {
        if (this.isEmpty()) {
          this.addBack(element);
        } else if (this.lowestCount > 0) {
          this.lowestCount--;
          this.items[this.lowestCount] = element;
        } else {
          for (var i = this.count; i > 0; i--) {
            this.items[i] = this.items[i - 1];
          }

          this.count++;
          this.lowestCount = 0;
          this.items[0] = element;
        }
      }
    }, {
      key: "addBack",
      value: function addBack(element) {
        this.items[this.count] = element;
        this.count++;
      }
    }, {
      key: "removeBack",
      value: function removeBack() {
        if (this.isEmpty()) return undefined;
        this.count--;
        var result = this.items[this.count];
        delete this.items[this.count];
        return result;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.items = {};
        this.count = 0;
        this.lowestCount = 0;
      }
    }, {
      key: "peekFront",
      value: function peekFront() {
        if (this.isEmpty()) return undefined;
        return this.items[this.lowestCount];
      }
    }, {
      key: "isEmpty",
      value: function isEmpty() {
        return this.size() === 0;
      }
    }, {
      key: "size",
      value: function size() {
        return this.count - this.lowestCount;
      }
    }]);

    return Deque;
  }();

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  var GAME_BOARD = 'PlayingField';
  var GAME_BOARD_CELL = 'Cell';
  var AMOUNT = 'amount';
  var FOOD_SELECTOR = 'is-food';
  var SNAKE_SELECTOR = 'is-snake';
  var LEFT_ARROW = 37;
  var RIGHT_ARROW = 39;
  var UP_ARROW = 38;
  var DOWN_ARROW = 40;

  var doc = document;

  var SnakeGame =
  /*#__PURE__*/
  function () {
    function SnakeGame() {
      _classCallCheck(this, SnakeGame);

      this._gameboard = doc.querySelector("#".concat(GAME_BOARD));
      this._score = null;
      this._scoreEl = doc.querySelector("#".concat(AMOUNT));
      this._cellsPerRow = 20;
      this._totalCells = Math.pow(this._cellsPerRow, 2);
      this._moves = new Queue();
      this._snake = new Deque();
      this._interval = null;
      this._currentFoodCoord = null;
      this._coords = [];
      this._active = null;
      this._currentDirection = null;
    }

    _createClass(SnakeGame, [{
      key: "initialize",
      value: function initialize() {
        this._createGameBoard();

        this._setInitialSnakePosition();

        this._generateNewFood();

        this._handleKeyUp = this._handleKeyUp.bind(this);
        doc.addEventListener('keyup', this._handleKeyUp);
      }
    }, {
      key: "_handleKeyUp",
      value: function _handleKeyUp(event) {
        var keyCode = event.keyCode;
        /* Return if we didn't get an approved key */

        if (!(keyCode === LEFT_ARROW) && !(keyCode === RIGHT_ARROW) && !(keyCode === DOWN_ARROW) && !(keyCode === UP_ARROW)) {
          return false;
        }

        if (!this._active) {
          return this.enqueueMove(keyCode);
        }
        /* If we are already moving in this direction then we don't have to do anything */


        if (this._currentDirection === keyCode) return false;
        /* Return if:
        moving right and the user goes left
        moving left and the user goes right
        moving down and the user goes up
        moving up and the user goes down */

        if (this._currentDirection === RIGHT_ARROW && keyCode === LEFT_ARROW) {
          return false;
        } else if (this._currentDirection === LEFT_ARROW && keyCode === RIGHT_ARROW) {
          return false;
        } else if (this._currentDirection === DOWN_ARROW && keyCode === UP_ARROW) {
          return false;
        } else if (this._currentDirection === UP_ARROW && keyCode === DOWN_ARROW) {
          return false;
        }

        return this.enqueueMove(keyCode);
      }
    }, {
      key: "enqueueMove",
      value: function enqueueMove(direction) {
        this._moves.enqueue(direction);

        if (!this._currentDirection) {
          this._currentDirection = direction;
        }

        if (!this._active) {
          this._active = true;

          this._start();
        }
      }
    }, {
      key: "killGame",
      value: function killGame() {
        clearInterval(this._interval);
        alert("Game over. Your total score was ".concat(this._score, ". Play again!"));
        this.reset();
      }
    }, {
      key: "_start",
      value: function _start() {
        var _this = this;

        this._interval = setInterval(function () {
          var direction = _this._currentDirection;
          var newCoord;
          var peek;

          if (!_this._moves.isEmpty()) {
            direction = _this._moves.dequeue();
            _this._currentDirection = direction;
          }

          peek = _this._snake.peekFront();
          newCoord = _this._getNewCoord(peek, direction);

          if (newCoord) {
            _this._consumeCoord(newCoord);
          }
        }, 200);
      }
    }, {
      key: "_getNewCoord",
      value: function _getNewCoord(coord, direction) {
        var row = coord.row,
            col = coord.col;
        var right = this._cellsPerRow - 1;
        var bottom = this._totalCells / this._cellsPerRow - 1;
        var top = 0;
        var left = 0; // check to see if the next coord runs into an edge

        switch (direction) {
          case RIGHT_ARROW:
            col++;
            if (col > right) return this.killGame();
            break;

          case LEFT_ARROW:
            col--;
            if (col < left) return this.killGame();
            break;

          case DOWN_ARROW:
            row++;
            if (row > bottom) return this.killGame();
            break;

          case UP_ARROW:
            row--;
            if (row < top) return this.killGame();
            break;
        }

        return this._coords[row][col];
      }
    }, {
      key: "reset",
      value: function reset() {
        this._score = 0;
        this._scoreEl.innerText = 0;

        this._moves.clear();

        while (this._snake.size() > 0) {
          var remove = this._snake.removeBack();

          this._resetCoord(remove, 'snake');
        }

        if (this._currentFoodCoord) {
          this._resetCoord(this._currentFoodCoord, 'food');

          this._currentFoodCoord = null;
        }

        this._interval = null;
        this._active = null;
        this._currentDirection = null;

        this._setInitialSnakePosition();

        this._generateNewFood();
      }
    }, {
      key: "_setInitialSnakePosition",
      value: function _setInitialSnakePosition() {
        var coord = this._coords[10][2];

        this._snakifyCoord(coord);
      }
    }, {
      key: "_generateNewFood",
      value: function _generateNewFood() {
        var foundEmptyCoord = false;
        var row;
        var col;

        while (!foundEmptyCoord) {
          row = getRandomNumber(0, this._cellsPerRow);
          col = getRandomNumber(0, this._cellsPerRow);

          if (!this._coords[row][col].isSnake) {
            foundEmptyCoord = true;
          }
        }

        var foodCoord = this._coords[row][col];

        this._foodifyCoord(foodCoord);
      }
    }, {
      key: "_updateScore",
      value: function _updateScore() {
        this._score += 5;
        this._scoreEl.innerText = this._score;
      }
    }, {
      key: "_consumeCoord",
      value: function _consumeCoord(coord) {
        if (coord.isFood) {
          this._resetCoord(coord, 'food');

          this._generateNewFood();

          this._snakifyCoord(coord);

          this._updateScore();

          return;
        }

        if (coord.isSnake) {
          return this.killGame();
        }

        var removed = this._snake.removeBack();

        this._resetCoord(removed, 'snake');

        this._snakifyCoord(coord);
      }
    }, {
      key: "_resetCoord",
      value: function _resetCoord(coord, type) {
        if (type === 'food') {
          coord.isFood = false;
          coord.el.classList.remove(FOOD_SELECTOR);
        } else if (type === 'snake') {
          coord.isSnake = false;
          coord.el.classList.remove(SNAKE_SELECTOR);
        }
      }
    }, {
      key: "_foodifyCoord",
      value: function _foodifyCoord(coord) {
        coord.isFood = true;
        coord.el.classList.add(FOOD_SELECTOR);
        this._currentFoodCoord = coord;
      }
    }, {
      key: "_snakifyCoord",
      value: function _snakifyCoord(coord) {
        coord.isSnake = true;
        coord.el.classList.add(SNAKE_SELECTOR);

        this._snake.addFront(coord);
      }
    }, {
      key: "_createGameBoard",
      value: function _createGameBoard() {
        /* create the game board */
        var fragment = doc.createDocumentFragment();
        var count = 0;
        var row = 0;
        var col = 0;
        var position = {
          top: 1,
          left: 1
        };

        while (count < this._totalCells) {
          var div = doc.createElement('div');
          var coord = {
            row: row,
            col: col,
            isFood: false,
            isSnake: false,
            el: div
            /* create the cell in memory */

            /* checks to see if we are at the end of a row */

          };

          if (count === 0) {
            this._coords.push([coord]);
          } else {
            if (count % this._cellsPerRow === 0) {
              position.top += 11;
              position.left = 1;
              row++;
              col = 0;
              coord.row = row;
              coord.col = col;

              this._coords.push([coord]);
            } else {
              position.left += 11;

              this._coords[row].push(coord);
            }
          }

          coord.el.classList.add(GAME_BOARD_CELL);
          coord.el.style.top = position.top + 'px';
          coord.el.style.left = position.left + 'px';
          fragment.appendChild(coord.el);
          col++;
          count++;
        }

        this._gameboard.appendChild(fragment);
      }
    }]);

    return SnakeGame;
  }();

  function snakeGameFactory() {
    return new SnakeGame();
  }

  return snakeGameFactory;

}));
