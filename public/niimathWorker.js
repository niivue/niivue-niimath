self.addEventListener('message', function(e) {
  const file = e.data.blob || undefined
  const args = e.data.cmd || ['arg1', 'arg2']
  const outName = e.data.outName || ['out.nii']
  doWasm(file, args, outName)
}, false)

self.importScripts("niimath.js?rnd="+Math.random())

function doWasm(file, args, outName) {
  if ((file === undefined) || (args.length < 1))
    return
  const argc = args.length + 1
  const argv = ['niimath']
  // Allocate memory and set argument values
  for (let i = 0; i < (argc - 1); i++) {
    argv.push(Module.allocateUTF8(args[i]))
  }
  // Convert argv array to memory layout expected by main
  const argvPtr = Module._malloc(argc * 4)
  for (let i = 0; i < argc; i++) {
    Module.setValue(argvPtr + i * 4, argv[i], 'i32')
  }
  var inName = file.name
  var fr = new FileReader()
  fr.readAsArrayBuffer(file)
  fr. onloadend = function (e) {
      var data = new Uint8Array(fr.result)
      Module.FS_createDataFile(".", inName, data, true, true)
      // Call the main function and capture the exit code
      const exitCode = Module._main(argc, argvPtr)
      let out_bin = Module.FS_readFile(outName)
      // binary output file nii or mz3
      let file = new Blob([out_bin], {type: 'application/sla'})
      self.postMessage({"blob":file, "outName": outName, exitCode: exitCode})
      // Free allocated memory
      for (let i = 0; i < argc; i++) {
        Module._free(argv[i])
      }
      Module._free(argvPtr)
      // Free virtual files
      Module.FS_unlink(inName)
      if (inName !== outName)
        Module.FS_unlink(outName)
  }
}
