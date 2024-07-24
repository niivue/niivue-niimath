# NiiVue-NiiMath

[niivue](https://github.com/niivue) is a neuroimaging visualization tool that can be embedded into web pages or standalone applications. [niimath](https://github.com/rordenlab/niimath) is a clone of fslmaths that provides many image processing commands. This web page shows how niimath (after being compiled to WebAssembly) can be used as a NiiVue plugin to allow rapid image processing using familiar commands.

### Live Demo

Try out [this repository in a live demo](https://niivue.github.io/niivue-niimath/)

### Compiling

You can host your own instance locally, allowing you to tume this distribution.

```
git clone https://github.com/niivue/niivue-niimath
cd niivue-niimath
npm install
npm run dev
```

### Commands

You can use many of the commands familiar to fslmaths users: 

- `bandpass` <hp> <lp> <tr> : Butterworth filter, highpass and lowpass in Hz,TR in seconds (zero-phase 2*2nd order filtfilt)
- `bptfm` <hp> <lp> : Same as bptf but does not remove mean (emulates fslmaths < 5.0.7)
- `bwlabel` <conn> : Connected component labelling for non-zero voxels (conn sets neighbors: 6, 18, 26)
- `c2h` : reverse h2c transform
- `ceil` : round voxels upwards to the nearest integer
- `crop` <tmin> <tsize> : remove volumes, starts with 0 not 1! Inputting -1 for a size will set it to the full range
- `dehaze` <mode> : set dark voxels to zero (mode 1..5; higher yields more surviving voxels)
- `detrend` : remove linear trend (and mean) from input
- `demean` : remove average signal across volumes (requires 4D input)
- `edt` : estimate Euler Distance Transform (distance field). Assumes isotropic input
- `floor` : round voxels downwards to the nearest integer
- `mod` : modulus fractional remainder - same as '-rem' but includes fractions
- `otsu` <mode> : binarize image using Otsu''s method (mode 1..5; higher yields more bright voxels))
- `power` <exponent> : raise the current image by following exponent
- `h2c` : convert CT scans from 'Hounsfield' to 'Cormack' units to emphasize soft tissue contrast
- `resize` <X> <Y> <Z> <m> : grow (>1) or shrink (<1) image. Method <m> (0=nearest,1=linear,2=spline,3=Lanczos,4=Mitchell)\n");
- `round` : round voxels to the nearest integer
- `sobel` : fast edge detection
- `sobel_binary` : sobel creating binary edge
- `tensor_2lower` : convert FSL style upper triangle image to NIfTI standard lower triangle order
- `tensor_2upper` : convert NIfTI standard lower triangle image to FSL style upper triangle order
- `tensor_decomp_lower` : as tensor_decomp except input stores lower diagonal (AFNI, ANTS, Camino convention)
- trunc : truncates the decimal value from floating point value and returns integer value
- `unsharp` <sigma> <scl> : edge enhancing unsharp mask (sigma in mm, not voxels; 1.0 is typical for amount (scl))
- `dog` <sPos> <sNeg> : difference of gaussian with zero-crossing edges (positive and negative sigma mm)

### Voxels to Mesh

This project also includes the features of [nii2mesh](https://github.com/neurolabusc/nii2mesh). While those features are described in more details on that page, here is a simple guide.

 - Load the voxel-based volume you want to meshify. You can drag and drop an image or you can use the `Volumes` menu to load an image.
 - Select one of the `meshify` items from the `Operations` menu (`meshify medium` is a good starting point).
 - Press `Process Image` to apply your selected meshification.
 - Optionally, if you want to further decimate your mesh, press the `Simplify Mesh` button. This will create smaller files, albeit with less detail.
 - Press `Save Mesh` to save your mesh.

Note that you can run the fslmaths operations described in the previous section before your selected [nii2mesh](https://github.com/neurolabusc/nii2mesh) options. Consider the operation `-s 2 -mesh -i m -l 1 -b 1 -s 100 -r 0.05`. This will apply a 2mm smooth (`-s 2`) before creating a mesh. The mesh will use a medium intensity isosurface (`-i m`), only extract the largest object (`-l 1`), fill bubbles (`-b 1`) and smooth the mesh with 100 iterations (`-s 100`), reducing the mesh to only retain 5% of the original triangles (`-r 0.05`).


### Referencing

This work is described in the following publication.

 - Rorden C, Webster M, Drake C, Jenkinson M, Clayden JD, Li N, Hanayik T ([2024](https://apertureneuro.org/article/94384-niimath-and-fslmaths-replication-as-a-method-to-enhance-popular-neuroimaging-tools)) niimath and fslmaths: replication as a method to enhance popular neuroimaging tools. Aperture Neuro https://doi.org/10.52294/001c.94384
