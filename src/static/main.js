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
let pastBoxes = [];

socket.on('connect', () => {
   socket.emit('my event', { data: 'I\'m connected!' });
});

socket.on('new detections', function (detections) {
   // remove old boxes
   removeUnmatchedCanvases(detections);
   // main function to draw boxes
   detections.forEach(({ box_coordinates: [x1, y1, x2, y2], data, class_id }) => {
      drawBox(x1, y1, x2, y2, data, class_id);
   });

   // push old boxes to array
   newBoxes.forEach(([id, box, value]) => {
      const { top, left, width, height } = box.getBoundingClientRect();
      oldBoxes.push({ id, box, top, left, width, height, value });
   });

   oldBoxes.forEach(box => {
      objectOnRangeField(box);
   });
   // check if some boxes are on range field for data scaling

   // clear unactive objects
   clearUnactiveObjects();

   // reset oldBoxes and newBoxes
   oldBoxes = [];
   newBoxes = [];
});

function objectOnRangeField(oldBox) {
   const canvas = document.getElementById(oldBox.id);
   if (!canvas) return;
   const box = [oldBox.id, canvas, oldBox.value]

   // check if object is on range field
   const { left, top } = box[1].getBoundingClientRect();
   const { offsetWidth, offsetHeight } = box[1];
   const rangeDistance = 325

   if (left <= (rangeDistance - offsetWidth) && top <= (rangeDistance - offsetHeight)) {
      range.disabled = false;
      box[2] = range.value;
      box[1].nextElementSibling.querySelectorAll('.value').forEach(el => {
         const value = setInnerHtml([box[0], el, box[2]]);
         el.innerHTML = value;
         box[1].setAttribute('value', value);
      });
   } else {
      range.value = 0;
      range.disabled = true;
   }
}

function drawBox(xa, ya, xb, yb, data, id) {
   const box = document.createElement('canvas');
   box.classList.add('box');
   const ctx = box.getContext("2d");

   const boxWidth = Math.floor(xb) - Math.floor(xa);
   const boxHeight = Math.floor(yb) - Math.floor(ya);
   const boxStartX = Math.floor(xa);
   const boxStartY = Math.floor(ya);
   const newObj = removeIfChanged(id, boxStartX, boxStartY, boxWidth, boxHeight);

   box.width = boxWidth;
   box.height = boxHeight;
   box.style.position = "absolute";
   box.style.left = boxStartX + "px";
   box.id = id;
   box.setAttribute('value', 1);
   const top = box.style.top = boxStartY + "px";

   ctx.beginPath();
   ctx.rect(0, 0, boxWidth, boxHeight);
   ctx.stroke();

   addBox(id, box, 1);
   if (!newObj) return;
   wrapper.appendChild(box);
   drawDataBox(data, boxStartX, boxStartY, (boxWidth + 5), box, id)
}

function drawDataBox(data, left, top, boxWidth, box, id) {
   const dataWrapper = document.createElement('div');
   dataWrapper.classList.add('dataWrapper');
   dataWrapper.style.position = "absolute";
   dataWrapper.style.width = 150 + "px";

   const dataBox = document.createElement('div');
   dataBox.textContent = data;

   const value = document.createElement('div');
   value.classList.add('value');
   value.innerHTML = setInnerHtml([id, box, 1]);

   setDataBoxPosition((left + boxWidth), top, dataWrapper);
   dataWrapper.append(dataBox, value);
   wrapper.appendChild(dataWrapper);
}

function setInnerHtml(box) {
   return `${box[2] * 100}g`
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
      newBoxes.push([id, box, value])
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
   const box = document.getElementById(id.toString());
   if (box == null) return true;

   const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = box;
   const buffer = 5;

   if (Math.abs(left - boxStartX) > buffer ||
      Math.abs(top - boxStartY) > buffer ||
      Math.abs(width - boxWidth) > buffer ||
      Math.abs(height - boxHeight) > buffer) {
      box.nextElementSibling.remove();
      box.remove();
      return false;
   }
   return false;
}

function removeUnmatchedCanvases(detections) {
   const classIds = new Set(detections.map(detection => detection.class_id));
   wrapper.querySelectorAll('canvas').forEach(canvas => {
      if (!classIds.has(parseInt(canvas.id))) {
         if (!pastBoxes.some(([id, value]) => id === canvas.id)) {
            pastBoxes.push([canvas.id, canvas.getAttribute('value')]);
         }
         canvas.nextSibling.remove();
         canvas.remove();
      }
   });
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


   // drawDataBox
   // let leftPos = findPosition(overlapResult, "left");
   // let rightPos = findPosition(overlapResult, "right");
   // let topPos = findPosition(overlapResult, "top");
   // let bottomPos = findPosition(overlapResult, "bottom");

   // if (overlapResult.length == 0) {
   // }
   // if (leftPos != -1 && topPos == -1 && bottomPos == -1) {
   //    // console.log("left");
   //    setDataBoxPosition((left - 150), top, dataBox);
   // }
   // if (leftPos != -1 && topPos != -1 && bottomPos == -1) {
   //    setDataBoxPosition((left - 150), (top - overlapResult[leftPos][0] / 1.5), dataBox);
   // }
   // if (leftPos != -1 && topPos == -1 && bottomPos != -1) {
   // }
   // if (leftPos == -1 && topPos != -1 && bottomPos == -1) {
   // }
   // if (leftPos == -1 && topPos == -1 && bottomPos != -1) {
   // }
   // // if (el.includes("left")) {
   // // }
   // // if (el.includes("left") && overlapResult.includes("top")) {
   // //    setDataBoxPosition((left - 150), (top - 50), dataBox);
   // // }