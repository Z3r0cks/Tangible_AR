const socket = io();
const objectsDiv = document.getElementById('cameraZone');
const wrapper = document.getElementById('wrapper');
const range = document.getElementById('range');
const box = document.querySelector('.box');
const infoField = document.getElementById('infoField');
const title = document.getElementById('title');

let newBoxes = [];      // array for new boxes
let oldBoxes = [];      // array boxes in last frame
let pastBoxes = [];     // array for all boxes in past
let boxValues = [];
let measurement = "";
let fontColor = "";
range.disabled = true;
box.remove();

document.getElementById('resetRange').addEventListener('click', () => {
   resetRange();
});

// socket connection on "new detections"
socket.on('new detections', function (detections) {
   clearUnactiveObjects();

   // check if detections are empty
   if (detections == "home" || detections.length == 0) {
      range.disabled = true;
      infoField.innerHTML = `<h3>Home</h3>
      <p>Entscheide dich für eine Kateogie in dem du es auf die Stelle auf den Bildschirm legst und platziere anschließend ein Lebensmittel auf die freie Fläche.</p>`;

      title.innerHTML = 'Wie <span id="titleType"> gesund </span> ist dein Frühstück?';
      document.getElementById('titleType').style.color = "#8ac626";
      document.querySelectorAll('.box').forEach(box => {
         removeCanvasAndSibling(box);
      });

   } else if (detections == "no table") {
      infoField.innerHTML = `<h3>Keine Kategorie</h3>
      <p>Wähle eine Kategorie und lege sie auf die Fläche</p>`;

      title.innerHTML = 'Wie <span id="titleType"> gesund </span> ist dein Frühstück?';
      document.getElementById('titleType').style.color = "#8ac626";
      document.querySelectorAll('.box').forEach(box => {
         removeCanvasAndSibling(box);
      });
   } else {
      removeUnmatchedCanvases(detections);

      detections.forEach(({ box_coordinates: [x1, y1, x2, y2], name, data, class_id }) => {
         boxValues[class_id] = [data, name]

         // set name, color and mesurement for category
         switch (name) {
            case "nutrients":
               setValueForDataTypes("mg", 'wie <span id="titleType"> nährreich </span> startest Du in den Tag?', fontColor = "#d86c0d");
               break;

            case "vitamins":
               setValueForDataTypes("μg", 'wie <span id="titleType"> vitaminreich </span> startest Du in den Tag?', fontColor = "#c5c345");
               break;

            case "minerals":
               setValueForDataTypes("mg", 'wie <span id="titleType"> mineralreich </span> startest Du in den Tag?', fontColor = "#ff6600");
               break;

            case "trace_elements":
               setValueForDataTypes("μg", 'Wie viele <span id="titleType"> Spurenelemente </span> hat dein Frühstück?', fontColor = "#585858");
               break;

            case "allergens":
               setValueForDataTypes("", 'Wie <span id="titleType"> verträglich </span> ist dein Frühstück?', fontColor = "#dea879");
         }

         // draw box
         drawBox(x1, y1, x2, y2, name, data, measurement, class_id);

         // set data for info field
         (name != "allergens") ? setDataInfoField(detections) : setDataInfoFieldForAllergens(detections);

      });

      function setValueForDataTypes(measurementType, text, color) {
         measurement = measurementType;
         title.innerHTML = text;
         document.getElementById('titleType').style.color = color;
      }

      // push old boxes to array
      newBoxes.forEach(([id, box, value]) => {
         const { top, left, width, height } = box.getBoundingClientRect();
         oldBoxes.push({ id, box, top, left, width, height, value });
      });

      // check if some boxes are on range field for data scaling
      if (wrapper.querySelectorAll('canvas').length == 0)
         range.disabled = true;
      else
         wrapper.querySelectorAll('canvas').forEach(box => {
            objectOnRangeField(box);
         });

      // reset oldBoxes and newBoxes
      oldBoxes = [];
      newBoxes = [];
   }
});

