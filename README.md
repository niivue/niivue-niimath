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
