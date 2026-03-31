import type { HardwarePreset } from '../core/types.js';

// Computers
import { c64Pepto, c64Colodore } from './computers/c64.js';
import { c64Hires } from './computers/c64-hires.js';
import { c64Multicolor } from './computers/c64-multicolor.js';
import { zxSpectrum } from './computers/zx-spectrum.js';
import { appleIILoRes, appleIIHiRes } from './computers/apple-ii.js';
import { amigaOCS } from './computers/amiga.js';
import { amigaHAM } from './computers/amiga-ham.js';
import { amigaEHB } from './computers/amiga-ehb.js';
import { vic20 } from './computers/vic20.js';
import { cpcMode0, cpcMode1 } from './computers/amstrad-cpc.js';
import { bbcMicroMode2 } from './computers/bbc-micro.js';
import { msx } from './computers/msx.js';
import { msx2 } from './computers/msx2.js';
import { atariST } from './computers/atari-st.js';
import { atariSTE } from './computers/atari-ste.js';
import { thomsonMO5 } from './computers/thomson-mo5.js';
import { macintosh } from './computers/macintosh.js';

// Nintendo
import {
  gameBoyDMG,
  gameBoyPocket,
  gameBoyColor,
} from './nintendo/game-boy.js';
import { nesNTSC, nesPAL } from './nintendo/nes.js';
import { snes } from './nintendo/snes.js';
import { gba } from './nintendo/gba.js';
import { virtualBoy } from './nintendo/virtual-boy.js';

// Sega
import { masterSystem } from './sega/master-system.js';
import { genesis, genesisPAL } from './sega/genesis.js';
import { gameGear } from './sega/game-gear.js';

// IBM PC
import { cgaPal0Low, cgaPal0High } from './ibm-pc/cga-mode4-pal0.js';
import { cgaPal1Low, cgaPal1High } from './ibm-pc/cga-mode4-pal1.js';
import { cgaComposite } from './ibm-pc/cga-composite.js';
import { tandy } from './ibm-pc/tandy.js';
import { ega } from './ibm-pc/ega.js';
import { vgaMode13h } from './ibm-pc/vga-mode13h.js';
import { vgaMode12h } from './ibm-pc/vga-mode12h.js';

// Other
import { atari2600NTSC, atari2600PAL } from './other/atari-2600.js';
import { ps1 } from './other/ps1.js';
import { neoGeo } from './other/neo-geo.js';
import { colecovision } from './other/colecovision.js';

// Arcade
import { cps1 } from './arcade/cps1.js';
import { cps2 } from './arcade/cps2.js';
import { cps3 } from './arcade/cps3.js';
import { segaSystem16 } from './arcade/sega-system16.js';
import { namcoGalaxian } from './arcade/namco-galaxian.js';

// Fantasy
import { pico8 } from './fantasy/pico8.js';
import { tic80 } from './fantasy/tic80.js';
import { picotron } from './fantasy/picotron.js';

const ALL_PRESETS: HardwarePreset[] = [
  // Computers
  c64Pepto,
  c64Colodore,
  c64Hires,
  c64Multicolor,
  zxSpectrum,
  appleIILoRes,
  appleIIHiRes,
  amigaOCS,
  amigaHAM,
  amigaEHB,
  vic20,
  cpcMode0,
  cpcMode1,
  bbcMicroMode2,
  msx,
  msx2,
  atariST,
  atariSTE,
  thomsonMO5,
  macintosh,
  // Nintendo
  gameBoyDMG,
  gameBoyPocket,
  gameBoyColor,
  nesNTSC,
  nesPAL,
  snes,
  gba,
  virtualBoy,
  // Sega
  masterSystem,
  genesis,
  genesisPAL,
  gameGear,
  // IBM PC
  cgaPal0Low,
  cgaPal0High,
  cgaPal1Low,
  cgaPal1High,
  cgaComposite,
  tandy,
  ega,
  vgaMode13h,
  vgaMode12h,
  // Other
  atari2600NTSC,
  atari2600PAL,
  ps1,
  neoGeo,
  colecovision,
  // Arcade
  cps1,
  cps2,
  cps3,
  segaSystem16,
  namcoGalaxian,
  // Fantasy
  pico8,
  tic80,
  picotron,
];

const PRESET_MAP = new Map<string, HardwarePreset>(
  ALL_PRESETS.map((p) => [p.id, p]),
);

/** Look up a preset by its unique ID */
export function getPreset(id: string): HardwarePreset | undefined {
  return PRESET_MAP.get(id);
}

/** Return all registered presets */
export function listPresets(): HardwarePreset[] {
  return [...ALL_PRESETS];
}

/** Return presets filtered by category */
export function listPresetsByCategory(
  category: HardwarePreset['category'],
): HardwarePreset[] {
  return ALL_PRESETS.filter((p) => p.category === category);
}
