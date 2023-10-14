import "./style.css";

import { KANJI_DATA_SET } from "tegaki/dataset";
import { createTegaki } from "tegaki/frontend";

const tegaki = createTegaki(document);
tegaki.init("tegaki-sample", KANJI_DATA_SET);

const recognizeBtn = document.getElementById("recognize-btn")!;
recognizeBtn.addEventListener("click", () => {
  tegaki.recognize();
});

const undoBtn = document.getElementById("undo-btn")!;
undoBtn.addEventListener("click", () => {
  tegaki.deleteLast();
});

const eraseBtn = document.getElementById("erase-btn")!;
eraseBtn.addEventListener("click", () => {
  tegaki.erase();
});
