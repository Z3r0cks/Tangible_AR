const socket = io();
const objectsDiv = document.getElementById('cameraZone');
const wrapper = document.getElementById('wrapper');
const range = document.getElementById('range');
const box = document.querySelector('.box');
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
   // clear unactive objects
   clearUnactiveObjects();

   // remove old boxes
   removeUnmatchedCanvases(detections);

   // main function to draw boxes
   detections.forEach(({ box_coordinates: [x1, y1, x2, y2], name, data, class_id }) => {
      boxValues[class_id] = [data, name]
      switch (name) {
         case "Nährstoffe":
            measurement = "mg";
            break;
      }
      drawBox(x1, y1, x2, y2, name, data, measurement, class_id);
   });

   // push old boxes to array
   newBoxes.forEach(([id, box, value]) => {
      const { top, left, width, height } = box.getBoundingClientRect();
      oldBoxes.push({ id, box, top, left, width, height, value });
   });

   // check if some boxes are on range field for data scaling
   wrapper.querySelectorAll('canvas').forEach(box => {
      objectOnRangeField(box);
   });

   // reset oldBoxes and newBoxes
   oldBoxes = [];
   newBoxes = [];
});

function objectOnRangeField(canvas) {
   // const canvas = document.getElementById(box.id);
   if (!canvas) return;
   const thisBox = [box.id, canvas, box.value]

   // check if object is on range field
   const { left, top } = canvas.getBoundingClientRect();
   const { offsetWidth, offsetHeight } = canvas;
   const rangeDistance = 400;

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

   const boxWidth = Math.floor(xb) - Math.floor(xa);
   const boxHeight = Math.floor(yb) - Math.floor(ya);
   const boxStartX = Math.floor(xa);
   const boxStartY = Math.floor(ya);
   const newObj = removeIfChanged(id, boxStartX, boxStartY, boxWidth, boxHeight);

   if (!newObj) return;
   box.width = boxWidth;
   box.height = boxHeight;
   box.style.position = "absolute";
   box.style.left = boxStartX + "px";
   box.id = id;

   boxValue = pastBoxes[id] == undefined ? 1 : pastBoxes[id];
   box.setAttribute('value', boxValue);
   const top = box.style.top = boxStartY + "px";

   ctx.beginPath();
   ctx.rect(0, 0, boxWidth, boxHeight);
   ctx.stroke();

   addBox(id, box, 1);
   wrapper.appendChild(box);
   drawDataBox(name, data, measurement, boxStartX, boxStartY, (boxWidth + 5), box, id)
}

function drawDataBox(name, data, measurement, argLeft, argTop, boxWidth, box, id) {
   const dataWrapper = document.createElement('div');
   dataWrapper.classList.add('dataWrapper');
   const value = document.createElement('div');
   value.classList.add('value');
   value.innerHTML = pastBoxes[id] == undefined ? setInnerHtml(id, 1) : setInnerHtml(id, pastBoxes[id]);

   dataWrapper.innerHTML = `<div class="title">${name}</div><div class="dataBox"></div><div class="value">${value.innerHTML}</div>`;
   setDataBoxPosition((argLeft + boxWidth), argTop, dataWrapper);

   wrapper.appendChild(dataWrapper);
}

function setInnerHtml(id, value) {
   const data = boxValues[id][0];
   let listElement = document.createElement('ul');
   for (let key in data) {
      const content = value * parseFloat(data[key]);
      let item = document.createElement('li');
      if (key == "Food_ID") continue;
      if (key != "Food_Name") {
         item.textContent = `${key}: ${content}${measurement}`;
      } else {
         item.textContent = `${data[key]} auf ${value * 100}g`;
      }
      listElement.appendChild(item);
   }
   return listElement.innerHTML;
}

function findPosition(overlapResult, pos) {
   pos = overlapResult.some(subArray => subArray.includes(pos)) ? overlapResult.findIndex(subArray => subArray.includes(pos)) : -1;
   return pos;
}

function setDataBoxPosition(left, top, dataWrapper) {
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
   pastBoxes.forEach(el => {
      if (id == el[0]) {
         updatePastBoxesValue(el[0], value)
         newBox = false;
      }
   });
   if (!newBox) return;
   pastBoxes[id] = value;
}

function updatePastBoxesValue(id, value) {
   pastBoxes.forEach(el => {
      if (id == el[0]) el[1] = value;
   });
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

function removeCanvasAndSibling(canvas) {
   canvas.nextElementSibling.remove();
   canvas.remove();
}

// function isOverlapping(box1) {
//    let avoidArray = [];
//    let buffer = 50;
//    let horizontalBuffer = 75;
//    let verticalBuffer = 75;
//    let rect1 = box1.getBoundingClientRect();

//    newBoxes.forEach(box2 => {
//       if (box1 == box2[1]) return;
//       let rect2 = box2[1].getBoundingClientRect();

//       const horizontalClose = Math.abs(rect1.right - rect2.left) <= horizontalBuffer || Math.abs(rect1.left - rect2.right) <= horizontalBuffer || Math.abs(rect1.right - rect2.right) <= horizontalBuffer || Math.abs(rect1.left - rect2.left) <= horizontalBuffer
//       const verticalClose = Math.abs(rect1.bottom - rect2.top) <= verticalBuffer || Math.abs(rect1.top - rect2.bottom) <= verticalBuffer || Math.abs(rect1.bottom - rect2.bottom) <= verticalBuffer || Math.abs(
//          rect1.top - rect2.top) <= verticalBuffer;

//       if (horizontalClose && verticalClose) {
//          const valueLeft = Math.abs(rect1.right - rect2.left);
//          const valueRight = Math.abs(rect1.left - rect2.right);
//          const valueTop = Math.abs(rect1.bottom - rect2.top);
//          const valueBottom = Math.abs(rect1.top - rect2.bottom);
//          if (valueLeft <= buffer) avoidArray.push([valueLeft, "left"]);
//          if (valueRight <= buffer) avoidArray.push([valueRight, "right"]);
//          if (valueTop <= buffer) avoidArray.push([valueTop, "top"]);
//          if (valueBottom <= buffer) avoidArray.push([valueBottom, "bottom"]);
//       }
//    });
//    return avoidArray;
// }



  // let overlapResult = isOverlapping(box);
   // let leftPos = findPosition(overlapResult, "left");
   // let rightPos = findPosition(overlapResult, "right");
   // let topPos = findPosition(overlapResult, "top");
   // let bottomPos = findPosition(overlapResult, "bottom");

   // let rect = wrapper.getBoundingClientRect();
   // let centerX = rect.left + rect.width / 2;
   // let centerY = rect.top + rect.height / 2;

   // if (overlapResult.length == 0) {
   // } else if (leftPos != -1 && topPos == -1 && bottomPos == -1) {
   //    setDataBoxPosition((argLeft - 150), argTop, dataWrapper);
   // } else if (leftPos != -1 && topPos != -1 && bottomPos == -1) {
   //    setDataBoxPosition((argLeft - 150), (argTop - overlapResult[leftPos][0] / 1.5), dataWrapper);
   // }
   // if (leftPos != -1 && topPos == -1 && bottomPos != -1) {
   // }
   // if (leftPos == -1 && topPos != -1 && bottomPos == -1) {
   // }
   // if (leftPos == -1 && topPos == -1 && bottomPos != -1) {
   // }
   // if (el.includes("left")) {
   // }
   // if (el.includes("left") && overlapResult.includes("top")) {
   //    setDataBoxPosition((left - 150), (top - 50), dataBox);
   // }

   // dataWrapper.append(dataBox, value);
   // dataWrapper.innerHTML = myDiv;