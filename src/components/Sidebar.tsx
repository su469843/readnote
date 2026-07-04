import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '../store/useStore';
import {Colors, Spacing, FontSize, BorderRadius, Shadow} from '../theme';

const SIDEBAR_WIDTH = 280;
const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({visible, onClose}: SidebarProps) {
  const navigation = useNavigation<any>();
  const {terminalMode} = useStore();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: visible ? 0 : -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: visible ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, translateX, overlayOpacity]);

  const navigateTo = (screen: string) => {
    onClose();
    setTimeout(() => navigation.navigate(screen), 300);
  };

  const menuItems = [
    {icon: '📝', label: '笔记', screen: 'Home'},
    ...(terminalMode
      ? [{icon: '🖥', label: '终端', screen: 'SSHList'}]
      : []),
    {icon: '⚙️', label: '设置', screen: 'Settings'},
  ];

  return (
    <>
      {/* 遮罩层 */}
      {visible && (
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[styles.overlay, {opacity: overlayOpacity}]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* 侧边栏 */}
      <Animated.View
        style={[
          styles.sidebar,
          {transform: [{translateX}]},
        ]}>
        <View style={styles.header}>
          <Text style={styles.appName}>ReadNote</Text>
          <Text style={styles.appVersion}>v1.3.1</Text>
        </View>

        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuItem}
              onPress={() => navigateTo(item.screen)}
              activeOpacity={0.7}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 99,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: Colors.bgCard,
    zIndex: 100,
    paddingTop: 48,
    ...Shadow.lg,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  appVersion: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  menuList: {
    paddingTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg - 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});
