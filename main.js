import './style.css'
import {Niivue} from '@niivue/niivue'
import MyWorker from "./worker?worker";
import { v4 as uuidv4 } from "uuid";

function processImage(worker) {
  const imageIndex = 0;
  let image = nv.volumes[imageIndex].clone();
  let metadata = image.getImageMetadata();
  const isNewLayer = true;
  const input = document.getElementById('command');
  const cmd = input.value;
  worker.postMessage([metadata, image.img.buffer, cmd, isNewLayer]);
}

// initialize our WASM
async function initWasm() {
  worker.onmessage = (e) => {
    // find our processed image
    const id = e.data.id;
    let processedImage = nv.volumes.find((image) => image.id == id);
    if (!processedImage) {
      console.log("image not found");
      return;
    }

    const isNewLayer = e.data.isNewLayer;
    if (isNewLayer) {
      processedImage = processedImage.clone();
      processedImage.id = uuidv4();
    }

    let imageBytes = e.data.imageBytes;

    switch (processedImage.hdr.datatypeCode) {
      case processedImage.DT_UNSIGNED_CHAR:
        processedImage.img = new Uint8Array(imageBytes);
        break;
      case processedImage.DT_SIGNED_SHORT:
        processedImage.img = new Int16Array(imageBytes);
        break;
      case processedImage.DT_FLOAT:
        processedImage.img = new Float32Array(imageBytes);
        break;
      case processedImage.DT_DOUBLE:
        throw "datatype " + processedImage.hdr.datatypeCode + " not supported";
      case processedImage.DT_RGB:
        processedImage.img = new Uint8Array(imageBytes);
        break;
      case processedImage.DT_UINT16:
        processedImage.img = new Uint16Array(imageBytes);
        break;
      case processedImage.DT_RGBA32:
        processedImage.img = new Uint8Array(imageBytes);
        break;
      default:
        throw "datatype " + processedImage.hdr.datatypeCode + " not supported";
    }

    // recalculate
    processedImage.trustCalMinMax = false;
    processedImage.calMinMax();

    let imageIndex = nv.volumes.length;
    if (isNewLayer) {
      nv.setVolume(processedImage, nv.volumes.length);
    } else {
      imageIndex = nv.volumes.indexOf(processedImage);
    }
    console.log('image processed');
  }
}

// respond to our button press
function buttonProcessImage() {
  processImage(worker);
}

// enable our button after our WASM has been initialize
async function initializeImageProcessing() {
  await initWasm();
  let button = document.getElementById('process-image-button');
  button.innerText = "process";
  button.disabled = false;
  button.onclick = buttonProcessImage;
}


let volumeList = [
  // first object in array is background image
    {
      url: "./mni152.nii.gz",
      volume: {hdr: null, img: null},
      name: "some_image",
      colorMap: "gray",
      opacity: 1,
      visible: true,
    }
 ];

let worker = new MyWorker();
initializeImageProcessing();
let canvas = document.getElementById('gl');
const nv = new Niivue();
nv.attachToCanvas(canvas);
nv.loadVolumes(volumeList);




