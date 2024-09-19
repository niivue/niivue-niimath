import './style.css'
import { Niivue, SLICE_TYPE, SHOW_RENDER, MULTIPLANAR_TYPE } from '@niivue/niivue'
import { Niimath } from "@niivue/niimath"

// create niivue instance but don't setup the scene just yet
const nv = new Niivue();

// create niimath instance (will be initialized later)
const niimath = new Niimath();

// store a reference to an unedited image for 
// use when the user wants to change the command from the dropdown
let uneditedImage;

async function processImage(isOverlay) {
  loadingCircle.classList.remove('hidden')
  try {
    const imageIndex = 0;
    const niiBuffer = await nv.saveImage({ volumeByIndex: imageIndex }).buffer
    const niiFile = new File([niiBuffer], 'image.nii')
    const input = document.getElementById('command');
    const cmd = input.value;
    const imageProcessor = niimath.image(niiFile)
    // check if "mesh" is in the command, and set isMesh
    const isMesh = cmd.includes('mesh')
    // create array of commands by separating on spaces
    // trim any leading or trailing whitespace
    const commands = cmd.split(' ').map((c) => c.trim())
    imageProcessor.commands = [...commands]
    const outName = isMesh ? 'mesh.mz3' : 'image.nii'
    const processedBlob = await imageProcessor.run(outName) // don't use .gz
    const arrayBuffer = await processedBlob.arrayBuffer()
    if (!isOverlay) {
      nv.removeVolume(nv.volumes[0]);
    }
    await nv.loadFromArrayBuffer(arrayBuffer, outName)
    // set the colormap to the value of the color dropdown
    if (isOverlay) {
      setOverlayColor();
    }
    loadingCircle.classList.add('hidden')
  } catch (error) {
    loadingCircle.classList.add('hidden')
    console.error(error)
  }
}

// respond to our button press
function buttonProcessImage() {
  const isOverlay = overlayCheck.checked;
  processImage(isOverlay);
}

// set overlay opacity
function setOverlayOpacity() {
  const opacityString = overlayOpacity.value;
  const opacity = parseFloat(opacityString);
  if (nv.volumes.length > 1) {
    nv.setOpacity(1, opacity);
  }
}

// set overlay color
function setOverlayColor() {
  const overlayColor = document.getElementById('overlayColor');
  // get the text value of the selected option
  const colormap = overlayColor.options[overlayColor.selectedIndex].text;
  if (nv.volumes.length > 1) {
    nv.setColormap(nv.volumes[1].id, colormap)
  }

  // if meshes are present, set their color too
  if (nv.meshes.length > 0) {
    nv.setMeshProperty(nv.meshes[0].id, 'colormap', colormap);
  }
}

// on reset button click
function reset() {
  // reload the page
  location.reload();
}

// when overlay checkbox is checked hide or show the opacity slider and the color dropdown
function overlayChecked() {
  const overlayOpacity = document.getElementById('overlayOpacity');
  const overlayColor = document.getElementById('overlayColor');
  // get the labels too
  const overlayOpacityLabel = document.getElementById('overlayOpacityLabel');
  const overlayColorLabel = document.getElementById('overlayColorLabel');
  if (overlayCheck.checked) {
    overlayOpacity.style.display = 'inline';
    overlayColor.style.display = 'inline';
    overlayOpacityLabel.style.display = 'inline';
    overlayColorLabel.style.display = 'inline';
  } else {
    overlayOpacity.style.display = 'none';
    overlayColor.style.display = 'none';
    overlayOpacityLabel.style.display = 'none';
    overlayColorLabel.style.display = 'none';
  }
}

// populate overlay color dropdown
function populateOverlayColors() {
  const colormaps = nv.colormaps()
  const overlayColor = document.getElementById('overlayColor')
  for (let i = 0; i < colormaps.length; i++) {
    let option = document.createElement("option");
    option.text = colormaps[i];
    overlayColor.add(option);
  }
  // find the index of red and set it as the default
  const redIndex = colormaps.indexOf('red')
  overlayColor.selectedIndex = redIndex;
}

