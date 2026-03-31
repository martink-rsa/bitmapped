import type { HardwarePreset, Palette, RGB } from 'bitmapped';
import { getPreset, listPresets, enumerateColorSpace } from 'bitmapped/presets';

const MAX_ENUMERABLE_COLORS = 32768;

/** Build a Palette from a HardwarePreset (handles both fixed-LUT and colorSpace) */
export function getPaletteForPreset(preset: HardwarePreset): Palette {
  if (preset.colorSpace && preset.colorSpace.type === 'programmable') {
    const totalColors = (1 << preset.colorSpace.bitsPerChannel) ** 3;
    if (totalColors <= MAX_ENUMERABLE_COLORS) {
      const colors = enumerateColorSpace(preset.colorSpace);
      return colors.map((c, i) => ({ color: c, name: `#${i}` }));
    }
  }
  if (preset.palette && preset.palette.length > 0) {
    return preset.palette;
  }
  if (preset.colorSpace) {
    const colors = enumerateColorSpace(preset.colorSpace);
    return colors.map((c, i) => ({ color: c, name: `#${i}` }));
  }
  return [];
}

/** Convert RGB to hex string */
export function rgbToHex(c: RGB): string {
  const r = c.r.toString(16).padStart(2, '0');
  const g = c.g.toString(16).padStart(2, '0');
  const b = c.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/** Get display-friendly preset info */
export function getPresetInfo(presetId: string) {
  const preset = getPreset(presetId);
  if (!preset) return null;
  return {
    preset,
    palette: getPaletteForPreset(preset),
    hexColors: getPaletteForPreset(preset).map((p) => rgbToHex(p.color)),
  };
}

/** Get all presets grouped by category */
export function getPresetsByCategory() {
  const presets = listPresets();
  const groups: Record<string, HardwarePreset[]> = {};
  for (const p of presets) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  }
  return groups;
}

export { getPreset, listPresets };
