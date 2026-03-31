// Registry
export { getPreset, listPresets, listPresetsByCategory } from './registry.js';

// Quantize utilities
export {
  expandBits,
  quantizeColor,
  enumerateColorSpace,
  sampleColorSpace,
  genesisQuantize,
} from './quantize.js';

// Computers
export { c64Pepto, c64Colodore } from './computers/c64.js';
export { c64Hires } from './computers/c64-hires.js';
export { c64Multicolor } from './computers/c64-multicolor.js';
export { zxSpectrum } from './computers/zx-spectrum.js';
export { appleIILoRes, appleIIHiRes } from './computers/apple-ii.js';
export { amigaOCS } from './computers/amiga.js';
export { amigaHAM } from './computers/amiga-ham.js';
export { amigaEHB } from './computers/amiga-ehb.js';
export { vic20 } from './computers/vic20.js';
export { cpcMode0, cpcMode1 } from './computers/amstrad-cpc.js';
export { bbcMicroMode2 } from './computers/bbc-micro.js';
export { msx } from './computers/msx.js';
export { msx2 } from './computers/msx2.js';
export { atariST } from './computers/atari-st.js';
export { atariSTE } from './computers/atari-ste.js';
export { thomsonMO5 } from './computers/thomson-mo5.js';
export { macintosh } from './computers/macintosh.js';

// Nintendo
export {
  gameBoyDMG,
  gameBoyPocket,
  gameBoyColor,
} from './nintendo/game-boy.js';
export { nesNTSC, nesPAL } from './nintendo/nes.js';
export { snes } from './nintendo/snes.js';
export { gba } from './nintendo/gba.js';
export { virtualBoy } from './nintendo/virtual-boy.js';

// Sega
export { masterSystem } from './sega/master-system.js';
export { genesis, genesisPAL } from './sega/genesis.js';
export { gameGear } from './sega/game-gear.js';

// IBM PC
export { cgaPal0Low, cgaPal0High } from './ibm-pc/cga-mode4-pal0.js';
export { cgaPal1Low, cgaPal1High } from './ibm-pc/cga-mode4-pal1.js';
export { cgaComposite } from './ibm-pc/cga-composite.js';
export { tandy } from './ibm-pc/tandy.js';
export { ega } from './ibm-pc/ega.js';
export { vgaMode13h } from './ibm-pc/vga-mode13h.js';
export { vgaMode12h } from './ibm-pc/vga-mode12h.js';

// Other
export { atari2600NTSC, atari2600PAL } from './other/atari-2600.js';
export { ps1 } from './other/ps1.js';
export { neoGeo } from './other/neo-geo.js';
export { colecovision } from './other/colecovision.js';

// Arcade
export { cps1 } from './arcade/cps1.js';
export { cps2 } from './arcade/cps2.js';
export { cps3 } from './arcade/cps3.js';
export { segaSystem16 } from './arcade/sega-system16.js';
export { namcoGalaxian } from './arcade/namco-galaxian.js';

// Fantasy
export { pico8 } from './fantasy/pico8.js';
export { tic80 } from './fantasy/tic80.js';
export { picotron } from './fantasy/picotron.js';
