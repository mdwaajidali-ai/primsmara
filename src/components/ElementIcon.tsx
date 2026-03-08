import { Flame, Droplets, Mountain, Wind, Sun, Moon } from 'lucide-react';
import { Element } from '@/data/cards';

export const ElementIcon = ({ element, size = 24, className = '' }: { element: Element; size?: number; className?: string }) => {
  const props = { size, className };
  switch (element) {
    case 'fire': return <Flame {...props} />;
    case 'water': return <Droplets {...props} />;
    case 'earth': return <Mountain {...props} />;
    case 'air': return <Wind {...props} />;
    case 'light': return <Sun {...props} />;
    case 'dark': return <Moon {...props} />;
  }
};
