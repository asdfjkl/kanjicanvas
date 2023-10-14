# Stroke order and stroke number free online Japanese (Kanji) Handwriting Recognition

This is an implementation of stroke order and stroke number free online Japanese (Kanji) Handwriting Recognition
in client side only Javascript. Subjectively it provides much more robust recognition than many other implementations out there.

**Contents**

- [Demo](#demo)
- [Usage](#usage)
- [Adding New refPatterns](#adding-new-refPatterns)
- [Copyright and License](#copyright-and-license)

## Demo

Try it out in your browser [HERE](https://asdfjkl.github.io/kanjicanvas/)!

## Usage

To use Kanji Canvas on your website simply include the following javascript files which are located in the [docs/resources/javascript](https://github.com/asdfjkl/kanjicanvas/tree/master/docs/resources/javascript) folder.

```html
<script src="kanji-canvas.min.js"></script>
<script src="ref-patterns.js"></script>
```

Once installed, you can use the following functions.

- [init](#kanjicanvasinitid)
- [erase](#kanjicanvaseraseid)
- [deleteLast](#kanjicanvasdeletelastid)
- [recognize](#kanjicanvasrecognizeid)

#### KanjiCanvas.init(ID)

Call this function to initialize a canvas as a Kanji Canvas. **ID** should be the id of your canvas. Example:

##### HTML

```html
<canvas id="can" width="256" height="256"></canvas>
```

##### JavaScript

```javascript
KanjiCanvas.init("can");
```

Multiple canvases may be initialized as a Kanji Canvas, so long as the id is not the same.

#### KanjiCanvas.erase(ID)

Erases the strokes of the specified canvas. Just like `init`, you must specify the id of the canvas.

```javascript
KanjiCanvas.erase("can");
```

#### KanjiCanvas.deleteLast(ID)

Erases the most recent stroke of the specified canvas. Just like `init`, you must specify the id of the canvas.

```javascript
KanjiCanvas.deleteLast("can");
```

#### KanjiCanvas.recognize(ID)

Analyzes the strokes and returns a list of candidates that match. Just like `init`, you must specify the id of the canvas.

```javascript
KanjiCanvas.recognize("can");
```

If you want to physically display the results on the page, you must specify the id of the candidate list element, by adding the `data-candidate-list="ID"` attribute to your canvas. Example:

##### HTML

```html
<canvas id="can" data-candidate-list="candidateList" width="256" height="256"></canvas>
<div id="candidateList"></div>
```

Calling `recognize` like this will display the candidates inside of `#candidateList`.

If `data-candidate-list` is not specified, the results are returned as a string for you to manipulate as you please.

### Adding New refPatterns

To add new refPatterns you must download [jTegaki](https://github.com/asdfjkl/kanjicanvas/files/4936570/jTegaki.zip) and follow the steps below.

1. If you need a guide to help draw your desired character, go to **Option > set background** and enter the unicode value for the character. You can use an online tool such as [this](https://r12a.github.io/app-conversion/) to get the unicode value. (it'll be under Hex/UTF-32)
2. Draw your character.
3. Go to **File > Save Image** and save it as UNICODE.xml where UNICODE would be the unicode value you inserted for the background.
4. Run **read_all.py** (which is included in this repo) to get the reference patterns from your xml file. (NOTE: you may need to change the directories for read_all.py to the folder where your xml file is saved)

- `/home/user/code/convert/xmls` AND `/home/user/code/convert/xmls/`

5. Once you have your refPattern you can add it to [ref-patterns.js](https://github.com/asdfjkl/kanjicanvas/blob/master/docs/resources/javascript/ref-patterns.js)

If you want to create a new ref-patterns.js file, simply include the following and make sure to include your refPattern file after kanji-canvas.js in the document.

```javascript
KanjiCanvas.refPatterns = [
  /*refPatterns HERE*/
];
```

## Copyright and License

Copyright (c) 2019-2020 Dominik Klein

Copyright (c) 2020 Seth Clydesdale

licensed under MIT (cf. LICENSE.TXT).
