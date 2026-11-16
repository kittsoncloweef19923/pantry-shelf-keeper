import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { theme } from '../constants/theme';

type Props = {
  children: React.ReactNode;
  padding?: number;
  raised?: boolean;
  /** Draws the 3 dp wood lip along the bottom edge. */
  lip?: boolean;
  style?: ViewStyle;
};

/** Paper surface, wood lip, 1 dp wood-edge border, contact shadow. */
function MaterialCardBase({ children, padding = 16, raised = false, lip = true, style }: Props) {
  return (
    <View style={[styles.outer, raised ? theme.shadows.raised : theme.shadows.card, style]}>
      <LinearGradient
        colors={theme.gradients.paper}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.surface, { padding }]}>
        {children}
      </LinearGradient>
      {lip ? <View style={styles.lip} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
    overflow: 'hidden',
  },
  surface: {
    width: '100%',
  },
  lip: {
    height: 3,
    width: '100%',
    backgroundColor: theme.colors.woodEdge,
  },
});

export const MaterialCard = memo(MaterialCardBase);