// populate moreCommands dropdown with some niimath command strings for users to try
function populateMoreCommands() {
  const moreCommands = document.getElementById('moreCommands');
  const commands = [
    '-dehaze -5 -dog 2 3.2',
    '-dehaze -5',
    '-mesh -i m -b',
    '-fmedian',
    '-fmean',
    '-sobel',
    '-sobel_binary',
    '-otsu 5',
    '-recip',
  ];
  for (let i = 0; i < commands.length; i++) {
    let option = document.createElement("option");
    option.text = commands[i];
    moreCommands.add(option);
  }
  // set the default command
  moreCommands.selectedIndex = 0;
}

// when the user selects a command from the moreCommands dropdown
function moreCommandsSelected() {
  const moreCommands = document.getElementById('moreCommands');
  const command = moreCommands.options[moreCommands.selectedIndex].text;
  const input = document.getElementById('command');
  input.value = command;

  // if a mesh is there, remove it
  if (nv.meshes.length > 0) {
    // loop through all meshes and remove them
    for (let i = 0; i < nv.meshes.length; i++) {
      nv.removeMesh(nv.meshes[i]);
    }
  }

  // if an overlay is there, remove it
  if (nv.volumes.length > 1) {
    // loop over all volumes from 1 to the end
    for (let i = 1; i < nv.volumes.length; i++) {
      nv.removeVolume(nv.volumes[i]);
    }
  } else {
    // restore the unedited image
    nv.removeVolume(nv.volumes[0]);
    nv.addVolume(uneditedImage);
  }

  // then click the process button
  buttonProcessImage();
}

async function loadImage(url) {
  // remove all meshes and volumes
  for (let i = 0; i < nv.meshes.length; i++) {
    nv.removeMesh(nv.meshes[i]);
  }
  for (let i = 0; i < nv.volumes.length; i++) {
    nv.removeVolume(nv.volumes[i]);
  }
  let volumeList = [{ url: url },];
  await nv.loadVolumes(volumeList);
  // set the unedited image to the loaded image
  uneditedImage = nv.volumes[0];
  nv.updateGLVolume();
}


async function main() {

  // populate overlay color dropdown
  populateOverlayColors();

  // populate moreCommands dropdown
  populateMoreCommands();

  // set overlay opacity
  overlayOpacity.oninput = setOverlayOpacity;

  // set overlay color
  overlayColor.onchange = setOverlayColor;

  // when overlay checkbox is checked
  overlayCheck.onchange = overlayChecked;

  // on reset button click
  resetButton.onclick = reset;

  // when the user selects a command from the moreCommands dropdown
  moreCommands.onchange = moreCommandsSelected;

  // enable our button after our WASM has been initialize
  function initializeImageProcessing() {
    // await initWasm();
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
    btn.onclick = async function () {
      let root = "https://niivue.github.io/niivue-demo-images/";
      if (i < 6)
        root = "./";
      let img = root + imgs[i] + ".nii.gz";
      await loadImage(img);
    };
    imgEl.appendChild(btn);
  }
  saveButton.onclick = function () {
    if (nv.volumes.length < 2)
      nv.saveImage({ filename: "niimath.nii.gz", isSaveDrawing: false, volumeByIndex: 0 });
    else
      nv.saveImage({ filename: "niimath.nii.gz", isSaveDrawing: false, volumeByIndex: 1 });
  }
  aboutButton.onclick = function () {
    const link = "https://github.com/rordenlab/niimath?tab=readme-ov-file#about"
    window.open(link, '_blank');
  }
  helpButton.onclick = function () {
    // open link in new tab
    const link = "https://github.com/rordenlab/niimath/blob/9f3a301be72c331b90ef5baecb7a0232e9b47ba4/src/niimath.c#L259"
    window.open(link, '_blank');
  }

  let canvas = document.getElementById('gl');
  nv.setInterpolation(true);
  nv.attachToCanvas(canvas);
  nv.setSliceType(SLICE_TYPE.MULTIPLANAR)
  nv.setMultiplanarLayout(MULTIPLANAR_TYPE.GRID)
  nv.opts.multiplanarShowRender = SHOW_RENDER.ALWAYS
  var volumeList = [{ url: "./fa8.nii.gz" },];
  await nv.loadVolumes(volumeList);
  uneditedImage = nv.volumes[0];

  // initialize niimath (loads wasm and sets up worker)
  await niimath.init();

  // enable our button after our WASM has been setup
  initializeImageProcessing();
}

main()