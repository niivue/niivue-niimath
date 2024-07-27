self.importScripts("niimath.js?rnd="+Math.random())

self.addEventListener('message', function(e) {
  const file = e.data.blob || undefined
  const args = e.data.cmd || ['arg1', 'arg2']
  const outName = e.data.outName || ['out.nii']
  if ((file === undefined) || (args.length < 1))
    return
  const inName = file.name
  var fr = new FileReader()
  fr.readAsArrayBuffer(file)
  fr. onloadend = function (e) {
      var data = new Uint8Array(fr.result)
      Module.FS_createDataFile(".", inName, data, true, true)
      // Call the main function and capture the exit code
      const exitCode = Module.callMain(args)
      let out_bin = Module.FS_readFile(outName)
      // binary output file nii or mz3
      let file = new Blob([out_bin], {type: 'application/sla'})
      self.postMessage({"blob":file, "outName": outName, exitCode: exitCode})
      // Free virtual files
      Module.FS_unlink(inName)
      if (inName !== outName)
        Module.FS_unlink(outName)
  }

}, false)

