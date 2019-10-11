import {
  log,
  makeBoardFromSize,
  updateCells,
  createSeed,
  runGOL
} from "./functions.js"
import { restart } from "./model.js"

const Cell = {
  view: ({ attrs: { mdl, cell } }) => {
    return m(".cell", {
      class: cell.isAlive ? "alive" : "dead",
      style: {
        fontSize: `${mdl.width() / mdl.size() / 2}px`,
        height: `${mdl.width() / mdl.size() / 2}px`,
        flex: `1 1 ${mdl.width() / mdl.size()}px`
      },
      onclick: () => {
        mdl.isRunning(mdl.isRunning())
        mdl.board[cell.coords].isAlive = !cell.isAlive
        updateCells(mdl)
      }
    })
  }
}

const Board = ({ attrs: { mdl } }) => {
  makeBoardFromSize(mdl, Number(mdl.size()))
  return {
    oninit: ({ attrs: { mdl } }) => createSeed(mdl),
    view: ({ attrs: { mdl } }) => {
      return m(
        ".board",
        { style: { width: `${mdl.width()}px` } },
        Object.keys(mdl.board).map((coord) => {
          let cell = mdl.board[coord]
          return m(Cell, { key: cell.key, cell, mdl })
        })
      )
    }
  }
}

const Toolbar = {
  view: ({ attrs: { mdl } }) =>
    m(".toolbar", [
      m("button.btn", { onclick: (e) => restart(mdl) }, "New Game"),
      m("button.btn", { onclick: (e) => updateCells(mdl) }, "Next"),
      m(
        "button.btn",
        {
          onclick: (e) => {
            mdl.isRunning(!mdl.isRunning())
            runGOL(mdl)
          }
        },
        "Start"
      )
    ])
}

const GameOfLife = {
  view: ({ attrs: { mdl } }) => {
    return m(".container", [
      m(Toolbar, { mdl }),
      m(Board, {
        mdl
      })
    ])
  }
}

export default GameOfLife
