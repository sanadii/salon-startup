import type { LucideIcon } from 'lucide-react';
import { Layout, Megaphone, Palette, Rocket, Scissors } from 'lucide-react';

export const MODULE_ICONS = {
  Palette,
  Layout,
  Scissors,
  Megaphone,
  Rocket,
} as const satisfies Record<string, LucideIcon>;

export type ModuleIconName = keyof typeof MODULE_ICONS;

export function ModuleIcon({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = (MODULE_ICONS as Record<string, LucideIcon>)[name] ?? Palette;
  return <Icon size={size} className={className} />;
}
