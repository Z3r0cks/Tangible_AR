const socket = io();
const objectsDiv = document.getElementById('cameraZone');
const wrapper = document.getElementById('wrapper');
const range = document.getElementById('range');
const box = document.querySelector('.box');
box.remove();

range.disabled = true;
activeObjectId = null;

let newBoxes = [];
let oldBoxes = [];

socket.on('connect', () => {
   socket.emit('my event', { data: 'I\'m connected!' });
});

socket.on('new detections', function (detections) {
   // push old boxes to array
   newBoxes.forEach(box => {
      const rect = box[1].getBoundingClientRect();
      oldBoxes.push({ id: box[0], top: rect.top, left: rect.left, width: rect.width, height: rect.height });
   });

   // main function to draw boxes
   detections.forEach(detection => {
      drawBox(detection.box_coordinates[0], detection.box_coordinates[1], detection.box_coordinates[2], detection.box_coordinates[3], detection.data, detection.class_id);
   });

   objectOnRangeField();
   clearUnactiveObjects();
   oldBoxes = [];
   newBoxes = [];
});

function objectOnRangeField() {
   // check if object is on range field
   wrapper.querySelectorAll('canvas').forEach(box => {
      const rect = box.getBoundingClientRect();
      const rangeDistance = 325
      if (rect.left <= (rangeDistance - box.offsetWidth) && rect.top <= (rangeDistance - box.offsetHeight)) {
         range.disabled = false;
      } else
         range.disabled = true;
   });
}

function clearPreObject(id, boxStartX, boxStartY, boxWidth, boxHeight) {
   let newObj = true;
   wrapper.querySelectorAll('canvas').forEach(box => {
      if (box.id != id) return;
      const rect = box.getBoundingClientRect();
      const buffer = 8;
      newObj = false;
      if (Math.abs(rect.left - boxStartX) > buffer ||
         Math.abs(rect.top - boxStartY) > buffer ||
         Math.abs(rect.width - boxWidth) > buffer ||
         Math.abs(rect.height - boxHeight) > buffer) {
         box.nextElementSibling.remove();
         box.remove();
         newObj = true;
         return;
      }
   });
   return newObj;
}

function drawBox(xa, ya, xb, yb, data, id) {
   const box = document.createElement('canvas');
   box.classList.add('box');
   const ctx = box.getContext("2d");

   const boxWidth = Math.floor(xb) - Math.floor(xa);
   const boxHeight = Math.floor(yb) - Math.floor(ya);
   const boxStartX = Math.floor(xa);
   const boxStartY = Math.floor(ya);
   const newObj = clearPreObject(id, boxStartX, boxStartY, boxWidth, boxHeight);

   box.width = boxWidth;
   box.height = boxHeight;
   box.style.position = "absolute";
   box.style.left = boxStartX + "px";
   box.id = id;
   const top = box.style.top = boxStartY + "px";

   ctx.beginPath();
   ctx.rect(0, 0, boxWidth, boxHeight);
   ctx.stroke();
   addBox(id, box);
   if (!newObj) return;
   wrapper.appendChild(box);
   drawDataBox(data, boxStartX, boxStartY, (boxWidth + 5), box)
}

function drawDataBox(data, left, top, boxWidth, box, newObject) {
   let overlapResult = isOverlapping(box);
   const dataBox = document.createElement('div');
   const value = document.createElement('div');
   value.innerHTML = "100g";
   const dataWrapper = document.createElement('div');
   dataWrapper.classList.add('dataBox');
   dataWrapper.style.position = "absolute";
   dataWrapper.style.width = 150 + "px";
   let leftPos = findPosition(overlapResult, "left");
   let rightPos = findPosition(overlapResult, "right");
   let topPos = findPosition(overlapResult, "top");
   let bottomPos = findPosition(overlapResult, "bottom");

   setDataBoxPosition((left + boxWidth), top, dataWrapper);
   // if (overlapResult.length == 0) {
   // }
   // if (leftPos != -1 && topPos == -1 && bottomPos == -1) {
   //    // console.log("left");
   //    setDataBoxPosition((left - 150), top, dataBox);
   // }
   // if (leftPos != -1 && topPos != -1 && bottomPos == -1) {
   //    // console.log("top left");
   //    setDataBoxPosition((left - 150), (top - overlapResult[leftPos][0] / 1.5), dataBox);
   // }
   // if (leftPos != -1 && topPos == -1 && bottomPos != -1) {
   //    // console.log("bottom left");
   // }
   // if (leftPos == -1 && topPos != -1 && bottomPos == -1) {
   //    // console.log("top");
   // }
   // if (leftPos == -1 && topPos == -1 && bottomPos != -1) {
   //    // console.log("bottom");
   // }
   // // if (el.includes("left")) {
   // // }
   // // if (el.includes("left") && overlapResult.includes("top")) {
   // //    setDataBoxPosition((left - 150), (top - 50), dataBox);
   // // }

   dataBox.textContent = data;
   dataWrapper.append(dataBox, value);
   wrapper.appendChild(dataWrapper);
}


function findPosition(overlapResult, pos) {
   pos = overlapResult.some(subArray => subArray.includes(pos)) ? overlapResult.findIndex(subArray => subArray.includes(pos)) : -1;
   return pos;
}

function setDataBoxPosition(left, top, dataWrapper) {
   dataWrapper.style.left = left + "px";
   dataWrapper.style.top = top + "px";
}

function addBox(id, box) {
   if (newBoxes.length == 0) {
      newBoxes.push([id, box, 0])
      return;
   };

   isAvailable = true;
   for (let i = 0; i < newBoxes.length; i++) {
      if (newBoxes[i][0] != id) break;
      newBoxes[i] = [id, box]
      isAvailable = false;
   }

   if (isAvailable) {
      newBoxes.push([id, box]);
   }
}

function isOverlapping(box1) {
   let avoidArray = [];
   newBoxes.forEach(box2 => {
      let buffer = 50;
      let closeBuffer = 75;
      let rect1 = box1.getBoundingClientRect();
      let rect2 = box2[1].getBoundingClientRect();

      const horizontalClose = Math.abs(rect1.right - rect2.left) <= closeBuffer || Math.abs(rect1.left - rect2.right) <= closeBuffer;
      const verticalClose = Math.abs(rect1.bottom - rect2.top) <= closeBuffer || Math.abs(rect1.top - rect2.bottom) <= closeBuffer;

      if (horizontalClose && verticalClose) {
         const valueLeft = Math.abs(rect1.right - rect2.left);
         const valueRight = Math.abs(rect1.left - rect2.right);
         const valueTop = Math.abs(rect1.bottom - rect2.top);
         const valueBottom = Math.abs(rect1.top - rect2.bottom);
         if (valueLeft <= buffer) avoidArray.push([valueLeft, "left"]);
         if (valueRight <= buffer) avoidArray.push([valueRight, "right"]);
         if (valueTop <= buffer) avoidArray.push([valueTop, "top"]);
         if (valueBottom <= buffer) avoidArray.push([valueBottom, "bottom"]);
      }
   });
   return avoidArray;
}

function clearUnactiveObjects() {
   let allCanvas = wrapper.querySelectorAll('canvas');
   let newBoxesIds = newBoxes.map(box => box[0]);

   Array.from(allCanvas).forEach(canvas => {
      if (!newBoxesIds.includes(parseInt(canvas.id))) {
         canvas.nextElementSibling.remove();
         canvas.remove();
      }
   });
}
