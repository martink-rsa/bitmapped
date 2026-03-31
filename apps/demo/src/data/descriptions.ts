export interface SystemDescription {
  tagline: string;
  era: string;
  maker: string;
  explanation: string;
}

export const SYSTEM_DESCRIPTIONS: Record<string, SystemDescription> = {
  nes: {
    tagline: '16x16 attribute blocks, composite-generated palette',
    era: '1983 \u00b7 8-bit Console',
    maker: 'Nintendo',
    explanation:
      'The NES assigns colors in 16\u00d716 pixel blocks \u2014 every 2\u00d72 group of tiles shares one 4-color palette. This forces color boundaries to align to a coarse grid, creating the blocky color transitions visible in every NES game. The PPU generates colors via NTSC composite signal, which is why there\'s no single "correct" RGB palette \u2014 different TVs display different colors.',
  },
  gameboy: {
    tagline: '4 shades of green on a tiny LCD',
    era: '1989 \u00b7 Handheld',
    maker: 'Nintendo',
    explanation:
      'The Game Boy has no color \u2014 just 4 shades produced by a green-tinted STN LCD. The entire screen shares a single palette register that maps pixel values to shade levels. Despite this extreme limitation, artists created remarkably readable graphics through careful contrast management and dithering patterns.',
  },
  gbc: {
    tagline: '15-bit RGB with per-tile palette freedom',
    era: '1998 \u00b7 Handheld',
    maker: 'Nintendo',
    explanation:
      'The Game Boy Color upgraded to 15-bit RGB (32,768 colors) with 8 background palettes of 4 colors each. Each 8\u00d78 tile independently selects its palette, giving artists much more color freedom than the NES while keeping the tile-based structure.',
  },
  snes: {
    tagline: '15-bit RGB, per-tile palette selection, hardware blending',
    era: '1990 \u00b7 16-bit Console',
    maker: 'Nintendo',
    explanation:
      'The SNES PPU offers 32,768 colors with 256 available simultaneously, organized into 8 palettes of 16 colors. Each tile independently picks its palette \u2014 no attribute clash. Hardware color math can produce on-screen colors beyond the 256 palette entries, creating the distinctive transparency effects seen in many SNES games.',
  },
  gba: {
    tagline: '15-bit bitmap mode \u2014 every pixel independent',
    era: '2001 \u00b7 Handheld',
    maker: 'Nintendo',
    explanation:
      'In Mode 3 (bitmap), the GBA writes 15-bit RGB values directly to a 240\u00d7160 framebuffer with no palette or tile restrictions. Every pixel is independent, making it the simplest retro system to emulate \u2014 just quantize each color to RGB555.',
  },
  genesis: {
    tagline: '9-bit RGB with nonlinear DAC and composite dithering',
    era: '1988 \u00b7 16-bit Console',
    maker: 'Sega',
    explanation:
      'The Genesis has only 512 colors (3 bits per channel), but its DAC response is nonlinear \u2014 the 8 brightness levels per channel are NOT evenly spaced. This gives Genesis graphics their characteristic "crunchy" color posterization. Artists compensated with systematic dithering patterns that blended smoothly on composite CRT displays.',
  },
  sms: {
    tagline: '6-bit RGB, 32 simultaneous from 64',
    era: '1985 \u00b7 8-bit Console',
    maker: 'Sega',
    explanation:
      'The Master System uses 2 bits per RGB channel (64 total colors) with 32 available simultaneously across 2 palettes of 16. Each 8\u00d78 tile selects one of the two palettes. The limited color depth gives SMS graphics a distinctly bold, saturated look.',
  },
  'game-gear': {
    tagline: '12-bit RGB \u2014 the colorful SMS',
    era: '1990 \u00b7 Handheld',
    maker: 'Sega',
    explanation:
      'The Game Gear uses the same tile engine as the Master System but with 12-bit color (4,096 total colors). It renders at 256\u00d7192 internally but displays only a 160\u00d7144 viewport \u2014 giving it a more zoomed-in, detailed look.',
  },
  'atari-2600': {
    tagline: '4 colors per scanline \u2014 racing the beam',
    era: '1977 \u00b7 Console',
    maker: 'Atari',
    explanation:
      'The Atari 2600 has no framebuffer at all. The CPU must update color registers in real-time as each scanline draws, choosing just 4 colors per horizontal line from a 128-color NTSC palette. This extreme constraint is why 2600 graphics have that unmistakable chunky, banded look.',
  },
  'neo-geo': {
    tagline: '65K colors, 256 palettes \u2014 arcade power at home',
    era: '1990 \u00b7 Arcade / Console',
    maker: 'SNK',
    explanation:
      'The Neo Geo uses a unique 16-bit color format with a shared "dark bit" that extends each 5-bit channel to 6 effective bits, producing 65,536 possible colors. With 256 palettes of 16 colors and an all-sprite architecture, it delivered arcade-quality visuals at home.',
  },
  ps1: {
    tagline: '15-bit framebuffer with characteristic ordered dither',
    era: '1994 \u00b7 Console',
    maker: 'Sony',
    explanation:
      'The PS1 GPU internally computes color at 24-bit precision but writes to a 15-bit framebuffer. During this conversion, it applies a distinctive asymmetric 4\u00d74 ordered dither pattern. This banding is visible in virtually every PS1 game \u2014 "PS1-style" has become an aesthetic genre.',
  },
  'virtual-boy': {
    tagline: '4 shades of red, stereoscopic 3D',
    era: '1995 \u00b7 Console',
    maker: 'Nintendo',
    explanation:
      'The Virtual Boy displays only 4 shades of red on black, produced by scanning a linear array of red LEDs with oscillating mirrors. Despite the monochrome palette, the relatively high resolution (384\u00d7224 per eye) allowed for surprisingly detailed graphics.',
  },
  colecovision: {
    tagline: 'TMS9918A \u2014 2 colors per 8-pixel row',
    era: '1982 \u00b7 Console',
    maker: 'Coleco',
    explanation:
      'The ColecoVision uses the TMS9918A video chip shared with the MSX and TI-99. Its key constraint is 2 colors per 8-pixel horizontal row within each 8\u00d78 tile. This is more flexible than the ZX Spectrum but still forces careful color planning.',
  },
  'zx-spectrum': {
    tagline:
      'Attribute clash \u2014 2 colors per 8\u00d78 cell, brightness locked',
    era: '1982 \u00b7 Home Computer',
    maker: 'Sinclair',
    explanation:
      'Every 8\u00d78 pixel cell can use only 2 colors (ink and paper), and both must share the same brightness level. This "attribute clash" is the Spectrum\'s most famous visual signature. Artists developed ingenious techniques to work within these constraints.',
  },
  'c64-hires': {
    tagline: '2 colors per 8\u00d78 cell from 16 fixed',
    era: '1982 \u00b7 Home Computer',
    maker: 'Commodore',
    explanation:
      'In high-resolution mode, the C64 allows 2 colors per 8\u00d78 cell \u2014 similar to the ZX Spectrum, but without the brightness-locking constraint and with a richer 16-color palette.',
  },
  c64: {
    tagline: 'Iconic VIC-II 16-color palette',
    era: '1982 \u00b7 Home Computer',
    maker: 'Commodore',
    explanation:
      "The C64's VIC-II chip generates 16 colors as YUV composite, so the exact RGB values depend on interpretation. Multiple palette standards exist (Pepto, Colodore, VICE). The specific rendering varies by palette variant selected.",
  },
  'c64-multicolor': {
    tagline: '4 colors per 4\u00d78 cell, double-wide pixels',
    era: '1982 \u00b7 Home Computer',
    maker: 'Commodore',
    explanation:
      'Multicolor mode trades horizontal resolution for more colors: each 4\u00d78 cell gets 4 colors (1 global background + 3 per-cell), but pixels are double-wide (160\u00d7200 effective). This mode was used by the majority of C64 games.',
  },
  vic20: {
    tagline: '16 colors, character-based graphics only',
    era: '1980 \u00b7 Home Computer',
    maker: 'Commodore',
    explanation:
      'The VIC-20 has no bitmap mode \u2014 all graphics are drawn by redefining character shapes. Each 8\u00d78 character cell gets 2 colors from a 16-color palette.',
  },
  'apple2-hires': {
    tagline: 'NTSC artifact colors \u2014 purple/green or blue/orange per byte',
    era: '1977 \u00b7 Home Computer',
    maker: 'Apple',
    explanation:
      "The Apple II is fundamentally monochrome \u2014 color exists only as an artifact of NTSC composite video encoding. Each 7-pixel byte selects one of two color groups via its high bit. The resulting colors depend entirely on your TV's NTSC decoder.",
  },
  'apple2-lores': {
    tagline: '40\u00d748 resolution, 16 colors',
    era: '1977 \u00b7 Home Computer',
    maker: 'Apple',
    explanation:
      "Apple II Lo-Res mode provides 16 colors at a very low 40\u00d748 block resolution. Each block is independently colored, making it the Apple II's simplest graphics mode.",
  },
  'amiga-ocs': {
    tagline: '12-bit RGB, 32 simultaneous from 4,096',
    era: '1985 \u00b7 Home Computer',
    maker: 'Commodore',
    explanation:
      "The Amiga OCS uses bitplane-based graphics with up to 5 planes (32 colors) from a 12-bit RGB palette. The Copper coprocessor can change palette entries mid-frame, enabling smooth gradient backgrounds and color cycling that define the Amiga's visual identity.",
  },
  'amiga-ham6': {
    tagline: 'Hold-And-Modify \u2014 all 4,096 colors with horizontal fringing',
    era: '1985 \u00b7 Home Computer',
    maker: 'Commodore',
    explanation:
      'HAM6 is the Amiga\'s signature display mode. Each pixel either selects from a 16-color base palette OR modifies just one RGB channel of the previous pixel. This lets all 4,096 colors appear simultaneously, but sharp horizontal color changes cause visible "fringing."',
  },
  'amiga-ehb': {
    tagline: '64 colors \u2014 32 chosen + 32 at half brightness',
    era: '1985 \u00b7 Home Computer',
    maker: 'Commodore',
    explanation:
      "Extra Half-Brite mode adds a 6th bitplane that displays the pixel's color at half its normal brightness. This doubles the effective palette to 64 colors with no processing overhead.",
  },
  'cpc-mode0': {
    tagline: '3-level RGB \u2014 16 from 27 unique colors',
    era: '1984 \u00b7 Home Computer',
    maker: 'Amstrad',
    explanation:
      'The Amstrad CPC has a unique color system: each RGB channel has 3 voltage levels (off/half/full), producing exactly 27 possible colors. Mode 0 allows 16 of these 27 at 160\u00d7200, with no attribute clash.',
  },
  'cpc-mode1': {
    tagline: '3-level RGB \u2014 4 from 27 at higher resolution',
    era: '1984 \u00b7 Home Computer',
    maker: 'Amstrad',
    explanation:
      'Mode 1 doubles the horizontal resolution to 320\u00d7200 but drops to only 4 simultaneous colors from the 27 available. This trade-off was the most common mode for CPC games.',
  },
  'bbc-micro': {
    tagline: '8 pure RGB colors, no attribute clash',
    era: '1981 \u00b7 Home Computer',
    maker: 'Acorn',
    explanation:
      'The BBC Micro uses simple 3-bit RGB (8 colors) with a programmable logical-to-physical color mapping. Its key advantage: no attribute clash. Every pixel is independently colored.',
  },
  msx: {
    tagline: 'TMS9918A \u2014 15 fixed colors, 2 per pixel row in tile',
    era: '1983 \u00b7 Home Computer',
    maker: 'Multiple',
    explanation:
      "MSX1 computers use the same TMS9918A chip as the ColecoVision. Each 8\u00d78 tile can assign 2 colors per 8-pixel horizontal row \u2014 a constraint between the ZX Spectrum's per-cell and the C64's per-cell limits.",
  },
  msx2: {
    tagline: '9-bit RGB, up to 256 on-screen colors',
    era: '1985 \u00b7 Home Computer',
    maker: 'Multiple',
    explanation:
      "The MSX2's V9938 chip brought 512-color programmable RGB palette (3 bits per channel) and a Screen 8 bitmap mode with 256 simultaneous colors from a fixed RGB332 palette.",
  },
  'atari-st': {
    tagline: '9-bit RGB, 16 from 512',
    era: '1985 \u00b7 Home Computer',
    maker: 'Atari',
    explanation:
      "The Atari ST uses 3-bit-per-channel (512 color) space with 16 simultaneous colors at 320\u00d7200. Unlike the Genesis, the ST's DAC is linear. No sprites and no attribute clash.",
  },
  'atari-ste': {
    tagline: '12-bit RGB, 16 from 4,096',
    era: '1989 \u00b7 Home Computer',
    maker: 'Atari',
    explanation:
      "The STE upgraded the ST's palette to 12-bit RGB (4,096 colors) \u2014 matching the Amiga's OCS. Same 16 simultaneous colors at 320\u00d7200, but with 8\u00d7 more color precision.",
  },
  'thomson-mo5': {
    tagline: '16 PBGR colors, 2 per 8\u00d71 row',
    era: '1984 \u00b7 Home Computer',
    maker: 'Thomson',
    explanation:
      'The Thomson MO5 uses a unique 4-bit PBGR palette where the P bit controls "pastel" mode. Color is constrained to 2 per 8-pixel horizontal row, giving it similar attribute artifacts to the MSX.',
  },
  macintosh: {
    tagline: 'Pure 1-bit monochrome at 512\u00d7342',
    era: '1984 \u00b7 Home Computer',
    maker: 'Apple',
    explanation:
      "The original Macintosh had no color at all \u2014 every pixel was either black or white. This extreme constraint made dithering essential. Bill Atkinson's dithering algorithm was literally invented for this machine.",
  },
  'cga-pal0': {
    tagline: 'Green/Red/Brown + background \u2014 the classic CGA look',
    era: '1981 \u00b7 IBM PC',
    maker: 'IBM',
    explanation:
      "CGA's Mode 4 locks the screen to one of two fixed 4-color sub-palettes. Palette 0 gives you green, red, and brown. The brown at index 6 is actually dark yellow with the green channel reduced by the IBM 5153 monitor's circuitry.",
  },
  'cga-pal1': {
    tagline: 'Cyan/Magenta/White + background',
    era: '1981 \u00b7 IBM PC',
    maker: 'IBM',
    explanation:
      'CGA Palette 1 offers cyan, magenta, and white \u2014 used slightly less often than Palette 0 but seen in many adventure games. Only 4 colors at 320\u00d7200, locked to a fixed set.',
  },
  'cga-composite': {
    tagline: '16 artifact colors from NTSC composite tricks',
    era: '1981 \u00b7 IBM PC',
    maker: 'IBM',
    explanation:
      "When CGA's output is viewed through NTSC composite, pixel patterns create artifact colors similar to the Apple II. The pixel clock at 4\u00d7 the NTSC subcarrier frequency produces up to 16 distinct artifact hues.",
  },
  tandy: {
    tagline: 'Full 16 RGBI colors at 320\u00d7200',
    era: '1984 \u00b7 IBM PC',
    maker: 'Tandy',
    explanation:
      "The Tandy/PCjr removed CGA's biggest limitation: the sub-palette lock. All 16 RGBI colors are available at every pixel in 320\u00d7200. Sierra adventure games are the classic example of Tandy-enhanced graphics.",
  },
  ega: {
    tagline: '16 from 64 (2-bit RGB with secondary intensity)',
    era: '1984 \u00b7 IBM PC',
    maker: 'IBM',
    explanation:
      'EGA expanded the master palette to 64 colors via a unique rgbRGB encoding \u2014 each channel gets a primary bit (2/3 intensity) and a secondary bit (1/3 intensity), producing 4 levels per channel.',
  },
  'vga-mode13h': {
    tagline: '256 from 262,144 \u2014 the golden age of PC pixel art',
    era: '1987 \u00b7 IBM PC',
    maker: 'IBM',
    explanation:
      'Mode 13h is the legendary 320\u00d7200\u00d7256 mode that powered the golden age of PC gaming. The VGA DAC offers 262,144 colors (6 bits per channel), with 256 available simultaneously via a fully programmable palette.',
  },
  'vga-mode12h': {
    tagline: '16 from 262,144 at 640\u00d7480',
    era: '1987 \u00b7 IBM PC',
    maker: 'IBM',
    explanation:
      'Mode 12h provides higher resolution (640\u00d7480) with only 16 simultaneous colors from the full VGA 262K palette. Used primarily for business graphics and GUIs like early Windows.',
  },
  cps1: {
    tagline: "192 palettes \u00d7 16 colors \u2014 Street Fighter II's engine",
    era: '1988 \u00b7 Arcade',
    maker: 'Capcom',
    explanation:
      'The CPS-1 board powered Street Fighter II and Final Fight. Its 16-bit color palette supports 4,096 simultaneous colors via 192 palettes of 16. Every 16\u00d716 tile independently selects its palette.',
  },
  cps2: {
    tagline: 'CPS-1 enhanced \u2014 more sprites, same color system',
    era: '1993 \u00b7 Arcade',
    maker: 'Capcom',
    explanation:
      "The CPS-2 shares the CPS-1's video architecture (4,096 colors, 16 per tile) but adds more sprite RAM for larger characters. Marvel vs. Capcom and Darkstalkers pushed the hardware further.",
  },
  cps3: {
    tagline: '64-256 colors per tile, hardware sprite scaling',
    era: '1996 \u00b7 Arcade',
    maker: 'Capcom',
    explanation:
      'The CPS-3 is a major leap: tiles can use 64 or 256 colors (6-8bpp). Hardware sprite scaling enables the smooth zoom effects in Street Fighter III. Only six games were made for the system.',
  },
  'sega-system16': {
    tagline: "12-bit RGB, 4096 on-screen \u2014 Golden Axe's engine",
    era: '1985 \u00b7 Arcade',
    maker: 'Sega',
    explanation:
      "Sega System 16 uses 12-bit RGB (4,096 colors) with shadow/highlight modes. The system's sprite layer, tilemap layers, and per-tile palette selection gave artists significant creative freedom.",
  },
  'namco-galaxian': {
    tagline: 'PROM-fixed palette \u2014 colors burned into hardware',
    era: '1979 \u00b7 Arcade',
    maker: 'Namco',
    explanation:
      'Colors are permanently programmed into hardware PROMs at the factory \u2014 they cannot be changed by software. Each sprite gets 4 colors from pre-defined palette sets.',
  },
  pico8: {
    tagline: '16 hand-picked colors at 128\u00d7128',
    era: '2015 \u00b7 Fantasy Console',
    maker: 'Lexaloffle',
    explanation:
      "PICO-8's 16-color palette was carefully curated to be maximally useful for pixel art at tiny resolutions. The fixed constraints (128\u00d7128 screen, 16 colors) are intentional creative limitations, not hardware restrictions.",
  },
  tic80: {
    tagline: '16 customizable colors at 240\u00d7136',
    era: '2017 \u00b7 Fantasy Console',
    maker: 'Nesbox',
    explanation:
      'TIC-80 is an open-source fantasy console that lets developers customize their 16-color palette from the full 24-bit RGB space. The default "Sweetie 16" palette is a popular community-designed set.',
  },
  picotron: {
    tagline: "64 colors at 480\u00d7270 \u2014 PICO-8's grown-up sibling",
    era: '2024 \u00b7 Fantasy Workstation',
    maker: 'Lexaloffle',
    explanation:
      "Picotron is PICO-8's successor with 4\u00d7 the resolution, 4\u00d7 the palette size, and a full desktop-like operating environment. 64 colors from 4 switchable palette tables enable complex color effects.",
  },
};
