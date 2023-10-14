import "./style.css";

import { KANJI_DATA_SET } from "tegaki/dataset";
import { recognize } from "tegaki/backend";
import { createTegaki } from "tegaki/frontend";

const tegaki = createTegaki(document);
tegaki.init("tegaki-sample");

const recognizeBtn = document.getElementById("recognize-btn")!;
recognizeBtn.addEventListener("click", () => {
  const strokes = tegaki.getStrokes();
  const candidate = recognize(strokes, KANJI_DATA_SET);
  const candidateContainer = document.getElementById("candidate-container")!;
  candidateContainer.textContent = candidate.join(", ");
});

const undoBtn = document.getElementById("undo-btn")!;
undoBtn.addEventListener("click", () => {
  tegaki.deleteLast();
});

const eraseBtn = document.getElementById("erase-btn")!;
eraseBtn.addEventListener("click", () => {
  tegaki.erase();
});
