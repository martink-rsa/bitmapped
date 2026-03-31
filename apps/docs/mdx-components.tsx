import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import { LiveDemo } from './src/components/LiveDemo';
import { PaletteDisplay } from './src/components/PaletteDisplay';
import { SystemCard } from './src/components/SystemCard';
import { BeforeAfter } from './src/components/BeforeAfter';
import { CodeExample } from './src/components/CodeExample';

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(
  components?: Record<string, React.ComponentType>,
) {
  return {
    ...docsComponents,
    LiveDemo,
    PaletteDisplay,
    SystemCard,
    BeforeAfter,
    CodeExample,
    ...components,
  };
}
