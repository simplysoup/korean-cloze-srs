import { useEffect, useState } from 'react';
import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  getDashboardStats,
  getUserSettings,
} from '../db';
import { useAuth, type AuthUser } from '../lib/auth-context';
import BrandMark from './BrandMark';
import { BellIcon, HelpIcon, SearchIcon } from './icons';
import { colors } from './theme';

/** Desktop nav appears at this width and up; below it, the hamburger. */
const DESKTOP_BREAKPOINT = 768;

type MenuId = 'content' | 'practice' | 'alerts' | 'help' | 'user' | null;

type PracticeHref = '/cram' | '/practice-tests' | '/reading' | '/stories' | '/hangul';

const PRACTICE_ITEMS: { label: string; href: PracticeHref }[] = [
  { label: 'Cram', href: '/cram' },
  { label: 'TOPIK Practice Tests', href: '/practice-tests' },
  { label: 'Reading Passages', href: '/reading' },
  { label: 'Stories', href: '/stories' },
  { label: 'Hangul Practice', href: '/hangul' },
];

/** Small count pill for the Learn / Review nav items. */
function CountPill({ count }: { count: number }) {
  return (
    <View style={[styles.pill, { backgroundColor: count > 0 ? colors.primary : '#5A6B70' }]}>
      <Text style={styles.pillText}>{count}</Text>
    </View>
  );
}

