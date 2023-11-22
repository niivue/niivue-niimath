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
        processedImage.img = new Int16Array(imageBytes.buffer);
        break;
      case processedImage.DT_FLOAT:
        processedImage.img = new Float32Array(imageBytes.buffer);
        break;
      case processedImage.DT_UINT16:
        processedImage.img = new Uint16Array(imageBytes.buffer);
        break;
      default:
        throw "datatype " + processedImage.hdr.datatypeCode + " not supported";
    }

    // recalculate
    processedImage.trustCalMinMax = false;
    processedImage.calMinMax();

    let imageIndex = nv.volumes.length;
    if (isNewLayer) {
      if (imageIndex > 1)
        nv.removeVolume(nv.volumes[1].id);
      if (overlayCheck.checked) {
        nv.addVolume(processedImage);
        nv.setColormap(nv.volumes[1].id, 'red');
      } else
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
  let button = document.getElementById('processButton');
  button.disabled = false;
  button.onclick = buttonProcessImage;
}
const imgs = [
    "fa8",
    "dwi16",
    "fmri32",
    "T1w7T",
    "T2w7T",
    "bold7T",
    "chris_PD",
    "chris_t1",
    "chris_t2",
    "CT_Abdo",
    "CT_Electrodes",
    "CT_Philips",
    "CT_pitch",
    "fmri_pitch",
    "Iguana",
    "mni152",
    "MR_Gd",
    "spm152",
    "spmMotor",
];
const imgEl = document.getElementById("images");
for (let i = 0; i < imgs.length; i++) {
    let btn = document.createElement("button");
    btn.innerHTML = imgs[i];
    btn.onclick = function () {
      let root = "https://niivue.github.io/niivue-demo-images/";
      if (i < 6)
        root = "./";
      let img = root + imgs[i] + ".nii.gz";
      console.log("Loading: " + img);
      volumeList[0].url = img;
      nv.loadVolumes(volumeList);
      nv.updateGLVolume();
    };
    imgEl.appendChild(btn);
}
saveButton.onclick = function () {
    if (nv.volumes.length < 2)
        nv.saveImage("niimath.nii.gz", false, 0);
    else
        nv.saveImage("niimath.nii.gz", false, 1);
}
aboutButton.onclick = function () {
    window.alert("The Difference of Gaussian (dog) allows you to specify the width (in millimeters) for two Gaussian Blurs to find edges. The buttons at the bottom let you load different modalities. Drag and drop your own images to explore other datasets.");
}
moreButton.onclick = function () {
    window.open('https://github.com/niivue/niivue-niimath#commands');
}
let worker = new MyWorker();
initializeImageProcessing();
let canvas = document.getElementById('gl');
const nv = new Niivue();
nv.setInterpolation(true);
nv.attachToCanvas(canvas);
var volumeList = [{ url: "./fa8.nii.gz"},];
nv.loadVolumes(volumeList);