// function for the range field (scaling data)
function objectOnRangeField(canvas) {
   if (!canvas) return;

   // check is object on range field
   const { left, top } = canvas.getBoundingClientRect();
   const { offsetWidth, offsetHeight } = canvas;
   const rangeDistance = 400;

   if (left <= (rangeDistance - (offsetWidth / 2)) && top <= (rangeDistance - ((offsetHeight) / 2))) {
      range.disabled = false;
      canvas.setAttribute('value', range.value);
      canvas.nextElementSibling.querySelectorAll('.value').forEach(el => {
         const value = setInnerHtml(canvas.id, canvas.getAttribute('value'));
         el.innerHTML = value;
         canvas.setAttribute('value', range.value);
         pushToPastBoxes(canvas.id, range.value)
      });
   } else {
      range.disabled = true;
   }
}

// draw box, currently is the box not visible
function drawBox(xa, ya, xb, yb, name, data, measurement, id) {
   const box = document.createElement('canvas');
   box.classList.add('box');
   const ctx = box.getContext("2d");

   const offsetY = 90;
   const screenW = window.innerWidth;
   const screenH = window.innerHeight;
   const camW = 1280;
   const camH = 720;

   const scaleX = screenW / camW;
   const scaleY = screenH / camH;

   const boxWidth = Math.floor(xb * scaleX) - Math.floor(xa * scaleX);
   const boxHeight = Math.floor(yb * scaleY) - Math.floor(ya * scaleY);
   const boxStartX = Math.floor(xa * scaleX);
   const boxStartY = Math.floor(ya * scaleY - ya * scaleY * 0 + offsetY);
   const newObj = removeIfChanged(id, boxStartX, boxStartY, boxWidth, boxHeight);

   if (!newObj) return;
   box.width = boxWidth;
   box.height = boxHeight;
   box.style.position = "absolute";
   box.style.left = boxStartX + "px";
   box.id = id;

   const boxValue = pastBoxes[id] == undefined ? 1 : pastBoxes[id];
   box.setAttribute('value', boxValue);
   box.setAttribute('class', "is-hidden box");
   const top = box.style.top = boxStartY + "px";

   ctx.beginPath();
   ctx.rect(0, 0, boxWidth, boxHeight);
   ctx.stroke();

   addBox(id, box, 1);
   wrapper.appendChild(box);
   drawLabel(boxStartX, boxStartY, box, id)
}

// draw label for invisible box
function drawLabel(argLeft, argTop, box, id) {
   const labelWrapper = document.createElement('div');
   const value = document.createElement('div');
   labelWrapper.classList.add('dataWrapper');
   value.classList.add('value');
   value.innerHTML = pastBoxes[id] == undefined ? setInnerHtml(id, 1) : setInnerHtml(id, pastBoxes[id]);

   labelWrapper.innerHTML = `<div class="value">${value.innerHTML}</div>`;
   setLabelPosition(argLeft + (box.width / 3), (argTop + box.height - 60), labelWrapper);

   wrapper.appendChild(labelWrapper);
}

function setDataInfoField(detections) {
   let aggregatedData = {};
   for (let detection of detections) {
      for (let key in detection.data) {

         // filter out food name and id
         if (key == "Food_Name" || key == "Food_ID") continue;
         if (!(key in aggregatedData)) {
            aggregatedData[key] = 0;
         }
         let value = 1;
         try {
            value = document.getElementById(detection.class_id).getAttribute('value');
         } catch { continue; }
         aggregatedData[key] += Math.round(parseFloat((detection.data[key] * value)));
      }
   }
   let html = `<h3 style="color: ${fontColor};">${translateDiceName(detections[0].name)}</h3><table class="table-container">`;
   for (let key in aggregatedData) {
      html += `<tr><td style="padding-right: 50px;">${key}</td><td class="dataItem"><b>${aggregatedData[key]}</b></td><td>${measurement}</td></tr>`;
      console.log(html);
   }
   html += '</table></div>';
   infoField.innerHTML = html;
}

