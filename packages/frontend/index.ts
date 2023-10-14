import type { Position, Stroke, TegakiStroke } from "@tegaki/types/index";
import { CandidateContainerNotFoundError, CanvasCtxNotFoundError, InitializeError } from "./errors";

// TODO: private properties
// TODO: map
export interface Tegaki {
  strokeColors: Array<string>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  w: number;
  h: number;
  flagOver: boolean;
  flagDown: boolean;
  prevX: number;
  currX: number;
  prevY: number;
  currY: number;
  newHeight: number;
  newWidth: number;
  oldHeight: number;
  oldWidth: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  x: number;
  y: number;
  xNorm: number;
  yNorm: number;
  dot_flag: boolean;
  recordedPattern: Array<Stroke>;
  currentLine: Stroke | null;
  s: string;

  init: (id: string) => void | InitializeError;
  draw: (color?: string) => void | CanvasCtxNotFoundError;
  deleteLast: () => void | CanvasCtxNotFoundError;
  erase: () => void | CanvasCtxNotFoundError;
  redraw: () => void | CanvasCtxNotFoundError;
  copyStuff: () => void;
  copyToClipboard: (text: string) => void;
  getStrokes: () => Array<Stroke>;

  find_x_y: (res: string, e: MouseEvent | TouchEvent) => void | CanvasCtxNotFoundError;
  alterHex: (hex: string, number: number, action: "inc" | "dec") => string;
  normalizeLinear: () => void;
}

