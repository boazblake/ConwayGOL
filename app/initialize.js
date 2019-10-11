import GameOfLife from "./app.js"
import model from "./model.js"

document.addEventListener("DOMContentLoaded", () => {
  const root = document.body
  m.mount(root, { view: () => m(GameOfLife, { mdl: model }) })
})
