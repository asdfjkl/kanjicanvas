import type { Position, Stroke, TegakiStroke } from "@tegaki/types/index";
import { CandidateContainerNotFoundError, CanvasCtxNotFoundError, InitializeError } from "./errors";

// TODO: private properties
// TODO: map
export interface Tegaki {
  refPatterns: Array<TegakiStroke>;
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
  dii: number;

  init: (id: string, refPatterns: Array<TegakiStroke>) => void | InitializeError;
  draw: (color?: string) => void | CanvasCtxNotFoundError;
  deleteLast: () => void | CanvasCtxNotFoundError;
  erase: () => void | CanvasCtxNotFoundError;
  redraw: () => void | CanvasCtxNotFoundError;
  recognize: () => void;
  copyStuff: () => void;
  copyToClipboard: (text: string) => void;

  find_x_y: (res: string, e: MouseEvent | TouchEvent) => void | CanvasCtxNotFoundError;
  alterHex: (hex: string, number: number, action: "inc" | "dec") => string;
  normalizeLinear: () => void;

  m10: (pattern: Array<Stroke>) => number;
  m01: (pattern: Array<Stroke>) => number;
  m00: (pattern: Array<Stroke>) => number;
  mu20: (pattern: Array<Stroke>, xc: number) => number;
  mu02: (pattern: Array<Stroke>, yc: number) => number;
  aran: (width: number, height: number) => number;
  chopOverBounds: (pattern: Array<Stroke>) => Array<Stroke>;
  transform: (pattern: Array<Stroke>, x_: number, y_: number) => Array<Stroke>;
  momentNormalize: () => Array<Stroke>;
  euclid: (x1y1: [number, number], x2y2: [number, number]) => number;
  extractFeatures: (input_data: Array<Stroke>, interval: number) => Array<Stroke>;
  endPointDistance: (pattern1: Stroke, pattern2: Stroke) => number;
  initialDistance: (pattern1: Stroke, pattern2: Stroke) => number;
  getLargerAndSize: <T extends Array<any>>(pattern1: T, pattern2: T) => [T, T, number, number];

  wholeWholeDistance: (pattern1: Stroke, pattern2: Stroke) => number;
  j_of_i: number;
  initStrokeMap: (
    pattern1: Array<Stroke>,
    pattern2: Array<Stroke>,
    distanceMetric: (a: Stroke, n: Stroke) => number,
  ) => Position;
  minDist: number;
  min_j: number;
  getMap: (
    pattern1: Array<Stroke>,
    pattern2: Array<Stroke>,
    distanceMetric: (a: Stroke, n: Stroke) => number,
  ) => Position;
  completeMap: (
    pattern1: Array<Stroke>,
    pattern2: Array<Stroke>,
    distanceMetric: (a: Stroke, n: Stroke) => number,
    map: Array<number>,
  ) => Array<number>;
  computeDistance: (
    pattern1: Array<Stroke>,
    pattern2: Array<Stroke>,
    distanceMetric: (a: Stroke, n: Stroke) => number,
    map: Array<number>,
  ) => number;

  computeWholeDistanceWeighted: (pattern1: Array<Stroke>, pattern2: Array<Stroke>, map: Position) => number;
  coarseClassification: (inputPattern: Array<Stroke>) => Stroke;
  fineClassification: (inputPattern: Array<Stroke>, inputCandidates: Stroke) => string;
}