export function createTegaki(document: Document): Tegaki {
  "use strict";

  // call Tegaki.init(id) to initialize a canvas as a Tegaki
  // `id` must be the id attribute of the canvas.
  // ex: Tegaki.init('canvas-1');
  const Tegaki = new Object() as Tegaki;

  // color coded stroke colors (for 30 strokes)
  // based on https://kanjivg.tagaini.net/viewer.html
  Tegaki.strokeColors = [
    "#bf0000",
    "#bf5600",
    "#bfac00",
    "#7cbf00",
    "#26bf00",
    "#00bf2f",
    "#00bf85",
    "#00a2bf",
    "#004cbf",
    "#0900bf",
    "#5f00bf",
    "#b500bf",
    "#bf0072",
    "#bf001c",
    "#bf2626",
    "#bf6b26",
    "#bfaf26",
    "#89bf26",
    "#44bf26",
    "#26bf4c",
    "#26bf91",
    "#26a8bf",
    "#2663bf",
    "#2d26bf",
    "#7226bf",
    "#b726bf",
    "#bf2682",
    "#bf263d",
    "#bf4c4c",
    "#bf804c",
  ];

  // private properties
  let canvasId: string = null!;

  // init canvas
  Tegaki.init = function (id) {
    canvasId = id;
    const c = document.getElementById(canvasId);
    if (!c) {
      return new InitializeError(`Canvas#${canvasId} was not found.`);
    }
    if (!(c instanceof HTMLCanvasElement)) {
      return new InitializeError(`Canvas#${canvasId} is not an HTMLCanvasElement. got ${c.constructor.name} instead.`);
    }
    Tegaki.canvas = c;

    Tegaki.canvas.tabIndex = 0; // makes canvas focusable, allowing usage of shortcuts
    Tegaki.ctx = Tegaki.canvas.getContext("2d");
    Tegaki.w = Tegaki.canvas.width;
    Tegaki.h = Tegaki.canvas.height;
    Tegaki.flagOver = false;
    Tegaki.flagDown = false;
    Tegaki.prevX = 0;
    Tegaki.currX = 0;
    Tegaki.prevY = 0;
    Tegaki.currY = 0;
    Tegaki.dot_flag = false;
    Tegaki.recordedPattern = new Array();
    Tegaki.currentLine = null;

    Tegaki.canvas.addEventListener(
      "mousemove",
      function (e) {
        Tegaki.find_x_y("move", e);
      },
      false,
    );
    Tegaki.canvas.addEventListener(
      "mousedown",
      function (e) {
        Tegaki.find_x_y("down", e);
      },
      false,
    );
    Tegaki.canvas.addEventListener(
      "mouseup",
      function (e) {
        Tegaki.find_x_y("up", e);
      },
      false,
    );
    Tegaki.canvas.addEventListener(
      "mouseout",
      function (e) {
        Tegaki.find_x_y("out", e);
      },
      false,
    );
    Tegaki.canvas.addEventListener(
      "mouseover",
      function (e) {
        Tegaki.find_x_y("over", e);
      },
      false,
    );

    // touch events
    Tegaki.canvas.addEventListener(
      "touchmove",
      function (e) {
        Tegaki.find_x_y("move", e);
      },
      false,
    );
    Tegaki.canvas.addEventListener(
      "touchstart",
      function (e) {
        Tegaki.find_x_y("down", e);
      },
      false,
    );
    Tegaki.canvas.addEventListener(
      "touchend",
      function (e) {
        Tegaki.find_x_y("up", e);
      },
      false,
    );
  };

  Tegaki.draw = function (color) {
    if (!Tegaki.ctx) {
      return createCanvasError();
    }
    Tegaki.ctx.beginPath();
    Tegaki.ctx.moveTo(Tegaki.prevX, Tegaki.prevY);
    Tegaki.ctx.lineTo(Tegaki.currX, Tegaki.currY);
    Tegaki.ctx.strokeStyle = color ? color : "#333";
    Tegaki.ctx.lineCap = "round";
    //Tegaki.ctx.lineJoin = "round";
    //Tegaki.ctx.lineMiter = "round";
    Tegaki.ctx.lineWidth = 4;
    Tegaki.ctx.stroke();
    Tegaki.ctx.closePath();
  };

  Tegaki.deleteLast = function () {
    if (!Tegaki.ctx) {
      return createCanvasError();
    }
    Tegaki.ctx.clearRect(0, 0, Tegaki.w, Tegaki.h);
    for (var i = 0; i < Tegaki.recordedPattern.length - 1; i++) {
      var stroke_i = Tegaki.recordedPattern[i];
      for (var j = 0; j < stroke_i.length - 1; j++) {
        Tegaki.prevX = stroke_i[j][0];
        Tegaki.prevY = stroke_i[j][1];

        Tegaki.currX = stroke_i[j + 1][0];
        Tegaki.currY = stroke_i[j + 1][1];
        Tegaki.draw();
      }
    }
    Tegaki.recordedPattern.pop();
  };

  Tegaki.erase = function () {
    if (!Tegaki.ctx) {
      return createCanvasError();
    }
    Tegaki.ctx.clearRect(0, 0, Tegaki.w, Tegaki.h);
    Tegaki.recordedPattern.length = 0;
  };

  Tegaki.find_x_y = function (res, e) {
    const isTouch = isTouchEvent(e);
    var touch = isTouch ? e.changedTouches[0] : null;

    if (isTouch) e.preventDefault(); // prevent scrolling while drawing to the canvas

    if (res == "down") {
      var rect = Tegaki.canvas.getBoundingClientRect();
      Tegaki.prevX = Tegaki.currX;
      Tegaki.prevY = Tegaki.currY;
      Tegaki.currX = (isTouch ? touch!.clientX : e.clientX) - rect.left;
      Tegaki.currY = (isTouch ? touch!.clientY : e.clientY) - rect.top;
      Tegaki.currentLine = new Array();
      Tegaki.currentLine.push([Tegaki.currX, Tegaki.currY]);

      Tegaki.flagDown = true;
      Tegaki.flagOver = true;
      Tegaki.dot_flag = true;
      if (Tegaki.dot_flag) {
        if (!Tegaki.ctx) {
          return createCanvasError();
        }
        Tegaki.ctx.beginPath();
        Tegaki.ctx.fillRect(Tegaki.currX, Tegaki.currY, 2, 2);
        Tegaki.ctx.closePath();
        Tegaki.dot_flag = false;
      }
    }
    if (res == "up") {
      Tegaki.flagDown = false;
      if (Tegaki.flagOver == true && Tegaki.currentLine) {
        Tegaki.recordedPattern.push(Tegaki.currentLine);
      }
    }

    if (res == "out") {
      Tegaki.flagOver = false;
      if (Tegaki.flagDown == true && Tegaki.currentLine) {
        Tegaki.recordedPattern.push(Tegaki.currentLine);
      }
      Tegaki.flagDown = false;
    }

    /*
	if (res == "over") {
    }
	*/

    if (res == "move") {
      if (Tegaki.flagOver && Tegaki.flagDown) {
        var rect = Tegaki.canvas.getBoundingClientRect();
        Tegaki.prevX = Tegaki.currX;
        Tegaki.prevY = Tegaki.currY;
        Tegaki.currX = (isTouch ? touch!.clientX : e.clientX) - rect.left;
        Tegaki.currY = (isTouch ? touch!.clientY : e.clientY) - rect.top;
        Tegaki.currentLine?.push([Tegaki.prevX, Tegaki.prevY]);
        Tegaki.currentLine?.push([Tegaki.currX, Tegaki.currY]);
        Tegaki.draw();
      }
    }
  };

  // redraw to current canvas according to
  // what is currently stored in Tegaki.recordedPattern
  // add numbers to each stroke
  Tegaki.redraw = function () {
    if (!Tegaki.ctx) {
      return createCanvasError();
    }
    Tegaki.ctx.clearRect(0, 0, Tegaki.w, Tegaki.h);

    // draw strokes
    for (var i = 0; i < Tegaki.recordedPattern.length; i++) {
      var stroke_i = Tegaki.recordedPattern[i];

      for (var j = 0; j < stroke_i.length - 1; j++) {
        Tegaki.prevX = stroke_i[j][0];
        Tegaki.prevY = stroke_i[j][1];

        Tegaki.currX = stroke_i[j + 1][0];
        Tegaki.currY = stroke_i[j + 1][1];
        Tegaki.draw(Tegaki.strokeColors[i]);
      }
    }

    // draw stroke numbers
    if (Tegaki.canvas.dataset.strokeNumbers != "false") {
      for (var i = 0; i < Tegaki.recordedPattern.length; i++) {
        var stroke_i = Tegaki.recordedPattern[i],
          x = stroke_i[Math.floor(stroke_i.length / 2)][0] + 5,
          y = stroke_i[Math.floor(stroke_i.length / 2)][1] - 5;

        Tegaki.ctx.font = "20px Arial";

        // outline
        Tegaki.ctx.lineWidth = 3;
        Tegaki.ctx.strokeStyle = Tegaki.alterHex(
          Tegaki.strokeColors[i] ? Tegaki.strokeColors[i] : "#333333",
          60,
          "dec",
        );
        Tegaki.ctx.strokeText((i + 1).toString(), x, y);

        // fill
        Tegaki.ctx.fillStyle = Tegaki.strokeColors[i] ? Tegaki.strokeColors[i] : "#333";
        Tegaki.ctx.fillText((i + 1).toString(), x, y);
      }
    }
  };

  // modifies hex colors to darken or lighten them
  // ex: Tegaki.alterHex(Tegaki.strokeColors[0], 60, 'dec'); // decrement all colors by 60 (use 'inc' to increment)
  Tegaki.alterHex = function (hex, number, action) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
      color: [string | number, string | number, string | number] = [
        parseInt(result![1], 16),
        parseInt(result![2], 16),
        parseInt(result![3], 16),
      ],
      i = 0,
      j = color.length;

    for (; i < j; i++) {
      switch (action) {
        case "inc":
          color[i] = ((color[i] as number) + number > 255 ? 255 : (color[i] as number) + number).toString(16);
          break;

        case "dec":
          color[i] = ((color[i] as number) - number < 0 ? 0 : (color[i] as number) - number).toString(16);
          break;

        default:
          break;
      }

      // add trailing 0
      if ((color[i] as string).length == 1) color[i] = color[i] + "0";
    }

    return "#" + color.join("");
  };

  // linear normalization for Tegaki.recordedPattern
  Tegaki.normalizeLinear = function () {
    var normalizedPattern = new Array();
    Tegaki.newHeight = 256;
    Tegaki.newWidth = 256;
    Tegaki.xMin = 256;
    Tegaki.xMax = 0;
    Tegaki.yMin = 256;
    Tegaki.yMax = 0;
    // first determine drawn character width / length
    for (var i = 0; i < Tegaki.recordedPattern.length; i++) {
      var stroke_i = Tegaki.recordedPattern[i];
      for (var j = 0; j < stroke_i.length; j++) {
        Tegaki.x = stroke_i[j][0];
        Tegaki.y = stroke_i[j][1];
        if (Tegaki.x < Tegaki.xMin) {
          Tegaki.xMin = Tegaki.x;
        }
        if (Tegaki.x > Tegaki.xMax) {
          Tegaki.xMax = Tegaki.x;
        }
        if (Tegaki.y < Tegaki.yMin) {
          Tegaki.yMin = Tegaki.y;
        }
        if (Tegaki.y > Tegaki.yMax) {
          Tegaki.yMax = Tegaki.y;
        }
      }
    }
    Tegaki.oldHeight = Math.abs(Tegaki.yMax - Tegaki.yMin);
    Tegaki.oldWidth = Math.abs(Tegaki.xMax - Tegaki.xMin);

    for (var i = 0; i < Tegaki.recordedPattern.length; i++) {
      var stroke_i = Tegaki.recordedPattern[i];
      var normalized_stroke_i = new Array();
      for (var j = 0; j < stroke_i.length; j++) {
        Tegaki.x = stroke_i[j][0];
        Tegaki.y = stroke_i[j][1];
        Tegaki.xNorm = (Tegaki.x - Tegaki.xMin) * (Tegaki.newWidth / Tegaki.oldWidth);
        Tegaki.yNorm = (Tegaki.y - Tegaki.yMin) * (Tegaki.newHeight / Tegaki.oldHeight);
        normalized_stroke_i.push([Tegaki.xNorm, Tegaki.yNorm]);
      }
      normalizedPattern.push(normalized_stroke_i);
    }
    Tegaki.recordedPattern = normalizedPattern;
    Tegaki.redraw();
  };

  /* test moment normalization
	function MomentTest() {
	  Tegaki.recordedPattern = test4;
	  var mn = Tegaki.momentNormalize();
	  Tegaki.recordedPattern = mn;
	  console.log(mn);
	  Tegaki.redraw();

	} */

  /* copy current drawn pattern
	   as array to clipboard
	   i.e. to add missing patterns
	*/
  Tegaki.copyStuff = function () {
    Tegaki.s = "";

    for (var i = 0, j = Tegaki.recordedPattern.length; i < j; i++) {
      console.log(i + 1, Tegaki.recordedPattern[i], Tegaki.recordedPattern[i].toString());
      console.log(Tegaki.recordedPattern[i]);
      console.log(JSON.stringify(Tegaki.recordedPattern[i]));
      Tegaki.s += "[" + JSON.stringify(Tegaki.recordedPattern[i]) + "],";
    }

    Tegaki.copyToClipboard(Tegaki.s);
  };

  Tegaki.copyToClipboard = function (str) {
    var el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  // event listener for shortcuts
  document.addEventListener("keydown", function (e) {
    if (Tegaki.canvas && e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        // undo
        case "z":
          e.preventDefault();
          Tegaki.deleteLast();
          break;

        // erase
        case "x":
          e.preventDefault();
          Tegaki.erase();
          break;

        default:
          break;
      }
    }
  });

  Tegaki.getStrokes = function () {
    return Tegaki.recordedPattern;
  };

  const createCanvasError = () =>
    new CanvasCtxNotFoundError(`CanvasRenderingContext2D for Canvas#${canvasId} was not found.`);

  const isTouchEvent = (e: unknown): e is TouchEvent => typeof e === "object" && e !== null && "changedTouches" in e;

  return Tegaki;
}
