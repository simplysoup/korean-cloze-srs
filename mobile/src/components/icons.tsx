/**
 * Header icons — one consistent set, so the search, bell, and help icons
 * share the same size, stroke, and visual weight. Feather-style stroke
 * icons (24×24 viewBox, strokeWidth 2, round caps/joins); pass `color`
 * to tint, `size` to scale. No emoji, no text glyphs.
 */
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
}

export function SearchIcon({ color = '#A9BEC6', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="7" />
      <Line x1="16.5" y1="16.5" x2="21" y2="21" />
    </Svg>
  );
}

export function BellIcon({ color = '#A9BEC6', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  );
}

export function HelpIcon({ color = '#A9BEC6', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Line x1="12" y1="17" x2="12.01" y2="17" />
    </Svg>
  );
}