export function createTegaki(document: Document): Tegaki {
  "use strict";

  // call Tegaki.init(id) to initialize a canvas as a Tegaki
  // `id` must be the id attribute of the canvas.
  // ex: Tegaki.init('canvas-1');
  const Tegaki = new Object() as Tegaki;

  // patterns loaded externally from ref-patterns.js (always run after Tegaki is defined)
  Tegaki.refPatterns = [];

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
  Tegaki.init = function (id, refPatterns) {
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

    Tegaki.refPatterns = refPatterns;
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

  // helper functions for moment normalization

  Tegaki.m10 = function (pattern) {
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      for (var j = 0; j < stroke_i.length; j++) {
        sum += stroke_i[j][0];
      }
    }
    return sum;
  };

  Tegaki.m01 = function (pattern) {
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      for (var j = 0; j < stroke_i.length; j++) {
        sum += stroke_i[j][1];
      }
    }
    return sum;
  };

  Tegaki.m00 = function (pattern) {
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      sum += stroke_i.length;
    }
    return sum;
  };

  Tegaki.mu20 = function (pattern, xc) {
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      for (var j = 0; j < stroke_i.length; j++) {
        var diff = stroke_i[j][0] - xc;
        sum += diff * diff;
      }
    }
    return sum;
  };

  Tegaki.mu02 = function (pattern, yc) {
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      for (var j = 0; j < stroke_i.length; j++) {
        var diff = stroke_i[j][1] - yc;
        sum += diff * diff;
      }
    }
    return sum;
  };

  Tegaki.aran = function (width, height) {
    var r1 = 0;
    if (height > width) {
      r1 = width / height;
    } else {
      r1 = height / width;
    }

    var a = Math.PI / 2;
    var b = a * r1;
    var b1 = Math.sin(b);
    var c = Math.sqrt(b1);
    var d = c;

    var r2 = Math.sqrt(Math.sin((Math.PI / 2) * r1));
    return r2;
  };

  Tegaki.chopOverBounds = function (pattern) {
    var chopped = new Array();
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      var c_stroke_i = new Array();
      for (var j = 0; j < stroke_i.length; j++) {
        var x = stroke_i[j][0];
        var y = stroke_i[j][1];
        if (x < 0) {
          x = 0;
        }
        if (x >= 256) {
          x = 255;
        }
        if (y < 0) {
          y = 0;
        }
        if (y >= 256) {
          y = 255;
        }
        c_stroke_i.push([x, y]);
      }
      chopped.push(c_stroke_i);
    }
    return chopped;
  };

  Tegaki.transform = function (pattern, x_, y_) {
    var pt = new Array();
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      var c_stroke_i = new Array();
      for (var j = 0; j < stroke_i.length; j++) {
        var x = stroke_i[j][0] + x_;
        var y = stroke_i[j][1] + y_;
        c_stroke_i.push([x, y]);
      }
      pt.push(c_stroke_i);
    }
    return pt;
  };

  // main function for moment normalization
  Tegaki.momentNormalize = function () {
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

    var r2 = Tegaki.aran(Tegaki.oldWidth, Tegaki.oldHeight);

    var aranWidth = Tegaki.newWidth;
    var aranHeight = Tegaki.newHeight;

    if (Tegaki.oldHeight > Tegaki.oldWidth) {
      aranWidth = r2 * Tegaki.newWidth;
    } else {
      aranHeight = r2 * Tegaki.newHeight;
    }

    var xOffset = (Tegaki.newWidth - aranWidth) / 2;
    var yOffset = (Tegaki.newHeight - aranHeight) / 2;

    var m00_ = Tegaki.m00(Tegaki.recordedPattern);
    var m01_ = Tegaki.m01(Tegaki.recordedPattern);
    var m10_ = Tegaki.m10(Tegaki.recordedPattern);

    var xc_ = m10_ / m00_;
    var yc_ = m01_ / m00_;

    var xc_half = aranWidth / 2;
    var yc_half = aranHeight / 2;

    var mu20_ = Tegaki.mu20(Tegaki.recordedPattern, xc_);
    var mu02_ = Tegaki.mu02(Tegaki.recordedPattern, yc_);

    var alpha = aranWidth / (4 * Math.sqrt(mu20_ / m00_)) || 0;
    var beta = aranHeight / (4 * Math.sqrt(mu02_ / m00_)) || 0;

    var nf = new Array();
    for (var i = 0; i < Tegaki.recordedPattern.length; i++) {
      var si = Tegaki.recordedPattern[i];
      var nsi = new Array();
      for (var j = 0; j < si.length; j++) {
        var newX = alpha * (si[j][0] - xc_) + xc_half;
        var newY = beta * (si[j][1] - yc_) + yc_half;

        nsi.push([newX, newY]);
      }
      nf.push(nsi);
    }

    return Tegaki.transform(nf, xOffset, yOffset);
  };

  // distance functions
  Tegaki.euclid = function (x1y1, x2y2) {
    var a = x1y1[0] - x2y2[0];
    var b = x1y1[1] - x2y2[1];
    var c = Math.sqrt(a * a + b * b);
    return c;
  };

  // extract points in regular intervals
  Tegaki.extractFeatures = function (input_data, interval) {
    var extractedPattern = new Array();
    var nrStrokes = input_data.length;
    for (var i = 0; i < nrStrokes; i++) {
      var stroke_i = input_data[i];
      var extractedStroke_i = new Array();
      var dist = 0.0;
      var j = 0;
      while (j < stroke_i.length) {
        // always add first point
        if (j == 0) {
          var x1y1 = stroke_i[0];
          extractedStroke_i.push(x1y1);
        }
        if (j > 0) {
          var x1y1 = stroke_i[j - 1];
          var x2y2 = stroke_i[j];
          dist += Tegaki.euclid(x1y1, x2y2);
        }
        if (dist >= interval && j > 1) {
          dist = dist - interval;
          var x1y1 = stroke_i[j];
          extractedStroke_i.push(x1y1);
        }
        j++;
      }
      // if we so far have only one point, always add last point
      if (extractedStroke_i.length == 1) {
        var x1y1 = stroke_i[stroke_i.length - 1];
        extractedStroke_i.push(x1y1);
      } else {
        if (dist > 0.75 * interval) {
          var x1y1 = stroke_i[stroke_i.length - 1];
          extractedStroke_i.push(x1y1);
        }
      }
      extractedPattern.push(extractedStroke_i);
    }
    return extractedPattern;
  };

  /* test extraction function
   Tegaki.extractTest = function () {
      //var ex = Tegaki.extractFeatures(Tegaki.recordedPattern, 20.);
	  //Tegaki.recordedPattern = ex;

      //Tegaki.redraw(id);

	  var norm = normalizeLinearTest(test4);
	  var ex = Tegaki.extractFeatures(norm, 20.);
	  //console.log(ex);

   }*/

  Tegaki.endPointDistance = function (pattern1, pattern2) {
    var dist = 0;
    var l1 = typeof pattern1 == "undefined" ? 0 : pattern1.length;
    var l2 = typeof pattern2 == "undefined" ? 0 : pattern2.length;
    if (l1 == 0 || l2 == 0) {
      return 0;
    } else {
      var x1y1 = pattern1[0];
      var x2y2 = pattern2[0];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
      x1y1 = pattern1[l1 - 1];
      x2y2 = pattern2[l2 - 1];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
    }
    return dist;
  };

  Tegaki.initialDistance = function (pattern1, pattern2) {
    var l1 = pattern1.length;
    var l2 = pattern2.length;
    var l_min = Math.min(l1, l2);
    var l_max = Math.max(l1, l2);
    var dist = 0;
    for (var i = 0; i < l_min; i++) {
      var x1y1 = pattern1[i];
      var x2y2 = pattern2[i];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
    }
    return dist * (l_max / l_min);
  };

  // given to pattern, determine longer (more strokes)
  // and return quadruple with sorted patterns and their
  // stroke numbers [k1,k2,n,m] where n >= m and
  // they denote the #of strokes of k1 and k2
  Tegaki.getLargerAndSize = function (pattern1, pattern2) {
    var l1 = typeof pattern1 == "undefined" ? 0 : pattern1.length;
    var l2 = typeof pattern2 == "undefined" ? 0 : pattern2.length;
    // definitions as in paper
    // i.e. n is larger
    var n = l1;
    var m = l2;
    var k1 = pattern1;
    var k2 = pattern2;
    if (l1 < l2) {
      m = l1;
      n = l2;
      k1 = pattern2;
      k2 = pattern1;
    }
    return [k1, k2, n, m];
  };

  Tegaki.wholeWholeDistance = function (pattern1, pattern2) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Tegaki.getLargerAndSize(pattern1, pattern2);
    var dist = 0;
    for (var i = 0; i < a[3]; i++) {
      Tegaki.j_of_i = parseInt((parseInt((a[2] / a[3]) as any) * i) as any);
      var x1y1 = a[0][Tegaki.j_of_i];
      var x2y2 = a[1][i];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
    }
    return parseInt((dist / a[3]) as any);
  };

  // initialize N-stroke map by greedy initialization
  Tegaki.initStrokeMap = function (pattern1, pattern2, distanceMetric) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Tegaki.getLargerAndSize(pattern1, pattern2);
    // larger is now k1 with length n
    var map = new Array() as Position;
    for (var i = 0; i < a[2]; i++) {
      map[i] = -1;
    }
    var free = new Array();
    for (var i = 0; i < a[2]; i++) {
      free[i] = true;
    }
    for (var i = 0; i < a[3]; i++) {
      Tegaki.minDist = 10000000;
      Tegaki.min_j = -1;
      for (var j = 0; j < a[2]; j++) {
        if (free[j] == true) {
          var d = distanceMetric(a[0][j], a[1][i]);
          if (d < Tegaki.minDist) {
            Tegaki.minDist = d;
            Tegaki.min_j = j;
          }
        }
      }
      free[Tegaki.min_j] = false;
      map[Tegaki.min_j] = i;
    }
    return map;
  };

  // get best N-stroke map by iterative improvement
  Tegaki.getMap = function (pattern1, pattern2, distanceMetric) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Tegaki.getLargerAndSize(pattern1, pattern2);
    // larger is now k1 with length n
    var L = 3;
    var map = Tegaki.initStrokeMap(a[0], a[1], distanceMetric);
    for (var l = 0; l < L; l++) {
      for (var i = 0; i < map.length; i++) {
        if (map[i] != -1) {
          Tegaki.dii = distanceMetric(a[0][i], a[1][map[i]]);
          for (var j = 0; j < map.length; j++) {
            // we need to check again, since
            // manipulation of map[i] can occur within
            // the j-loop
            if (map[i] != -1) {
              if (map[j] != -1) {
                var djj = distanceMetric(a[0][j], a[1][map[j]]);
                var dij = distanceMetric(a[0][j], a[1][map[i]]);
                var dji = distanceMetric(a[0][i], a[1][map[j]]);
                if (dji + dij < Tegaki.dii + djj) {
                  var map_j = map[j];
                  map[j] = map[i];
                  map[i] = map_j;
                  Tegaki.dii = dij;
                }
              } else {
                var dij = distanceMetric(a[0][j], a[1][map[i]]);
                if (dij < Tegaki.dii) {
                  map[j] = map[i];
                  map[i] = -1;
                  Tegaki.dii = dij;
                }
              }
            }
          }
        }
      }
    }
    return map;
  };

  // from optimal N-stroke map create M-N stroke map
  Tegaki.completeMap = function (pattern1, pattern2, distanceMetric, map) {
    // [k1, k2, _, _]
    // a[0], a[1], a[2], a[3]
    var a = Tegaki.getLargerAndSize(pattern1, pattern2);
    if (!map.includes(-1)) {
      return map;
    }
    // complete at the end
    var lastUnassigned = map[map.length];
    var mapLastTo = -1;
    for (var i = map.length - 1; i >= 0; i--) {
      if (map[i] == -1) {
        lastUnassigned = i;
      } else {
        mapLastTo = map[i];
        break;
      }
    }
    for (var i = lastUnassigned; i < map.length; i++) {
      map[i] = mapLastTo;
    }
    // complete at the beginning
    var firstUnassigned = -1;
    var mapFirstTo = -1;
    for (var i = 0; i < map.length; i++) {
      if (map[i] == -1) {
        firstUnassigned = i;
      } else {
        mapFirstTo = map[i];
        break;
      }
    }
    for (var i = 0; i <= firstUnassigned; i++) {
      map[i] = mapFirstTo;
    }
    // for the remaining unassigned, check
    // where to "split"
    for (var i = 0; i < map.length; i++) {
      if (i + 1 < map.length && map[i + 1] == -1) {
        // we have a situation like this:
        //   i       i+1   i+2   ...  i+n
        //   start   -1    ?     -1   stop
        var start = i;

        var stop = i + 1;
        while (stop < map.length && map[stop] == -1) {
          stop++;
        }

        var div = start;
        var max_dist = 1000000;
        for (var j = start; j < stop; j++) {
          var stroke_ab = a[0][start];
          // iteration of concat, possibly slow
          // due to memory allocations; optimize?!
          for (var temp = start + 1; temp <= j; temp++) {
            stroke_ab = stroke_ab.concat(a[0][temp]);
          }
          var stroke_bc = a[0][j + 1];

          for (var temp = j + 2; temp <= stop; temp++) {
            stroke_bc = stroke_bc.concat(a[0][temp]);
          }

          var d_ab = distanceMetric(stroke_ab, a[1][map[start]]);
          var d_bc = distanceMetric(stroke_bc, a[1][map[stop]]);
          if (d_ab + d_bc < max_dist) {
            div = j;
            max_dist = d_ab + d_bc;
          }
        }
        for (var j = start; j <= div; j++) {
          map[j] = map[start];
        }
        for (var j = div + 1; j < stop; j++) {
          map[j] = map[stop];
        }
      }
    }
    return map as [number, number];
  };

  // given two patterns, M-N stroke map and distanceMetric function,
  // compute overall distance between two patterns
  Tegaki.computeDistance = function (pattern1, pattern2, distanceMetric, map) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Tegaki.getLargerAndSize(pattern1, pattern2);
    var dist = 0.0;
    var idx = 0;
    while (idx < a[2]) {
      var stroke_idx = a[1][map[idx]];
      var start = idx;
      var stop = start + 1;
      while (stop < map.length && map[stop] == map[idx]) {
        stop++;
      }
      var stroke_concat = a[0][start];
      for (var temp = start + 1; temp < stop; temp++) {
        stroke_concat = stroke_concat.concat(a[0][temp]);
      }
      dist += distanceMetric(stroke_idx, stroke_concat);
      idx = stop;
    }
    return dist;
  };

  // given two patterns, M-N stroke_map, compute weighted (respect stroke
  // length when there are concatenated strokes using the wholeWhole distance
  Tegaki.computeWholeDistanceWeighted = function (pattern1, pattern2, map) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Tegaki.getLargerAndSize(pattern1, pattern2);
    var dist = 0.0;
    var idx = 0;
    while (idx < a[2]) {
      var stroke_idx = a[1][map[idx]];
      var start = idx;
      var stop = start + 1;
      while (stop < map.length && map[stop] == map[idx]) {
        stop++;
      }
      var stroke_concat = a[0][start];
      for (var temp = start + 1; temp < stop; temp++) {
        stroke_concat = stroke_concat.concat(a[0][temp]);
      }

      var dist_idx = Tegaki.wholeWholeDistance(stroke_idx, stroke_concat);
      if (stop > start + 1) {
        // concatenated stroke, adjust weight
        var mm = typeof stroke_idx == "undefined" ? 0 : stroke_idx.length;
        var nn = stroke_concat.length;
        if (nn < mm) {
          var temp = nn;
          nn = mm;
          mm = temp;
        }
        dist_idx = dist_idx * (nn / mm);
      }
      dist += dist_idx;
      idx = stop;
    }
    return dist;
  };

  // apply coarse classfication w.r.t. inputPattern
  // considering _all_ referencePatterns using endpoint distance
  Tegaki.coarseClassification = function (inputPattern) {
    var inputLength = inputPattern.length;
    var candidates: Stroke = [];
    for (var i = 0; i < Tegaki.refPatterns.length; i++) {
      var iLength = Tegaki.refPatterns[i][1];
      if (inputLength < iLength + 2 && inputLength > iLength - 3) {
        var iPattern = Tegaki.refPatterns[i][2];
        var iMap = Tegaki.getMap(iPattern, inputPattern, Tegaki.endPointDistance);
        iMap = Tegaki.completeMap(iPattern, inputPattern, Tegaki.endPointDistance, iMap) as Position;
        var dist = Tegaki.computeDistance(iPattern, inputPattern, Tegaki.endPointDistance, iMap);
        var m = iLength;
        var n = iPattern.length;
        if (n < m) {
          var temp = n;
          n = m;
          m = temp;
        }
        candidates.push([i, dist * (m / n)]);
      }
    }
    candidates.sort(function (a, b) {
      return a[1] - b[1];
    });
    /*
	   var outStr = "";
	   for(var i=0;i<candidates.length;i++) {
	       outStr += candidates[i][0];
		   outStr += " ";
		   outStr += candidates[i][1];
		   outStr += Tegaki.refPatterns[candidates[i][0]][0];
		   outStr += "|";
	   }
	   document.getElementById("coarseCandidateList").innerHTML = outStr;
	   */
    return candidates;
  };

  // fine classfication. returns best 100 matches for inputPattern
  // and candidate list (which should be provided by coarse classification
  Tegaki.fineClassification = function (inputPattern, inputCandidates) {
    var inputLength = inputPattern.length;
    var candidates = [];
    for (var i = 0; i < Math.min(inputCandidates.length, 100); i++) {
      var j = inputCandidates[i][0];
      var iLength = Tegaki.refPatterns[j][1];
      var iPattern = Tegaki.refPatterns[j][2];
      if (inputLength < iLength + 2 && inputLength > iLength - 3) {
        var iMap = Tegaki.getMap(iPattern, inputPattern, Tegaki.initialDistance);

        iMap = Tegaki.completeMap(iPattern, inputPattern, Tegaki.wholeWholeDistance, iMap) as Position;
        if (Tegaki.refPatterns[j][0] == "委") {
          console.log("finished imap, fine:");
          console.log(iMap);
          console.log("weight:");
          console.log(Tegaki.computeDistance(iPattern, inputPattern, Tegaki.wholeWholeDistance, iMap));
          console.log("weight intended:");
          console.log(
            Tegaki.computeDistance(iPattern, inputPattern, Tegaki.wholeWholeDistance, [0, 1, 2, 3, 4, 7, 5, 6]),
          );
        }
        var dist = Tegaki.computeWholeDistanceWeighted(iPattern, inputPattern, iMap);
        var n = inputLength;
        var m = iPattern.length;
        if (m > n) {
          m = n;
        }
        dist = dist / m;
        candidates.push([j, dist]);
      }
    }
    candidates.sort(function (a, b) {
      return a[1] - b[1];
    });
    var outStr = "";
    for (var i = 0; i < Math.min(candidates.length, 10); i++) {
      //outStr += candidates[i][0];
      //outStr += " ";
      //outStr += candidates[i][1];
      outStr += Tegaki.refPatterns[candidates[i][0]][0];
      outStr += "  ";
    }
    //document.getElementById("candidateList").innerHTML = outStr;

    return outStr;
  };

  /* test function for N-pair and M-N stroke map computation
	 Tegaki.testMap = function() {
	  // var map = initStrokeMap(test_k21,test_k2,endPointDistance);
	    // should give
        // 0  1  2 3
        // 0 -1 -1 1
	  var map = getMap(test_k21,test_k2,endPointDistance);
	    // should also give
        // 0  1  2 3
        // 0 -1 -1 1
	  map = completeMap(test_k21,test_k2,endPointDistance, map);
	    // should give
        // 0  1  2 3
        // 0 0 1 1
	  console.log(map);

	  map = getMap(test_k22,test_k2,endPointDistance);
	    // 0  1  2 3
        // 0 -1 -1 1
	  map = completeMap(test_k22,test_k2,endPointDistance, map);
       // 0 1 2 3
        // 0 0 0 1
	  console.log(map);

	  	  map = getMap(test_k23,test_k2,endPointDistance);
        // 0  1  2 3
        // 0 -1 -1 1
	  map = completeMap(test_k23,test_k2,endPointDistance, map);
        // 0  1  2 3
        // 0  1  1 1
	  console.log(map);
	}
	*/

  Tegaki.recognize = function () {
    var mn = Tegaki.momentNormalize();

    var extractedFeatures = Tegaki.extractFeatures(mn, 20);

    var map = Tegaki.getMap(extractedFeatures, Tegaki.refPatterns[0][2], Tegaki.endPointDistance);
    map = Tegaki.completeMap(extractedFeatures, Tegaki.refPatterns[0][2], Tegaki.endPointDistance, map) as Position;

    var candidates = Tegaki.coarseClassification(extractedFeatures);

    Tegaki.redraw();

    // display candidates in the specified element
    if (Tegaki.canvas.dataset.candidateList) {
      const candidateContainer = document.getElementById(Tegaki.canvas.dataset.candidateList);
      if (!candidateContainer) {
        return new CandidateContainerNotFoundError(
          `Candidate container not found. #${Tegaki.canvas.dataset.candidateList}`,
        );
      }
      candidateContainer.innerHTML = Tegaki.fineClassification(extractedFeatures, candidates);
    }

    // otherwise log the result to the console if no candidateList is specified
    else {
      return Tegaki.fineClassification(extractedFeatures, candidates);
    }
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

        // recognize
        case "f":
          e.preventDefault();
          Tegaki.recognize();
          break;

        default:
          break;
      }
    }
  });

  const createCanvasError = () =>
    new CanvasCtxNotFoundError(`CanvasRenderingContext2D for Canvas#${canvasId} was not found.`);

  const isTouchEvent = (e: unknown): e is TouchEvent => typeof e === "object" && e !== null && "changedTouches" in e;

  return Tegaki;
}
