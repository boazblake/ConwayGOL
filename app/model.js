const model = {
  isRunning: Stream(false),
  cells: {},
  turn: Stream(true),
  board: [],
  size: Stream(30),
  width: Stream(800)
}

export const restart = (mdl) => {
  mdl.isRunning = Stream(false)
  mdl.size(null)
  mdl.width(800)
  mdl.turn(true)
}

export default model
