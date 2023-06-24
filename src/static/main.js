const socket = io();
const objectsDiv = document.getElementById('cameraZone');
const wrapper = document.getElementById('wrapper');
const range = document.getElementById('range');
const box = document.querySelector('.box');
const infoField = document.getElementById('infoField');
const title = document.getElementById('title');

let newBoxes = [];
let oldBoxes = [];
let pastBoxes = [];
let boxValues = [];
let measurement = "";
range.disabled = true;
box.remove();

document.getElementById('resetRange').addEventListener('click', () => {
   resetRange();
});

document.getElementById('resetValue').addEventListener('click', () => {
   resetRange();
   if (pastBoxes.length == 0) return;

   pastBoxes.forEach((key, value) => {
      const el = document.getElementById(parseInt(value));
      el.value = 1;
      el.nextElementSibling.querySelectorAll('.value').forEach(value => {
         value.innerHTML = setInnerHtml(el.id, el.value);
      });
      updatePastBoxesValue(el.id, el.value);
   });
});

function resetRange() {
   range.value = 0;
}

socket.on('connect', () => {
   socket.emit('my event', { data: 'I\'m connected!' });
});

socket.on('new detections', function (detections) {
   // console.log(detections);
   // clear unactive objects
   clearUnactiveObjects();

   if (detections == "home" || detections.length == 0) {
      console.log("test");
      infoField.innerHTML = `<h3>Home</h3>
      <p>Platziere ein Lebensmittel auf der linken Seite und entscheide dich für eine Würfelseite um dir die Daten deines Frühstücks anzeigen zu lassen.</p>`;

      title.innerHTML = 'Wie <span id="titleType"> gesund </span> ist dein Frühstück?';
      document.getElementById('titleType').style.color = "#8ac626";
      document.querySelectorAll('.box').forEach(box => {
         removeCanvasAndSibling(box);
      });

   } else {
      removeUnmatchedCanvases(detections);

      // main function to draw boxes
      detections.forEach(({ box_coordinates: [x1, y1, x2, y2], name, data, class_id }) => {
         boxValues[class_id] = [data, name]
         switch (name) {
            case "nutrients":
               setValueForDataTypes("mg", 'wie <span id="titleType"> nährreich </span> startest Du in den Tag?', "#d86c0d");
               break;

            case "vitamins":
               setValueForDataTypes("μg", 'wie <span id="titleType"> vitaminreich </span> startest Du in den Tag?', "#f2ef30");
               break;

            case "minerals":
               setValueForDataTypes("μg", 'wie <span id="titleType"> mineralreich </span> startest Du in den Tag?', "#ff6600");
               break;

            case "trace_elements":
               setValueForDataTypes("μg", 'Wie viele <span id="titleType"> Spurenelemente </span> hat dein Frühstück?', "#585858");
               break;

            case "allergens":
               setValueForDataTypes("", 'Wie <span id="titleType"> verträglich </span> ist dein Frühstück?', "#f6c397");
         }
         drawBox(x1, y1, x2, y2, name, data, measurement, class_id);
         if (name != "allergens")
            setDataInInfoField(detections);
         else
            setDataInInfoFieldForAllergens(detections);
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

function objectOnRangeField(canvas) {
   // const canvas = document.getElementById(box.id);
   if (!canvas) return;
   // check if object is on range field
   const { left, top } = canvas.getBoundingClientRect();
   const { offsetWidth, offsetHeight } = canvas;
   const rangeDistance = 500;

   if (left <= (rangeDistance - offsetWidth) && top <= (rangeDistance - offsetHeight)) {
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

   boxValue = pastBoxes[id] == undefined ? 1 : pastBoxes[id];
   box.setAttribute('value', boxValue);
   box.setAttribute('class', "is-hidden box");
   const top = box.style.top = boxStartY + "px";

   ctx.beginPath();
   ctx.rect(0, 0, boxWidth, boxHeight);
   ctx.stroke();

   addBox(id, box, 1);
   wrapper.appendChild(box);
   drawDataBox(name, data, measurement, boxStartX, boxStartY, box, id)
}

function drawDataBox(name, data, measurement, argLeft, argTop, box, id) {
   const dataWrapper = document.createElement('div');
   dataWrapper.classList.add('dataWrapper');
   const value = document.createElement('div');
   value.classList.add('value');
   value.innerHTML = pastBoxes[id] == undefined ? setInnerHtml(id, 1) : setInnerHtml(id, pastBoxes[id]);

   dataWrapper.innerHTML = `<div class="value">${value.innerHTML}</div>`;
   setNameBoxPosition(argLeft, (argTop + box.height), dataWrapper);

   wrapper.appendChild(dataWrapper);
}

function setDataInInfoField(detections) {
   let aggregatedData = {};
   for (let detection of detections) {
      for (let key in detection.data) {
         if (key == "Food_Name" || key == "Food_ID") continue;
         if (!(key in aggregatedData)) {
            aggregatedData[key] = 0;
         }
         let value = 1;
         try {
            value = document.getElementById(detection.class_id).getAttribute('value');
         } catch { continue; }
         aggregatedData[key] += parseFloat(detection.data[key] * value);
      }
   }
   let html = '<h3>' + translateDiceName(detections[0].name) + '</h3><table class="table-container">';
   for (let key in aggregatedData) {
      html += '<tr><td style="padding-right: 50px;">' + key + '</td><td class="dataItem">' + aggregatedData[key] + measurement + '</td></tr>';
   }
   html += '</table></div>';
   infoField.innerHTML = html;
}

function setDataInInfoFieldForAllergens(detections) {
   let allergens = {};
   let nonVeganVegetarianDetected = false;
   for (let detection of detections) {
      for (let key in detection.data) {
         if (key == "Food_Name" || key == "Food_ID") continue;
         if (detection.data[key] == 1) {
            allergens[key] = true;
         }
      }

      if (detection.data["Vegan"] == 0 || detection.data["Vegetarisch"] == 0) {
         nonVeganVegetarianDetected = true;
      }
   }

   if (nonVeganVegetarianDetected) {
      allergens["Vegan"] = false;
      allergens["Vegetarisch"] = false;
   }

   let html = '<h3>' + translateDiceName(detections[0].name) + '</h3><table class="table-container">';
   for (let allergen in allergens) {
      html += '<tr><td style="padding-right: 50px;">' + allergen + '</td><td class="dataItem">' + (allergens[allergen] ? "ja" : "Nein") + '</td></tr>';
   }
   html += '</table></div>';
   infoField.innerHTML = html;
}

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

function findPosition(overlapResult, pos) {
   pos = overlapResult.some(subArray => subArray.includes(pos)) ? overlapResult.findIndex(subArray => subArray.includes(pos)) : -1;
   return pos;
}

function setNameBoxPosition(left, top, dataWrapper) {
   dataWrapper.style.left = left + "px";
   dataWrapper.style.top = top + "px";
}

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

function removeUnmatchedCanvases(detections) {
   const classIds = new Set(detections.map(detection => detection.class_id));
   wrapper.querySelectorAll('canvas').forEach(canvas => {
      if (!classIds.has(parseInt(canvas.getAttribute('id')))) {
         removeCanvasAndSibling(canvas);
         pushToPastBoxes(canvas.id, canvas.getAttribute('value'));
      }
   });
}

function checkOldState(objId) {
   let value = 1;
   pastBoxes.forEach(([id, pastValue]) => {
      if (id == objId) value = pastValue;
   });
   return value;
}

function pushToPastBoxes(id, value) {
   let newBox = true;
   // pastBoxes.forEach(el => {
   //    if (id == el[0]) {
   //       updatePastBoxesValue(el[0], value)
   //       newBox = false;
   //    }
   // });
   if (!newBox) return;
   pastBoxes[id] = value;
}

// function updatePastBoxesValue(id, value) {
//    pastBoxes.forEach(el => {
//       if (id == el[0]) { el[1] = value; }
//    });
// }

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