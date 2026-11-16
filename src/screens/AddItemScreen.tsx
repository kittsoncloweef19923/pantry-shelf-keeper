import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, Check, Save } from 'lucide-react-native';

import { AppFrame } from '../components/AppFrame';
import { Chip } from '../components/Chip';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { QuantityStepper } from '../components/QuantityStepper';
import {
  DATE_PRESETS,
  FRAME_MAX_W,
  GUTTER,
  MAX_QUANTITY,
  NAME_MAX,
  TAP_MIN,
  UNITS,
} from '../constants/config';
import { theme } from '../constants/theme';
import { addDays, formatFull } from '../game/dateMath';
import type { Draft } from '../game/pantryActions';
import type { PantrySnapshot, Unit } from '../game/types';

type Props = {
  snapshot: PantrySnapshot;
  today: string;
  shelfId: string;
  editingItemId: string | null;
  onBack: () => void;
  onSave: (draft: Draft) => void;
};

export function AddItemScreen({
  snapshot,
  today,
  shelfId,
  editingItemId,
  onBack,
  onSave,
}: Props) {
  const existing = useMemo(
    () => (editingItemId ? snapshot.items.find(it => it.id === editingItemId) || null : null),
    [editingItemId, snapshot.items],
  );

  const [name, setName] = useState(existing ? existing.name : '');
  const [shelf, setShelf] = useState(existing ? existing.shelfId : shelfId);
  const [quantity, setQuantity] = useState(existing ? existing.quantity : 1);
  const [unit, setUnit] = useState<Unit>(existing ? existing.unit : 'pieces');
  const [bestBefore, setBestBefore] = useState<string | null>(existing ? existing.bestBefore : null);
  const [undated, setUndated] = useState(existing ? existing.bestBefore === null : false);
  const [showErrors, setShowErrors] = useState(false);

  const trimmed = name.trim();
  const nameError = trimmed.length === 0 ? 'Give this item a name.' : null;
  const dateError =
    !undated && bestBefore === null ? 'Choose a date or mark it as undated.' : null;
  const canSave = !nameError && !dateError;

  const toggleUndated = useCallback(() => {
    setUndated(prev => {
      const next = !prev;
      if (next) {
        setBestBefore(null);
      }
      return next;
    });
  }, []);

  const pickDate = useCallback(
    (days: number) => {
      setBestBefore(addDays(today, days));
      setUndated(false);
    },
    [today],
  );

  const handleSave = useCallback(() => {
    if (!canSave) {
      setShowErrors(true);
      return;
    }
    onSave({ name: trimmed, shelfId: shelf, quantity, unit, bestBefore: undated ? null : bestBefore });
  }, [canSave, onSave, trimmed, shelf, quantity, unit, undated, bestBefore]);

  const pastDate = bestBefore !== null && bestBefore < today;

  return (
    <AppFrame variant="additem">
      <ScreenHeader
        title={existing ? 'Edit item' : 'Add item'}
        subtitle={snapshot.shelves.find(s => s.id === shelf)?.name || 'Pantry'}
        leftSlot={<IconButton Icon={ArrowLeft} label="Back" onPress={onBack} />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.panel}>
              <Text style={styles.label}>ITEM NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Chickpeas"
                placeholderTextColor={theme.colors.inkMuted}
                maxLength={NAME_MAX}
                autoCapitalize="sentences"
                style={styles.input}
                accessibilityLabel="Item name"
              />
              {showErrors && nameError ? <Text style={styles.error}>{nameError}</Text> : null}

              <Text style={styles.label}>SHELF</Text>
              <View style={styles.chipRow}>
                {snapshot.shelves.map(entry => (
                  <Chip
                    key={entry.id}
                    label={entry.name}
                    compact
                    selected={shelf === entry.id}
                    onPress={() => setShelf(entry.id)}
                  />
                ))}
              </View>

              <Text style={styles.label}>QUANTITY</Text>
              <QuantityStepper
                value={quantity}
                minimum={existing ? 0 : 1}
                maximum={MAX_QUANTITY}
                unitLabel={unit}
                onChange={setQuantity}
              />

              <Text style={styles.label}>UNIT</Text>
              <View style={styles.chipWrap}>
                {UNITS.map(entry => (
                  <Chip
                    key={entry}
                    label={entry}
                    width={104}
                    selected={unit === entry}
                    onPress={() => setUnit(entry)}
                  />
                ))}
              </View>

              <Text style={styles.label}>BEST BEFORE</Text>
              <View style={styles.chipWrap}>
                {DATE_PRESETS.map(preset => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    width={104}
                    selected={!undated && bestBefore === addDays(today, preset.days)}
                    onPress={() => pickDate(preset.days)}
                  />
                ))}
              </View>

              <Pressable
                onPress={toggleUndated}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: undated }}
                accessibilityLabel="No best-before date"
                style={styles.checkRow}>
                <View style={[styles.checkBox, undated ? styles.checkBoxOn : null]}>
                  {undated ? <Check size={18} color={theme.colors.cream} strokeWidth={3} /> : null}
                </View>
                <Text style={styles.checkLabel}>No best-before date</Text>
              </Pressable>

              <Text style={styles.helper}>
                {bestBefore
                  ? `Chosen date: ${formatFull(bestBefore)}`
                  : 'Use the date printed on the package.'}
              </Text>
              {pastDate ? (
                <Text style={styles.notice}>This date has already passed.</Text>
              ) : null}
              {showErrors && dateError ? <Text style={styles.error}>{dateError}</Text> : null}
            </View>
          </ScrollView>
        </View>

        <LinearGradient
          colors={theme.gradients.wood}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.actionSurface}>
          <Text style={styles.actionHint}>
            {canSave ? 'READY TO SAVE' : 'NAME AND DATE ARE REQUIRED'}
          </Text>
          <PrimaryButton
            label={existing ? 'SAVE CHANGES' : 'SAVE ITEM'}
            Icon={Save}
            onPress={handleSave}
            disabled={!canSave}
          />
        </LinearGradient>
      </KeyboardAvoidingView>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    width: FRAME_MAX_W,
    alignSelf: 'center',
    paddingTop: GUTTER,
  },
  form: {
    paddingBottom: 16,
  },
  panel: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
    padding: 16,
    ...theme.shadows.card,
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.walnut,
  },
  input: {
    height: 56,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.woodLight,
    paddingHorizontal: 14,
    fontSize: 16,
    color: theme.colors.ink,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkRow: {
    marginTop: 12,
    minHeight: TAP_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.borderBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {
    backgroundColor: theme.colors.blue,
    borderColor: theme.colors.blue,
  },
  checkLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: theme.colors.ink,
  },
  helper: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.inkSoft,
  },
  notice: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: theme.colors.terracotta,
  },
  error: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: theme.colors.terracotta,
  },
  actionSurface: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionHint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: theme.colors.walnut,
    marginBottom: 10,
  },
});
