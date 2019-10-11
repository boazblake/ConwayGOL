import { compose, range, values, without } from "ramda"
// export const boardSizes` = filter((n) => n % 3 == 0, range(30, 60))

export const log = (m) => (v) => {
  console.log(m, v)
  return v
}

export const makeKey = (coords) => `${coords[0]}-${coords[1]}`

const siblingCoords = [
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1]
]

const within = (limit) => (coords) =>
  !(coords.includes(limit) || coords.includes(-1))

const toSiblingModel = (acc, sibling) => {
  acc[sibling] = false
  return acc
}

const calcSiblings = (limit) => (sibCoords) => (coords) =>
  sibCoords
    .map((sib) => [sib[0] + coords[0], sib[1] + coords[1]])
    .filter(within(limit))
    .reduce(toSiblingModel, {})

const makeCell = (mdl) => (size) => (idx) => {
  let coords = [idx % size, Math.floor(idx / size)]
  let siblings = calcSiblings(size)(siblingCoords)(coords)
  let cell = {
    key: idx,
    value: "",
    isAlive: false,
    coords,
    siblings
  }
  mdl.board[coords] = cell

  mdl.cells[coords] = cell
  return mdl
}

export const makeBoardFromSize = (mdl, size) => {
  mdl.size(size)
  return range(0, size * size).map(makeCell(mdl)(size))
}

export const calculateCell = (mdl) => {
  Object.keys(mdl.board).map((cell) => {
    let cellsAlive = without([false], values(mdl.board[cell].siblings)).length
    if (cellsAlive <= 2) {
      mdl.board[cell].isAlive = false
      mdl.cells[cell].isAlive = false
    }

    if ([2, 3].includes(cellsAlive)) {
      mdl.board[cell].isAlive = true
      mdl.cells[cell].isAlive = true
    }

    if (cellsAlive > 3) {
      mdl.board[cell].isAlive = false
      mdl.cells[cell].isAlive = false
    }

    if (cellsAlive == 3) {
      mdl.board[cell].isAlive = true
      mdl.cells[cell].isAlive = true
    }
  })
  return mdl
}

export const updateSiblings = (mdl) => {
  Object.keys(mdl.board).map((cell) =>
    Object.keys(mdl.board[cell].siblings).map(
      (sibling) =>
        (mdl.board[cell].siblings[sibling] = mdl.board[sibling].isAlive)
    )
  )

  return mdl
}

export const runGOL = (mdl) => {
  // if (mdl.isRunning()) {
  // setTimeout(() => {
  // console.log("model", mdl)
  // return runGOL(
  updateCells(mdl)
  // )
  // }, 1000)
  // } else {
  return mdl
  // }
}

const randomizeCells = (mdl) => {
  let randomCells = Object.keys(mdl.board)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10)

  randomCells.map((cell) => (mdl.board[cell].isAlive = true))

  return mdl
}

export const updateCells = compose(calculateCell, updateSiblings)

export const createSeed = compose(updateSiblings, randomizeCells)
