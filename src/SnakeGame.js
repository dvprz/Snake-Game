import Queue from './structures/Queue'
import Deque from './structures/Deque'
import { getRandomNumber } from './helper'
import * as constants from './constants'

const doc = document

export default class SnakeGame {

  constructor() {
    this._gameboard = doc.querySelector(`#${constants.GAME_BOARD}`)
    this._score = null
    this._scoreEl = doc.querySelector(`#${constants.AMOUNT}`)
    this._cellsPerRow = 20
    this._totalCells = Math.pow(this._cellsPerRow, 2)
    this._moves = new Queue()
    this._snake = new Deque()
    this._interval = null
    this._currentFoodCoord = null
    this._coords = []
    this._active = null
    this._currentDirection = null
  }

  initialize() {
    this._createGameBoard()
    this._setInitialSnakePosition()
    this._generateNewFood()
    this._handleKeyUp = this._handleKeyUp.bind(this)
    doc.addEventListener('keyup', this._handleKeyUp)
  }

  _handleKeyUp(event) {
    const keyCode = event.keyCode

    /* Return if we didn't get an approved key */
    if (
      !( keyCode === constants.LEFT_ARROW ) &&
      !( keyCode === constants.RIGHT_ARROW ) &&
      !( keyCode === constants.DOWN_ARROW ) &&
      !( keyCode === constants.UP_ARROW )
    ) {
      return false
    }

    if (!this._active) {
      return this.enqueueMove(keyCode)
    }

    /* If we are already moving in this direction then we don't have to do anything */
    if (this._currentDirection === keyCode) return false

    /* Return if:
    moving right and the user goes left
    moving left and the user goes right
    moving down and the user goes up
    moving up and the user goes down */
    if (this._currentDirection === constants.RIGHT_ARROW && keyCode === constants.LEFT_ARROW) {
      return false
    } else if (this._currentDirection === constants.LEFT_ARROW && keyCode === constants.RIGHT_ARROW) {
      return false
    } else if (this._currentDirection === constants.DOWN_ARROW && keyCode === constants.UP_ARROW) {
      return false
    } else if (this._currentDirection === constants.UP_ARROW && keyCode === constants.DOWN_ARROW) {
      return false
    }

    return this.enqueueMove(keyCode)
  }

  enqueueMove(direction) {
    this._moves.enqueue(direction)

    if (!this._currentDirection) {
      this._currentDirection = direction
    }

    if (!this._active) {
      this._active = true
      this._start()
    }
  }

  killGame() {
    clearInterval(this._interval)
    alert(`Game over. Your total score was ${this._score}. Play again!`)
    this.reset()
  }

  _start() {
    this._interval = setInterval(() => {
      let direction = this._currentDirection
      let newCoord
      let peek

      if (!this._moves.isEmpty()) {
        direction = this._moves.dequeue()
        this._currentDirection = direction
      }

      peek = this._snake.peekFront()
      newCoord = this._getNewCoord(peek, direction)
      if (newCoord) {
        this._consumeCoord(newCoord)
      }
    }, 200)
  }

  _getNewCoord(coord, direction) {
    let nextCoord
    let { row, col } = coord
    const right = this._cellsPerRow - 1
    const bottom = (this._totalCells / this._cellsPerRow ) - 1
    const top = 0
    const left = 0

    // check to see if the next coord runs into an edge
    switch (direction) {
      case constants.RIGHT_ARROW :
        col++
        if (col > right) return this.killGame()
        break
      case constants.LEFT_ARROW :
        col--
        if (col < left) return this.killGame()
        break
      case constants.DOWN_ARROW :
        row++
        if (row > bottom) return this.killGame()
        break
      case constants.UP_ARROW :
        row--
        if (row < top) return this.killGame()
        break
    }

    return this._coords[row][col]
  }

  reset() {
    this._score = 0
    this._scoreEl.innerText = 0
    this._moves.clear()

    while(this._snake.size() > 0) {
      const remove = this._snake.removeBack()
      this._resetCoord(remove, 'snake')
    }

    if (this._currentFoodCoord) {
      this._resetCoord(this._currentFoodCoord, 'food')
      this._currentFoodCoord = null
    }

    this._interval = null
    this._active = null
    this._currentDirection = null
    this._setInitialSnakePosition()
    this._generateNewFood()
  }

  _setInitialSnakePosition() {
    const coord = this._coords[10][2]
    this._snakifyCoord(coord)
  }

  _generateNewFood() {
    let foundEmptyCoord = false
    let row
    let col

    while (!foundEmptyCoord) {
      row = getRandomNumber(0, this._cellsPerRow)
      col = getRandomNumber(0, this._cellsPerRow)

      if (!this._coords[row][col].isSnake) {
        foundEmptyCoord = true
      }
    }

    const foodCoord = this._coords[row][col]
    this._foodifyCoord(foodCoord)
  }

  _updateScore() {
    this._score += 5
    this._scoreEl.innerText = this._score
  }

  _consumeCoord(coord) {
    if (coord.isFood) {
      this._resetCoord(coord, 'food')
      this._generateNewFood()
      this._snakifyCoord(coord)
      this._updateScore()
      return
    }

    if (coord.isSnake) {
      return this.killGame()
    }

    const removed = this._snake.removeBack()

    this._resetCoord(removed, 'snake')
    this._snakifyCoord(coord)
  }

  _resetCoord(coord, type) {
    if (type === 'food') {
      coord.isFood = false
      coord.el.classList.remove(FOOD_SELECTOR)
    } else if (type === 'snake') {
      coord.isSnake = false
      coord.el.classList.remove(SNAKE_SELECTOR)
    }
  }

  _foodifyCoord(coord) {
    coord.isFood = true
    coord.el.classList.add(FOOD_SELECTOR)
    this._currentFoodCoord = coord
  }

  _snakifyCoord(coord) {
    coord.isSnake = true
    coord.el.classList.add(SNAKE_SELECTOR)
    this._snake.addFront(coord)
  }

  _createGameBoard() {
    /* create the game board */
    const fragment = doc.createDocumentFragment()

    let count = 0
    let row = 0
    let col = 0
    const position = { top: 1, left: 1 }

    while (count < this._totalCells) {
      const div = doc.createElement('div')
      const coord = { row, col, isFood: false, isSnake: false, el: div }

      /* create the cell in memory */
      /* checks to see if we are at the end of a row */
      if (count === 0) {
        this._coords.push([coord])
      } else {
        if (count % this._cellsPerRow === 0) {
          position.top += 11
          position.left = 1
          row++
          col = 0
          coord.row = row
          coord.col = col
          this._coords.push([coord])
        } else {
          position.left += 11
          this._coords[row].push(coord)
        }
      }

      coord.el.classList.add(constants.GAME_BOARD_CELL)
      coord.el.style.top = position.top + 'px'
      coord.el.style.left = position.left + 'px'
      fragment.appendChild(coord.el)
      col++
      count++
    }

    this._gameboard.appendChild(fragment)
  }

}