// allergens has special data structure
function setDataInfoFieldForAllergens(detections) {
   let allergens = {};
   let vegan = true;
   let vegetarian = true;

   for (let detection of detections) {
      for (let key in detection.data) {
         if (key == "Food_Name" || key == "Food_ID") continue;
         if (key == "Vegetarisch" && detection.data[key] == 0) vegetarian = false;
         if (key == "Vegan" && detection.data[key] == 0) vegan = false;
         if (detection.data[key] == 1) {
            allergens[key] = true;
         }
      }
   }

   if (!vegetarian) {
      delete allergens["Vegetarisch"];
   }
   if (!vegan) {
      delete allergens["Vegan"];
   }
   if (vegan) {
      delete allergens["Vegetarisch"];
   }


   let html = `<h3 style="color: ${fontColor};">${translateDiceName(detections[0].name)}</h3><table class="table-container">`;
   for (let allergen in allergens) {
      html += `<tr><td style="padding-right: 50px;">${allergen}</td></tr>`;

   }
   html += '</table></div>';
   infoField.innerHTML = html;
}

// set innerHtml for Label
function setInnerHtml(id, value) {
   const data = boxValues[id][0];
   for (let key in data) {
      if (key != "Food_Name") continue
      return `${data[key]} auf ${value * 100}g`;
   }
}

function translateDiceName(engName) {
   let deName = "";
   switch (engName) {
      case "nutrients":
         deName = "Nährstoffe";
         break;
      case "vitamins":
         deName = "Vitamine";
         break;
      case "minerals":
         deName = "Mineralstoffe";
         break;
      case "trace_elements":
         deName = "Spurenelemente";
         break;
      case "allergens":
         deName = "Allergene";
         break;
   }
   return deName;
}

function setLabelPosition(left, top, dataWrapper) {
   dataWrapper.style.left = left + "px";
   dataWrapper.style.top = top + "px";
}

// add boxes into newBoxes array
function addBox(id, box, value) {
   if (newBoxes.length == 0) {
      newBoxes.push([id, box, value]);
      return;
   };

   let isAvailable = true;
   for (let i = 0; i < newBoxes.length; i++) {
      if (newBoxes[i][0] != id) break;
      newBoxes[i] = [id, box, value]
      isAvailable = false;
   }

   if (isAvailable) {
      newBoxes.push([id, box]);
   }
}

// if a box is changed in his position or size too much, remove it
function removeIfChanged(id, boxStartX, boxStartY, boxWidth, boxHeight) {
   const box = document.getElementById(id);
   if (box == null) return true;
   const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = box;
   const buffer = 15;

   if (Math.abs(left - boxStartX) > buffer ||
      Math.abs(top - boxStartY) > buffer ||
      Math.abs(width - boxWidth) > buffer ||
      Math.abs(height - boxHeight) > buffer) {
      removeCanvasAndSibling(box)
      return false;
   }
   return false;
}

// box who does not exist anymore will be removed
function removeUnmatchedCanvases(detections) {
   const classIds = new Set(detections.map(detection => detection.class_id));
   wrapper.querySelectorAll('canvas').forEach(canvas => {
      if (!classIds.has(parseInt(canvas.getAttribute('id')))) {
         removeCanvasAndSibling(canvas);
         pushToPastBoxes(canvas.id, canvas.getAttribute('value'));
      }
   });
}

function pushToPastBoxes(id, value) {
   let newBox = true;
   if (!newBox) return;
   pastBoxes[id] = value;
}

// remove canvas and its sibling from a box
function removeCanvasAndSibling(canvas) {
   canvas.nextElementSibling.remove();
   canvas.remove();
}

function clearUnactiveObjects() {
   let allCanvas = wrapper.querySelectorAll('canvas');
   let newBoxesIds = newBoxes.map(box => box[0]);
   Array.from(allCanvas).forEach(canvas => {
      if (newBoxesIds.length == 0) return;
      if (!newBoxesIds.includes(parseInt(canvas.id))) {
         removeCanvasAndSibling(canvas)
      }
   });
}

function resetRange() {
   range.value = 0;
}
