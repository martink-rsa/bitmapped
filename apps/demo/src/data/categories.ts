export interface CategoryDefinition {
  id: string;
  label: string;
  libraryCategories: string[];
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'consoles',
    label: 'Consoles',
    libraryCategories: ['nintendo', 'sega', 'other'],
  },
  {
    id: 'computers',
    label: 'Home Computers',
    libraryCategories: ['computer'],
  },
  {
    id: 'ibm-pc',
    label: 'IBM PC',
    libraryCategories: ['ibm-pc'],
  },
  {
    id: 'arcade',
    label: 'Arcade',
    libraryCategories: ['arcade'],
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    libraryCategories: ['fantasy'],
  },
];
