self.addEventListener('message', function(e) {
    const file = e.data.blob
    const cmd = e.data.cmd  || 'niimath in.nii -s 22 out.nii'
    const outName = e.data.outName
    prepare_and_simplify(file, cmd, outName)
}, false)

var Module = {
    'print': function(text) {
        console.log(text)
        self.postMessage({"log":text})
    }
}

self.importScripts("niimath.js?rnd="+Math.random())

let last_file_name = undefined

function prepare_and_simplify(file, cmd, outName) {
    var filename = file.name
    if (last_file_name !== undefined)
    	Module.FS_unlink(last_file_name)
    last_file_name = filename
    var fr = new FileReader()
    fr.readAsArrayBuffer(file)
    fr. onloadend = function (e) {
        var data = new Uint8Array(fr.result)
        Module.FS_createDataFile(".", filename, data, true, true)
        simplify(filename, cmd, outName)
    }
}

function simplify(filename, cmd, outName) {
    Module.ccall("simplify", // c function name
        undefined, // return
        ["string"], // param
        [cmd]
    )
    let out_bin = Module.FS_readFile(outName)
    // sla should work for binary mz3
    let file = new Blob([out_bin], {type: 'application/sla'})
    self.postMessage({"blob":file, "outName": outName})
}
