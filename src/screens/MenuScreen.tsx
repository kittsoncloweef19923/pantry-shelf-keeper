import React, { useCallback, useMemo } from 'react';
import {
  Animated,
  FlatList,
  Image,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CalendarClock, PackagePlus, Settings as SettingsIcon, ShoppingBasket } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { assets } from '../assets';
import { AppFrame } from '../components/AppFrame';
import { BottomNavigation, Destination } from '../components/BottomNavigation';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { ShelfCard } from '../components/ShelfCard';
import { FRAME_MAX_W, GUTTER, HUB_GAP } from '../constants/config';
import { theme } from '../constants/theme';
import { attentionCount, nearestDate, positiveBatchCount } from '../game/inventorySelectors';
import type { PantrySnapshot, Shelf } from '../game/types';
import { useEnterAnimation, usePressFeedback } from '../hooks/usePressFeedback';

type Props = {
  snapshot: PantrySnapshot;
  today: string;
  onOpenShelf: (shelfId: string) => void;
  onStart: () => void;
  onNavigate: (destination: Destination) => void;
};

const TILE_W = Math.floor((FRAME_MAX_W - HUB_GAP) / 2);

function NavTile({
  Icon,
  title,
  caption,
  badge,
  onPress,
}: {
  Icon: LucideIcon;
  title: string;
  caption: string;
  badge: number;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressFeedback(0.97);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${caption}`}
      style={styles.tilePress}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.tile, { transform: [{ scale }] }, theme.shadows.card]}>
        <View style={styles.tileTop}>
          <View style={styles.tileIcon}>
            <Icon size={22} color={theme.colors.blue} strokeWidth={2.2} />
          </View>
          {badge > 0 ? (
            <View style={styles.tileBadge}>
              <Text style={styles.tileBadgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.tileTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.tileCaption}>
          {caption}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function MenuScreen({ snapshot, today, onOpenShelf, onStart, onNavigate }: Props) {
  const { opacity, translateY } = useEnterAnimation(0, 8);
  const items = snapshot.items;

  const dueCount = useMemo(() => attentionCount(items, today), [items, today]);
  const shoppingCount = useMemo(
    () => snapshot.shopping.filter(e => !e.checked).length,
    [snapshot.shopping],
  );
  const stockCount = useMemo(() => items.filter(it => it.quantity > 0).length, [items]);

  const handleExpiring = useCallback(() => onNavigate('expiring'), [onNavigate]);
  const handleShopping = useCallback(() => onNavigate('shopping'), [onNavigate]);
  const handleSettings = useCallback(() => onNavigate('settings'), [onNavigate]);

  const renderShelf = useCallback(
    ({ item }: ListRenderItemInfo<Shelf>) => (
      <ShelfCard
        id={item.id}
        name={item.name}
        batchCount={positiveBatchCount(items, item.id)}
        nearestDate={nearestDate(items, item.id)}
        attentionCount={attentionCount(items, today, item.id)}
        onOpen={onOpenShelf}
      />
    ),
    [items, today, onOpenShelf],
  );

  const keyExtractor = useCallback((shelf: Shelf) => shelf.id, []);

  return (
    <AppFrame variant="menu">
      <ScreenHeader
        title="Shelves"
        subtitle="Everything in its place"
        rightSlot={<IconButton Icon={SettingsIcon} label="Settings" onPress={handleSettings} />}
      />

      <View style={styles.body}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.hubWrap, { opacity, transform: [{ translateY }] }]}>
          <LinearGradient
            colors={theme.gradients.hub}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hub}>
            <Image source={assets.jar} style={styles.hubArt} resizeMode="contain" />
            <Text style={styles.hubKicker}>YOUR PANTRY</Text>
            <Text style={styles.hubHeadline}>
              {stockCount > 0
                ? `${stockCount} batches on ${snapshot.shelves.length} shelves`
                : 'Add what is already at home'}
            </Text>
            <Text style={styles.hubHint}>
              {dueCount > 0 ? `${dueCount} need a look soon` : 'No dates due right now'}
            </Text>
            <View style={styles.hubAction}>
              <PrimaryButton
                label="START PANTRY CHECK"
                Icon={PackagePlus}
                onPress={onStart}
                accessibilityHint="Opens the shelf you visited last"
              />
            </View>
          </LinearGradient>

          <View style={styles.tiles}>
            <NavTile
              Icon={CalendarClock}
              title="Expiring Soon"
              caption={dueCount > 0 ? `${dueCount} to check` : 'All clear'}
              badge={dueCount}
              onPress={handleExpiring}
            />
            <NavTile
              Icon={ShoppingBasket}
              title="Shopping List"
              caption={shoppingCount > 0 ? `${shoppingCount} to buy` : 'Nothing to buy'}
              badge={shoppingCount}
              onPress={handleShopping}
            />
          </View>
        </Animated.View>

        <View style={styles.sectionRow}>
          <Image source={assets.shelf} style={styles.sectionArt} resizeMode="contain" />
          <Text style={styles.sectionTitle}>Your shelves</Text>
          <View style={styles.sectionSpacer} />
          <Image source={assets.herb} style={styles.sectionLeaf} resizeMode="contain" />
          <Text style={styles.sectionMeta}>{`${snapshot.shelves.length} total`}</Text>
        </View>

        <FlatList
          data={snapshot.shelves}
          renderItem={renderShelf}
          keyExtractor={keyExtractor}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          windowSize={5}
          initialNumToRender={4}
        />
      </View>

      <BottomNavigation
        selected="menu"
        onSelect={onNavigate}
        dueCount={dueCount}
        shoppingCount={shoppingCount}
      />
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: FRAME_MAX_W,
    alignSelf: 'center',
    paddingTop: GUTTER,
  },
  hubWrap: {
    width: '100%',
  },
  hub: {
    width: '100%',
    borderRadius: theme.radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(250,245,236,0.18)',
    ...theme.shadows.raised,
  },
  hubArt: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 64,
    height: 64,
    opacity: 0.95,
  },
  hubKicker: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: 'rgba(250,245,236,0.72)',
  },
  hubHeadline: {
    marginTop: 4,
    paddingRight: 72,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: theme.colors.cream,
    fontFamily: 'serif',
  },
  hubHint: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(250,245,236,0.82)',
  },
  hubAction: {
    marginTop: 14,
  },
  tiles: {
    flexDirection: 'row',
    gap: HUB_GAP,
    marginTop: HUB_GAP,
  },
  tilePress: {
    width: TILE_W,
    height: 92,
  },
  tile: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(42,76,171,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBadge: {
    minWidth: 24,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  tileTitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  tileCaption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: theme.colors.inkMuted,
  },
  sectionRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  sectionArt: {
    width: 28,
    height: 28,
    opacity: 0.9,
  },
  sectionSpacer: {
    flex: 1,
  },
  sectionLeaf: {
    width: 20,
    height: 20,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: theme.colors.ink,
    fontFamily: 'serif',
  },
  sectionMeta: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.inkMuted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
  },
});
