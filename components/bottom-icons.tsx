import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { theme } from '@/theme';

type Props = {
  size?: number;
  color?: string;
};

export function ReelIcon({ size = 22, color = theme.colors.iconDefault }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path d="M6 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM1 3a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
      <Path d="M9 6h.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 7.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 16H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h7zm6 8.73V7.27l-3.5 1.555v4.35l3.5 1.556zM1 8v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1z" />
      <Path d="M9 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 3a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
    </Svg>
  );
}

export function CommentIcon({ size = 22, color = theme.colors.iconDefault }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 5.5C2 4.12 3.12 3 4.5 3h15A1.5 1.5 0 0 1 21 4.5v9A1.5 1.5 0 0 1 19.5 15H8l-4 4v-4.5H4.5A2.5 2.5 0 0 1 2 12.5v-7Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProfileIcon({ size = 22, color = theme.colors.iconDefault }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.5 19.5h-4m2 2v-4m-4.34-6.63c-.1-.01-.22-.01-.33 0C9.45 10.79 7.56 8.84 7.56 6.44 7.55 3.99 9.54 2 12 2c2.45 0 4.44 1.99 4.44 4.44 0 2.4-1.9 4.35-4.27 4.43ZM12 21.81c-1.83 0-3.64-.46-5.02-1.38-2.42-1.62-2.42-4.26 0-5.88 2.75-1.84 7.26-1.84 10.01 0"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

