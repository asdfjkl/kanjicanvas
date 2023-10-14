export function OcrFactory(document) {
  "use strict";

  // call Ocr.init(id) to initialize a canvas as a Ocr
  // `id` must be the id attribute of the canvas.
  // ex: Ocr.init('canvas-1');
  const Ocr = new Object();

  // patterns loaded externally from ref-patterns.js (always run after Ocr is defined)
  Ocr.refPatterns = [];

  // color coded stroke colors (for 30 strokes)
  // based on https://kanjivg.tagaini.net/viewer.html
  Ocr.strokeColors = [
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

  // init canvas
  Ocr.init = function (id) {
    Ocr["canvas_" + id] = document.getElementById(id);
    Ocr["canvas_" + id].tabIndex = 0; // makes canvas focusable, allowing usage of shortcuts
    Ocr["ctx_" + id] = Ocr["canvas_" + id].getContext("2d");
    Ocr["w_" + id] = Ocr["canvas_" + id].width;
    Ocr["h_" + id] = Ocr["canvas_" + id].height;
    Ocr["flagOver_" + id] = false;
    Ocr["flagDown_" + id] = false;
    Ocr["prevX_" + id] = 0;
    Ocr["currX_" + id] = 0;
    Ocr["prevY_" + id] = 0;
    Ocr["currY_" + id] = 0;
    Ocr["dot_flag_" + id] = false;
    Ocr["recordedPattern_" + id] = new Array();
    Ocr["currentLine_" + id] = null;

    Ocr["canvas_" + id].addEventListener(
      "mousemove",
      function (e) {
        Ocr.findxy("move", e, id);
      },
      false
    );
    Ocr["canvas_" + id].addEventListener(
      "mousedown",
      function (e) {
        Ocr.findxy("down", e, id);
      },
      false
    );
    Ocr["canvas_" + id].addEventListener(
      "mouseup",
      function (e) {
        Ocr.findxy("up", e, id);
      },
      false
    );
    Ocr["canvas_" + id].addEventListener(
      "mouseout",
      function (e) {
        Ocr.findxy("out", e, id);
      },
      false
    );
    Ocr["canvas_" + id].addEventListener(
      "mouseover",
      function (e) {
        Ocr.findxy("over", e, id);
      },
      false
    );

    // touch events
    Ocr["canvas_" + id].addEventListener(
      "touchmove",
      function (e) {
        Ocr.findxy("move", e, id);
      },
      false
    );
    Ocr["canvas_" + id].addEventListener(
      "touchstart",
      function (e) {
        Ocr.findxy("down", e, id);
      },
      false
    );
    Ocr["canvas_" + id].addEventListener(
      "touchend",
      function (e) {
        Ocr.findxy("up", e, id);
      },
      false
    );
  };

  Ocr.draw = function (id, color) {
    Ocr["ctx_" + id].beginPath();
    Ocr["ctx_" + id].moveTo(Ocr["prevX_" + id], Ocr["prevY_" + id]);
    Ocr["ctx_" + id].lineTo(Ocr["currX_" + id], Ocr["currY_" + id]);
    Ocr["ctx_" + id].strokeStyle = color ? color : "#333";
    Ocr["ctx_" + id].lineCap = "round";
    //Ocr["ctx_" + id].lineJoin = "round";
    //Ocr["ctx_" + id].lineMiter = "round";
    Ocr["ctx_" + id].lineWidth = 4;
    Ocr["ctx_" + id].stroke();
    Ocr["ctx_" + id].closePath();
  };

  Ocr.deleteLast = function (id) {
    Ocr["ctx_" + id].clearRect(0, 0, Ocr["w_" + id], Ocr["h_" + id]);
    for (var i = 0; i < Ocr["recordedPattern_" + id].length - 1; i++) {
      var stroke_i = Ocr["recordedPattern_" + id][i];
      for (var j = 0; j < stroke_i.length - 1; j++) {
        Ocr["prevX_" + id] = stroke_i[j][0];
        Ocr["prevY_" + id] = stroke_i[j][1];

        Ocr["currX_" + id] = stroke_i[j + 1][0];
        Ocr["currY_" + id] = stroke_i[j + 1][1];
        Ocr.draw(id);
      }
    }
    Ocr["recordedPattern_" + id].pop();
  };

  Ocr.erase = function (id) {
    Ocr["ctx_" + id].clearRect(0, 0, Ocr["w_" + id], Ocr["h_" + id]);
    Ocr["recordedPattern_" + id].length = 0;
  };

  Ocr.findxy = function (res, e, id) {
    var touch = e.changedTouches ? e.changedTouches[0] : null;

    if (touch) e.preventDefault(); // prevent scrolling while drawing to the canvas

    if (res == "down") {
      var rect = Ocr["canvas_" + id].getBoundingClientRect();
      Ocr["prevX_" + id] = Ocr["currX_" + id];
      Ocr["prevY_" + id] = Ocr["currY_" + id];
      Ocr["currX_" + id] = (touch ? touch.clientX : e.clientX) - rect.left;
      Ocr["currY_" + id] = (touch ? touch.clientY : e.clientY) - rect.top;
      Ocr["currentLine_" + id] = new Array();
      Ocr["currentLine_" + id].push([Ocr["currX_" + id], Ocr["currY_" + id]]);

      Ocr["flagDown_" + id] = true;
      Ocr["flagOver_" + id] = true;
      Ocr["dot_flag_" + id] = true;
      if (Ocr["dot_flag_" + id]) {
        Ocr["ctx_" + id].beginPath();
        Ocr["ctx_" + id].fillRect(Ocr["currX_" + id], Ocr["currY_" + id], 2, 2);
        Ocr["ctx_" + id].closePath();
        Ocr["dot_flag_" + id] = false;
      }
    }
    if (res == "up") {
      Ocr["flagDown_" + id] = false;
      if (Ocr["flagOver_" + id] == true) {
        Ocr["recordedPattern_" + id].push(Ocr["currentLine_" + id]);
      }
    }

    if (res == "out") {
      Ocr["flagOver_" + id] = false;
      if (Ocr["flagDown_" + id] == true) {
        Ocr["recordedPattern_" + id].push(Ocr["currentLine_" + id]);
      }
      Ocr["flagDown_" + id] = false;
    }

    /*
	if (res == "over") {
    }
	*/

    if (res == "move") {
      if (Ocr["flagOver_" + id] && Ocr["flagDown_" + id]) {
        var rect = Ocr["canvas_" + id].getBoundingClientRect();
        Ocr["prevX_" + id] = Ocr["currX_" + id];
        Ocr["prevY_" + id] = Ocr["currY_" + id];
        Ocr["currX_" + id] = (touch ? touch.clientX : e.clientX) - rect.left;
        Ocr["currY_" + id] = (touch ? touch.clientY : e.clientY) - rect.top;
        Ocr["currentLine_" + id].push([Ocr["prevX_" + id], Ocr["prevY_" + id]]);
        Ocr["currentLine_" + id].push([Ocr["currX_" + id], Ocr["currY_" + id]]);
        Ocr.draw(id);
      }
    }
  };

  // redraw to current canvas according to
  // what is currently stored in Ocr["recordedPattern_" + id]
  // add numbers to each stroke
  Ocr.redraw = function (id) {
    Ocr["ctx_" + id].clearRect(0, 0, Ocr["w_" + id], Ocr["h_" + id]);

    // draw strokes
    for (var i = 0; i < Ocr["recordedPattern_" + id].length; i++) {
      var stroke_i = Ocr["recordedPattern_" + id][i];

      for (var j = 0; j < stroke_i.length - 1; j++) {
        Ocr["prevX_" + id] = stroke_i[j][0];
        Ocr["prevY_" + id] = stroke_i[j][1];

        Ocr["currX_" + id] = stroke_i[j + 1][0];
        Ocr["currY_" + id] = stroke_i[j + 1][1];
        Ocr.draw(id, Ocr.strokeColors[i]);
      }
    }

    // draw stroke numbers
    if (Ocr["canvas_" + id].dataset.strokeNumbers != "false") {
      for (var i = 0; i < Ocr["recordedPattern_" + id].length; i++) {
        var stroke_i = Ocr["recordedPattern_" + id][i],
          x = stroke_i[Math.floor(stroke_i.length / 2)][0] + 5,
          y = stroke_i[Math.floor(stroke_i.length / 2)][1] - 5;

        Ocr["ctx_" + id].font = "20px Arial";

        // outline
        Ocr["ctx_" + id].lineWidth = 3;
        Ocr["ctx_" + id].strokeStyle = Ocr.alterHex(
          Ocr.strokeColors[i] ? Ocr.strokeColors[i] : "#333333",
          60,
          "dec"
        );
        Ocr["ctx_" + id].strokeText((i + 1).toString(), x, y);

        // fill
        Ocr["ctx_" + id].fillStyle = Ocr.strokeColors[i]
          ? Ocr.strokeColors[i]
          : "#333";
        Ocr["ctx_" + id].fillText((i + 1).toString(), x, y);
      }
    }
  };

  // modifies hex colors to darken or lighten them
  // ex: Ocr.alterHex(Ocr.strokeColors[0], 60, 'dec'); // decrement all colors by 60 (use 'inc' to increment)
  Ocr.alterHex = function (hex, number, action) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
      color = [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ],
      i = 0,
      j = color.length;

    for (; i < j; i++) {
      switch (action) {
        case "inc":
          color[i] = (
            color[i] + number > 255 ? 255 : color[i] + number
          ).toString(16);
          break;

        case "dec":
          color[i] = (color[i] - number < 0 ? 0 : color[i] - number).toString(
            16
          );
          break;

        default:
          break;
      }

      // add trailing 0
      if (color[i].length == 1) color[i] = color[i] + "0";
    }

    return "#" + color.join("");
  };

  // linear normalization for Ocr["recordedPattern_" + id]
  Ocr.normalizeLinear = function (id) {
    var normalizedPattern = new Array();
    Ocr.newHeight = 256;
    Ocr.newWidth = 256;
    Ocr.xMin = 256;
    Ocr.xMax = 0;
    Ocr.yMin = 256;
    Ocr.yMax = 0;
    // first determine drawn character width / length
    for (var i = 0; i < Ocr["recordedPattern_" + id].length; i++) {
      var stroke_i = Ocr["recordedPattern_" + id][i];
      for (var j = 0; j < stroke_i.length; j++) {
        Ocr.x = stroke_i[j][0];
        Ocr.y = stroke_i[j][1];
        if (Ocr.x < Ocr.xMin) {
          Ocr.xMin = Ocr.x;
        }
        if (Ocr.x > Ocr.xMax) {
          Ocr.xMax = Ocr.x;
        }
        if (Ocr.y < Ocr.yMin) {
          Ocr.yMin = Ocr.y;
        }
        if (Ocr.y > Ocr.yMax) {
          Ocr.yMax = Ocr.y;
        }
      }
    }
    Ocr.oldHeight = Math.abs(Ocr.yMax - Ocr.yMin);
    Ocr.oldWidth = Math.abs(Ocr.xMax - Ocr.xMin);

    for (var i = 0; i < Ocr["recordedPattern_" + id].length; i++) {
      var stroke_i = Ocr["recordedPattern_" + id][i];
      var normalized_stroke_i = new Array();
      for (var j = 0; j < stroke_i.length; j++) {
        Ocr.x = stroke_i[j][0];
        Ocr.y = stroke_i[j][1];
        Ocr.xNorm = (Ocr.x - Ocr.xMin) * (Ocr.newWidth / Ocr.oldWidth);
        Ocr.yNorm = (Ocr.y - Ocr.yMin) * (Ocr.newHeight / Ocr.oldHeight);
        normalized_stroke_i.push([Ocr.xNorm, Ocr.yNorm]);
      }
      normalizedPattern.push(normalized_stroke_i);
    }
    Ocr["recordedPattern_" + id] = normalizedPattern;
    Ocr.redraw(id);
  };

  // helper functions for moment normalization

  Ocr.m10 = function (pattern) {
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      for (var j = 0; j < stroke_i.length; j++) {
        sum += stroke_i[j][0];
      }
    }
    return sum;
  };

  Ocr.m01 = function (pattern) {
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      for (var j = 0; j < stroke_i.length; j++) {
        sum += stroke_i[j][1];
      }
    }
    return sum;
  };

  Ocr.m00 = function (pattern) {
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) {
      var stroke_i = pattern[i];
      sum += stroke_i.length;
    }
    return sum;
  };

  Ocr.mu20 = function (pattern, xc) {
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

  Ocr.mu02 = function (pattern, yc) {
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

  Ocr.aran = function (width, height) {
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

  Ocr.chopOverbounds = function (pattern) {
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

  Ocr.transform = function (pattern, x_, y_) {
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
  Ocr.momentNormalize = function (id) {
    Ocr.newHeight = 256;
    Ocr.newWidth = 256;
    Ocr.xMin = 256;
    Ocr.xMax = 0;
    Ocr.yMin = 256;
    Ocr.yMax = 0;
    // first determine drawn character width / length
    for (var i = 0; i < Ocr["recordedPattern_" + id].length; i++) {
      var stroke_i = Ocr["recordedPattern_" + id][i];
      for (var j = 0; j < stroke_i.length; j++) {
        Ocr.x = stroke_i[j][0];
        Ocr.y = stroke_i[j][1];
        if (Ocr.x < Ocr.xMin) {
          Ocr.xMin = Ocr.x;
        }
        if (Ocr.x > Ocr.xMax) {
          Ocr.xMax = Ocr.x;
        }
        if (Ocr.y < Ocr.yMin) {
          Ocr.yMin = Ocr.y;
        }
        if (Ocr.y > Ocr.yMax) {
          Ocr.yMax = Ocr.y;
        }
      }
    }
    Ocr.oldHeight = Math.abs(Ocr.yMax - Ocr.yMin);
    Ocr.oldWidth = Math.abs(Ocr.xMax - Ocr.xMin);

    var r2 = Ocr.aran(Ocr.oldWidth, Ocr.oldHeight);

    var aranWidth = Ocr.newWidth;
    var aranHeight = Ocr.newHeight;

    if (Ocr.oldHeight > Ocr.oldWidth) {
      aranWidth = r2 * Ocr.newWidth;
    } else {
      aranHeight = r2 * Ocr.newHeight;
    }

    var xOffset = (Ocr.newWidth - aranWidth) / 2;
    var yOffset = (Ocr.newHeight - aranHeight) / 2;

    var m00_ = Ocr.m00(Ocr["recordedPattern_" + id]);
    var m01_ = Ocr.m01(Ocr["recordedPattern_" + id]);
    var m10_ = Ocr.m10(Ocr["recordedPattern_" + id]);

    var xc_ = m10_ / m00_;
    var yc_ = m01_ / m00_;

    var xc_half = aranWidth / 2;
    var yc_half = aranHeight / 2;

    var mu20_ = Ocr.mu20(Ocr["recordedPattern_" + id], xc_);
    var mu02_ = Ocr.mu02(Ocr["recordedPattern_" + id], yc_);

    var alpha = aranWidth / (4 * Math.sqrt(mu20_ / m00_)) || 0;
    var beta = aranHeight / (4 * Math.sqrt(mu02_ / m00_)) || 0;

    var nf = new Array();
    for (var i = 0; i < Ocr["recordedPattern_" + id].length; i++) {
      var si = Ocr["recordedPattern_" + id][i];
      var nsi = new Array();
      for (var j = 0; j < si.length; j++) {
        var newX = alpha * (si[j][0] - xc_) + xc_half;
        var newY = beta * (si[j][1] - yc_) + yc_half;

        nsi.push([newX, newY]);
      }
      nf.push(nsi);
    }

    return Ocr.transform(nf, xOffset, yOffset);
  };

  // distance functions
  Ocr.euclid = function (x1y1, x2y2) {
    var a = x1y1[0] - x2y2[0];
    var b = x1y1[1] - x2y2[1];
    var c = Math.sqrt(a * a + b * b);
    return c;
  };

  // extract points in regular intervals
  Ocr.extractFeatures = function (input_data, interval) {
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
          dist += Ocr.euclid(x1y1, x2y2);
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
   Ocr.extractTest = function () {
      //var ex = Ocr.extractFeatures(Ocr["recordedPattern_" + id], 20.);
	  //Ocr["recordedPattern_" + id] = ex;

      //Ocr.redraw(id);

	  var norm = normalizeLinearTest(test4);
	  var ex = Ocr.extractFeatures(norm, 20.);
	  //console.log(ex);

   }*/

  Ocr.endPointDistance = function (pattern1, pattern2) {
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

  Ocr.initialDistance = function (pattern1, pattern2) {
    var l1 = pattern1.length;
    var l2 = pattern2.length;
    var lmin = Math.min(l1, l2);
    var lmax = Math.max(l1, l2);
    var dist = 0;
    for (var i = 0; i < lmin; i++) {
      var x1y1 = pattern1[i];
      var x2y2 = pattern2[i];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
    }
    return dist * (lmax / lmin);
  };

  // given to pattern, determine longer (more strokes)
  // and return quadruple with sorted patterns and their
  // stroke numbers [k1,k2,n,m] where n >= m and
  // they denote the #of strokes of k1 and k2
  Ocr.getLargerAndSize = function (pattern1, pattern2) {
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

  Ocr.wholeWholeDistance = function (pattern1, pattern2) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Ocr.getLargerAndSize(pattern1, pattern2);
    var dist = 0;
    for (var i = 0; i < a[3]; i++) {
      Ocr.j_of_i = parseInt(parseInt(a[2] / a[3]) * i);
      var x1y1 = a[0][Ocr.j_of_i];
      var x2y2 = a[1][i];
      dist += Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]);
    }
    return parseInt(dist / a[3]);
  };

  // initialize N-stroke map by greedy initialization
  Ocr.initStrokeMap = function (pattern1, pattern2, distanceMetric) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Ocr.getLargerAndSize(pattern1, pattern2);
    // larger is now k1 with length n
    var map = new Array();
    for (var i = 0; i < a[2]; i++) {
      map[i] = -1;
    }
    var free = new Array();
    for (var i = 0; i < a[2]; i++) {
      free[i] = true;
    }
    for (var i = 0; i < a[3]; i++) {
      Ocr.minDist = 10000000;
      Ocr.min_j = -1;
      for (var j = 0; j < a[2]; j++) {
        if (free[j] == true) {
          var d = distanceMetric(a[0][j], a[1][i]);
          if (d < Ocr.minDist) {
            Ocr.minDist = d;
            Ocr.min_j = j;
          }
        }
      }
      free[Ocr.min_j] = false;
      map[Ocr.min_j] = i;
    }
    return map;
  };

  // get best N-stroke map by iterative improvement
  Ocr.getMap = function (pattern1, pattern2, distanceMetric) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Ocr.getLargerAndSize(pattern1, pattern2);
    // larger is now k1 with length n
    var L = 3;
    var map = Ocr.initStrokeMap(a[0], a[1], distanceMetric);
    for (var l = 0; l < L; l++) {
      for (var i = 0; i < map.length; i++) {
        if (map[i] != -1) {
          Ocr.dii = distanceMetric(a[0][i], a[1][map[i]]);
          for (var j = 0; j < map.length; j++) {
            // we need to check again, since
            // manipulation of map[i] can occur within
            // the j-loop
            if (map[i] != -1) {
              if (map[j] != -1) {
                var djj = distanceMetric(a[0][j], a[1][map[j]]);
                var dij = distanceMetric(a[0][j], a[1][map[i]]);
                var dji = distanceMetric(a[0][i], a[1][map[j]]);
                if (dji + dij < Ocr.dii + djj) {
                  var mapj = map[j];
                  map[j] = map[i];
                  map[i] = mapj;
                  Ocr.dii = dij;
                }
              } else {
                var dij = distanceMetric(a[0][j], a[1][map[i]]);
                if (dij < Ocr.dii) {
                  map[j] = map[i];
                  map[i] = -1;
                  Ocr.dii = dij;
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
  Ocr.completeMap = function (pattern1, pattern2, distanceMetric, map) {
    // [k1, k2, _, _]
    // a[0], a[1], a[2], a[3]
    var a = Ocr.getLargerAndSize(pattern1, pattern2);
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
    return map;
  };

  // given two patterns, M-N stroke map and distanceMetric function,
  // compute overall distance between two patterns
  Ocr.computeDistance = function (pattern1, pattern2, distanceMetric, map) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Ocr.getLargerAndSize(pattern1, pattern2);
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

  // given two patterns, M-N strokemap, compute weighted (respect stroke
  // length when there are concatenated strokes using the wholeWhole distance
  Ocr.computeWholeDistanceWeighted = function (pattern1, pattern2, map) {
    // [k1, k2, n, m]
    // a[0], a[1], a[2], a[3]
    var a = Ocr.getLargerAndSize(pattern1, pattern2);
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

      var dist_idx = Ocr.wholeWholeDistance(stroke_idx, stroke_concat);
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

  // apply coarse classficiation w.r.t. inputPattern
  // considering _all_ referencePatterns using endpoint distance
  Ocr.coarseClassification = function (inputPattern) {
    var inputLength = inputPattern.length;
    var candidates = [];
    for (var i = 0; i < Ocr.refPatterns.length; i++) {
      var iLength = Ocr.refPatterns[i][1];
      if (inputLength < iLength + 2 && inputLength > iLength - 3) {
        var iPattern = Ocr.refPatterns[i][2];
        var iMap = Ocr.getMap(iPattern, inputPattern, Ocr.endPointDistance);
        iMap = Ocr.completeMap(
          iPattern,
          inputPattern,
          Ocr.endPointDistance,
          iMap
        );
        var dist = Ocr.computeDistance(
          iPattern,
          inputPattern,
          Ocr.endPointDistance,
          iMap
        );
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
		   outStr += Ocr.refPatterns[candidates[i][0]][0];
		   outStr += "|";
	   }
	   document.getElementById("coarseCandidateList").innerHTML = outStr;
	   */
    return candidates;
  };

  // fine classfication. returns best 100 matches for inputPattern
  // and candidate list (which should be provided by coarse classification
  Ocr.fineClassification = function (inputPattern, inputCandidates) {
    var inputLength = inputPattern.length;
    var candidates = [];
    for (var i = 0; i < Math.min(inputCandidates.length, 100); i++) {
      var j = inputCandidates[i][0];
      var iLength = Ocr.refPatterns[j][1];
      var iPattern = Ocr.refPatterns[j][2];
      if (inputLength < iLength + 2 && inputLength > iLength - 3) {
        var iMap = Ocr.getMap(iPattern, inputPattern, Ocr.initialDistance);

        iMap = Ocr.completeMap(
          iPattern,
          inputPattern,
          Ocr.wholeWholeDistance,
          iMap
        );
        if (Ocr.refPatterns[j][0] == "委") {
          console.log("finished imap, fine:");
          console.log(iMap);
          console.log("weight:");
          console.log(
            Ocr.computeDistance(
              iPattern,
              inputPattern,
              Ocr.wholeWholeDistance,
              iMap
            )
          );
          console.log("weight intended:");
          console.log(
            Ocr.computeDistance(
              iPattern,
              inputPattern,
              Ocr.wholeWholeDistance,
              [0, 1, 2, 3, 4, 7, 5, 6]
            )
          );
        }
        var dist = Ocr.computeWholeDistanceWeighted(
          iPattern,
          inputPattern,
          iMap
        );
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
      outStr += Ocr.refPatterns[candidates[i][0]][0];
      outStr += "  ";
    }
    //document.getElementById("candidateList").innerHTML = outStr;

    return outStr;
  };

  /* test function for N-pair and M-N stroke map computation
	 Ocr.testMap = function() {
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

  Ocr.recognize = function (id) {
    var mn = Ocr.momentNormalize(id);

    var extractedFeatures = Ocr.extractFeatures(mn, 20);

    var map = Ocr.getMap(
      extractedFeatures,
      Ocr.refPatterns[0][2],
      Ocr.endPointDistance
    );
    map = Ocr.completeMap(
      extractedFeatures,
      Ocr.refPatterns[0][2],
      Ocr.endPointDistance,
      map
    );

    var candidates = Ocr.coarseClassification(extractedFeatures);

    Ocr.redraw(id);

    // display candidates in the specified element
    if (Ocr["canvas_" + id].dataset.candidateList) {
      document.getElementById(
        Ocr["canvas_" + id].dataset.candidateList
      ).innerHTML = Ocr.fineClassification(extractedFeatures, candidates);
    }

    // otherwise log the result to the console if no candidateList is specified
    else {
      return Ocr.fineClassification(extractedFeatures, candidates);
    }
  };

  /* test moment normalization
	function MomentTest() {
	  Ocr["recordedPattern_" + id] = test4;
	  var mn = Ocr.momentNormalize(id);
	  Ocr["recordedPattern_" + id] = mn;
	  console.log(mn);
	  Ocr.redraw(id);

	} */

  /* copy current drawn pattern
	   as array to clipboard
	   i.e. to add missing patterns
	*/
  Ocr.copyStuff = function (id) {
    Ocr.s = "";

    for (var i = 0, j = Ocr["recordedPattern_" + id].length; i < j; i++) {
      console.log(
        i + 1,
        Ocr["recordedPattern_" + id][i],
        Ocr["recordedPattern_" + id][i].toString()
      );
      console.log(Ocr["recordedPattern_" + id][i]);
      console.log(JSON.stringify(Ocr["recordedPattern_" + id][i]));
      Ocr.s += "[" + JSON.stringify(Ocr["recordedPattern_" + id][i]) + "],";
    }

    Ocr.copyToClipboard(Ocr.s);
  };

  Ocr.copyToClipboard = function (str) {
    var el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  // event listener for shortcuts
  document.addEventListener("keydown", function (e) {
    var id = document.activeElement.id;

    if (Ocr["canvas_" + id] && e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        // undo
        case "z":
          e.preventDefault();
          Ocr.deleteLast(id);
          break;

        // erase
        case "x":
          e.preventDefault();
          Ocr.erase(id);
          break;

        // recognize
        case "f":
          e.preventDefault();
          Ocr.recognize(id);
          break;

        default:
          break;
      }
    }
  });

  return Ocr;
}
