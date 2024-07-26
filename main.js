import { Niivue, NVMeshUtilities } from '@niivue/niivue'

async function main() {
  const NiimathWorker = await new Worker('./niimathWorker.js')
  const loadingCircle = document.getElementById('loadingCircle')
  let startTime = Date.now()
  function removeExtension(filename) {
    if (filename.endsWith('.gz')) {
      filename = filename.slice(0, -3)
    }
    let lastDotIndex = filename.lastIndexOf('.')
    if (lastDotIndex !== -1) {
      filename = filename.slice(0, lastDotIndex)
    }
    return filename
  }
  
  saveImageBtn.onclick = function () {
    if ((nv1.volumes.length < 1) && (nv1.meshes.length < 1)) {
      window.alert('No volume open: you can open one using the "Volume" menu. Alternatively, drag and drop a image file.')
    }
    nv1.volumes[0].saveToDisk('niimath.nii')
    if (nv1.volumes.length > 1)  {
      nv1.volumes[1].saveToDisk('overlay.nii')
    }
  }
  saveMeshBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert('No mesh open: you can create one with a "mesh" operation. Alternatively, drag and drop a mesh file.')
    } else {
      saveDialog.show()
    }
  }
  applySaveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      return
    }
    let format = 'obj'
    if (formatSelect.selectedIndex === 0) {
      format = 'mz3'
    }
    if (formatSelect.selectedIndex === 2) {
      format = 'stl'
    }
    NVMeshUtilities.saveMesh(nv1.meshes[0].pts, nv1.meshes[0].tris, `mesh.${format}`, true)
  }
  NiimathWorker.onmessage = async function (e) {
    if (e.data.blob instanceof Blob) {
      const reader = new FileReader()
      reader.onload = async () => {
        loadingCircle.classList.add('hidden')
        const outName = e.data.outName || 'test.nii'
        if (outName.endsWith('.mz3')) {
            if (nv1.meshes.length > 0) {
                nv1.removeMesh(nv1.meshes[0])
            }
            nv1.loadFromArrayBuffer(reader.result, outName)
        } else {
            if (nv1.volumes.length > 1) {
                nv1.removeVolume(nv1.volumes[1])
            }
            if (overlayCheck.checked) {
                await nv1.loadFromArrayBuffer(reader.result, outName)
                nv1.volumes[1].opacity = 0.5
                nv1.setColormap(nv1.volumes[1].id, 'red')
            } else {
                if (nv1.volumes.length > 0) {
                    nv1.removeVolume(nv1.volumes[0])
                }
                nv1.loadFromArrayBuffer(reader.result, outName)
            }
            nv1.setSliceType(nv1.sliceTypeMultiplanar)
        }
        let str = ` ${Date.now() - startTime}ms`
        document.getElementById('location').innerHTML = str
      }
      reader.readAsArrayBuffer(e.data.blob)
    }
  }
  processBtn.onclick = async function () {
    if (nv1.meshes.volumes < 1) {
        window.alert("No volume open for saving.")
        return
    }
    let inName = removeExtension(nv1.volumes[0].name) + '.nii'
    let outName = inName
    if (operationsText.value.includes("-mesh")) {
      outName = removeExtension(nv1.volumes[0].name) + '.mz3'
    }
    let args = operationsText.value.trim().split(/\s+/)
    args.unshift(inName)
    args.push(outName)
    startTime = Date.now()
    const niiBuffer = await nv1.saveImage().buffer
    loadingCircle.classList.remove('hidden')
    let nii = await new Blob([niiBuffer], {
      type: 'application/octet-stream'
    })
    let fileNii = await new File([nii], inName)
    NiimathWorker.postMessage({
        blob: fileNii,
        cmd: args,
        outName: outName
    })
  }
  operationSelect.onchange = function () {
    operationsText.value = operationSelect.value
  }
  volumeSelect.onchange = async function () {
    const selectedOption = volumeSelect.options[volumeSelect.selectedIndex]
    const txt = selectedOption.text
    if (volumeSelect.selectedIndex > 15) {
      nv1.volumes = []
      let fnm = 'https://niivue.github.io/niivue/images/' + txt
      nv1.loadMeshes([{ url: fnm }])
      return
    }
    let fnm = './' + txt
    if (volumeSelect.selectedIndex > 7) {
      fnm = 'https://niivue.github.io/niivue-demo-images/' + txt
    }
    if (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0])
    }
    nv1.volumes = []
    fnm += '.nii.gz'
    nv1.loadVolumes([{ url: fnm }])
  }
  simplifyBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert('No mesh open to simplify. Drag and drop a mesh or create a mesh from a voxel based image using a mesh operation.')
    } else {
      simplifyDialog.show()
    }
  }
  applySimpleBtn.onclick = function () {
      startTime = Date.now()
      loadingCircle.classList.remove('hidden')
      const shrinkValue = Math.min(Math.max(Number(shrinkSimplePct.value) / 100, 0.01), 1)
      if (shrinkValue >= 1)
        return
      const verts = nv1.meshes[0].pts.slice()
      const tris = nv1.meshes[0].tris.slice()
      const meshBuffer = NVMeshUtilities.createMZ3(verts, tris, false)
      let mz3 = new Blob([meshBuffer], {
          type: 'application/octet-stream'
      })
      let inName = 'mesh.mz3'
      let fileMz3 = new File([mz3], inName)
      let outName = 'mesh.mz3'
      let ops = 'niimath '+inName+' -r 0.1 '+outName
      NiimathWorker.postMessage({
          blob: fileMz3,
          outName: outName,
          cmd: ops,
      })
  }
  moreButton.onclick = function () {
    window.open('https://github.com/niivue/niivue-niimath#commands')
  }
  function handleLocationChange(data) {
    document.getElementById('location').innerHTML = '&nbsp;&nbsp;' + data.string
  }
  const defaults = {
    onLocationChange: handleLocationChange,
    backColor: [0.2, 0.2, 0.3, 1],
    show3Dcrosshair: true
  }
  const nv1 = new Niivue(defaults)
  nv1.onImageLoaded = () => {
    nv1.setSliceType(nv1.sliceTypeMultiplanar)
  }
  nv1.attachToCanvas(gl1)
  nv1.isAlphaClipDark = true
  nv1.setClipPlane([0.2, 0, 120])
  nv1.opts.dragMode = nv1.dragModes.pan
  nv1.setRenderAzimuthElevation(245, 15)
  nv1.opts.multiplanarForceRender = true
  nv1.opts.yoke3Dto2DZoom = true
  nv1.setInterpolation(true)
  await nv1.loadVolumes([{ url: './mni152.nii.gz' }])
}

main()