export default function AppHeader({ user }: { user: AuthUser }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState<{
    dueCount: number;
    learnedToday: number;
    dailyLearnLimit: number;
    libraryCount: number;
    level: number;
  } | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  // Refresh the nav counts whenever the route changes (e.g. back to the
  // dashboard after a Learn session) and on mount. The load runs in a
  // microtask: the lint rule forbids synchronous setState in the effect
  // body (same pattern as _layout.tsx's init .then). The menu resets ride
  // along — they only need to happen on navigation, not synchronously.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        const s = getDashboardStats();
        return {
          stats: {
            dueCount: s.dueCount,
            learnedToday: s.learnedToday,
            dailyLearnLimit: s.dailyLearnLimit,
            libraryCount: s.libraryCount,
            level: s.level,
          },
          focusMode: getUserSettings().focusMode,
        };
      })
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setFocusMode(data.focusMode);
        setOpenMenu(null);
        setMobileOpen(false);
      })
      .catch(() => {
        // DB not ready yet; the next navigation refreshes it.
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // No decks in the library yet: nothing to learn today.
  const remainingToday =
    stats && stats.libraryCount > 0
      ? Math.max(0, stats.dailyLearnLimit - stats.learnedToday)
      : 0;
  const dueCount = stats?.dueCount ?? 0;
  // Notifications: the app has no notification source yet, so the count
  // is 0 and the bell renders greyed out. When a source lands, this is
  // the number that colours the bell and its badge.
  const notificationCount = 0;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function toggleMenu(id: Exclude<MenuId, null>) {
    setOpenMenu((cur) => (cur === id ? null : id));
  }

  function closeMenus() {
    setOpenMenu(null);
    setMobileOpen(false);
  }

  const navTextStyle = (active: boolean) => ({
    color: active ? '#FFFFFF' : '#A9BEC6',
    fontWeight: active ? ('700' as const) : ('600' as const),
  });

  // Focus mode hides the navigation bar during reviews.
  if (focusMode && pathname.startsWith('/review')) return null;

  return (
    <View style={styles.headerWrap}>
      <View style={styles.bar}>
        <Link href="/" asChild>
          <Pressable style={styles.brand} accessibilityRole="button">
            <BrandMark size={28} dark />
          </Pressable>
        </Link>

        {isDesktop ? (
          <View style={styles.rightGroup}>
            <View style={styles.nav}>
              <Link href="/learn" asChild>
                <Pressable style={styles.navItem} accessibilityRole="button">
                  <Text style={[styles.navText, navTextStyle(isActive('/learn'))]}>Learn</Text>
                  <CountPill count={remainingToday} />
                </Pressable>
              </Link>
              <Link href="/review" asChild>
                <Pressable style={styles.navItem} accessibilityRole="button">
                  <Text style={[styles.navText, navTextStyle(isActive('/review'))]}>Review</Text>
                  <CountPill count={dueCount} />
                </Pressable>
              </Link>

              {/* Content: the decks catalogue + the grammar library.
                  The dropdown never lists individual decks — there is no
                  "current" deck; Learn and Review pull from every deck
                  in the user's library. */}
              <View style={styles.menuAnchor}>
                <Pressable
                  style={styles.navItem}
                  onPress={() => toggleMenu('content')}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.navText,
                      navTextStyle(isActive('/decks') || isActive('/grammar')),
                    ]}
                  >
                    Content {openMenu === 'content' ? '⌃' : '⌄'}
                  </Text>
                </Pressable>
                {openMenu === 'content' ? (
                  <View style={styles.menu}>
                    <Link href="/decks" asChild>
                      <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                        <Text style={styles.menuRowText}>Decks</Text>
                      </Pressable>
                    </Link>
                    <View style={styles.menuDivider} />
                    <Link href="/grammar" asChild>
                      <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                        <Text style={styles.menuRowText}>Grammar Library</Text>
                      </Pressable>
                    </Link>
                    <View style={styles.menuDivider} />
                    <Link href="/not-yet-implemented?feature=Topics" asChild>
                      <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                        <Text style={styles.menuRowText}>Topics</Text>
                      </Pressable>
                    </Link>
                    <Link href="/not-yet-implemented?feature=Content%20Search" asChild>
                      <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                        <Text style={styles.menuRowText}>Content Search</Text>
                      </Pressable>
                    </Link>
                    <Link href="/not-yet-implemented?feature=Bookmarks" asChild>
                      <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                        <Text style={styles.menuRowText}>Bookmarks</Text>
                      </Pressable>
                    </Link>
                  </View>
                ) : null}
              </View>

              {/* Practice: Cram, TOPIK tests, Reading, Stories, Hangul. */}
              <View style={styles.menuAnchor}>
                <Pressable
                  style={styles.navItem}
                  onPress={() => toggleMenu('practice')}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.navText,
                      navTextStyle(PRACTICE_ITEMS.some((i) => isActive(i.href))),
                    ]}
                  >
                    Practice {openMenu === 'practice' ? '⌃' : '⌄'}
                  </Text>
                </Pressable>
                {openMenu === 'practice' ? (
                  <View style={styles.menu}>
                    {PRACTICE_ITEMS.map((item) => (
                      <Link key={item.href} href={item.href} asChild>
                        <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                          <Text style={styles.menuRowText}>{item.label}</Text>
                        </Pressable>
                      </Link>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.right}>
              <Link href="/grammar" asChild>
                <Pressable
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="Search"
                >
                  <SearchIcon />
                </Pressable>
              </Link>
              <View style={styles.menuAnchor}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => toggleMenu('alerts')}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                >
                  <View style={styles.bellWrap}>
                    <BellIcon color={notificationCount > 0 ? colors.primary : '#A9BEC6'} />
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            notificationCount > 0 ? colors.primary : '#5A6B70',
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>{notificationCount}</Text>
                    </View>
                  </View>
                </Pressable>
                {openMenu === 'alerts' ? (
                  <View style={[styles.menu, styles.menuRight]}>
                    <Text style={styles.menuMuted}>No new notifications.</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.menuAnchor}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => toggleMenu('help')}
                  accessibilityRole="button"
                  accessibilityLabel="Help"
                >
                  <HelpIcon />
                </Pressable>
                {openMenu === 'help' ? (
                  <View style={[styles.menu, styles.menuRight]}>
                    <Text style={styles.menuMuted}>
                      Munpro is a free Korean grammar trainer — a Bunpro-style SRS for TOPIK
                      grammar.
                    </Text>
                    <Link href="/account" asChild>
                      <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                        <Text style={styles.menuRowText}>Account & password</Text>
                      </Pressable>
                    </Link>
                  </View>
                ) : null}
              </View>
              <View style={styles.menuAnchor}>
                <Pressable style={styles.userChip} onPress={() => toggleMenu('user')}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarGlyph}>문</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{user.username}</Text>
                    <Text style={styles.userLevel}>Lv. {stats?.level ?? '–'}</Text>
                  </View>
                </Pressable>
                {openMenu === 'user' ? (
                  <View style={[styles.menu, styles.menuRight]}>
                    <Link href="/account" asChild>
                      <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                        <Text style={styles.menuRowText}>Account & password</Text>
                      </Pressable>
                    </Link>
                    <Link href="/settings" asChild>
                      <Pressable style={styles.menuRow} onPress={() => setOpenMenu(null)}>
                        <Text style={styles.menuRowText}>Settings</Text>
                      </Pressable>
                    </Link>
                    <Pressable
                      style={styles.menuRow}
                      onPress={() => {
                        setOpenMenu(null);
                        logout();
                      }}
                    >
                      <Text style={[styles.menuRowText, { color: colors.primary }]}>Log out</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setMobileOpen((o) => !o)}
            style={styles.hamburger}
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <Text style={styles.hamburgerGlyph}>{mobileOpen ? '✕' : '☰'}</Text>
          </Pressable>
        )}
      </View>

      {!isDesktop && mobileOpen ? (
        <ScrollView style={styles.mobileMenu} contentContainerStyle={styles.mobileMenuContent}>
          <Link href="/learn" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>Learn</Text>
              <CountPill count={remainingToday} />
            </Pressable>
          </Link>
          <Link href="/review" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>Review</Text>
              <CountPill count={dueCount} />
            </Pressable>
          </Link>
          <Text style={styles.mobileHeading}>Content</Text>
          <Link href="/decks" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>Decks</Text>
            </Pressable>
          </Link>
          <Link href="/grammar" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>Grammar Library</Text>
            </Pressable>
          </Link>
          <Link href="/not-yet-implemented?feature=Topics" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>Topics</Text>
            </Pressable>
          </Link>
          <Link href="/not-yet-implemented?feature=Content%20Search" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>Content Search</Text>
            </Pressable>
          </Link>
          <Link href="/not-yet-implemented?feature=Bookmarks" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>Bookmarks</Text>
            </Pressable>
          </Link>
          <Text style={styles.mobileHeading}>Practice</Text>
          {PRACTICE_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <Pressable style={styles.mobileRow} onPress={closeMenus}>
                <Text style={styles.mobileRowText}>{item.label}</Text>
              </Pressable>
            </Link>
          ))}
          <Text style={styles.mobileHeading}>Account</Text>
          <Link href="/account" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>{user.username}</Text>
              <Text style={styles.mobileRowMeta}>Lv. {stats?.level ?? '–'}</Text>
            </Pressable>
          </Link>
          <Link href="/settings" asChild>
            <Pressable style={styles.mobileRow} onPress={closeMenus}>
              <Text style={styles.mobileRowText}>Settings</Text>
            </Pressable>
          </Link>
          <Pressable
            style={styles.mobileRow}
            onPress={() => {
              closeMenus();
              logout();
            }}
          >
            <Text style={[styles.mobileRowText, { color: colors.primary }]}>Log out</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: colors.navy,
    zIndex: 10,
  },
  bar: {
    backgroundColor: colors.navy,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // The whole right side — nav links + icons + user chip — sits at the
  // right edge, pushed there by marginLeft: 'auto'.
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 15,
    color: '#A9BEC6',
  },
  pill: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  menuAnchor: {
    position: 'relative',
  },
  menu: {
    position: 'absolute',
    top: 44,
    left: 0,
    minWidth: 260,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 20,
  },
  menuRight: {
    left: undefined,
    right: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  menuRowText: {
    fontSize: 15,
    color: colors.text,
  },
  menuRowMuted: {
    color: colors.faint,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E4E4E4',
    marginVertical: 6,
  },
  menuMuted: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Bell + count badge. The badge is coral-red when there are
  // notifications, grey when the count is 0 (same rule as the bell).
  bellWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.navy,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarGlyph: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 17,
  },
  userLevel: {
    color: '#A9BEC6',
    fontSize: 12,
    lineHeight: 15,
  },
  hamburger: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  hamburgerGlyph: {
    color: '#fff',
    fontSize: 22,
  },
  mobileMenu: {
    backgroundColor: colors.white,
    maxHeight: 480,
  },
  mobileMenuContent: {
    paddingVertical: 8,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mobileRowText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  mobileRowMeta: {
    fontSize: 14,
    color: colors.muted,
  },
  mobileHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
});
