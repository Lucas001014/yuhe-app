import React, { useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
  FlatList,
  SectionList,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

/**
 * # Screen 组件使用指南
 *
 * 核心原则：统一使用手动安全区管理 (padding)，支持沉浸式布局，解决 iOS/Android 状态栏一致性问题。
 *
 * ## 1. 普通页面 (默认)
 * - 场景：标准的白底或纯色背景页面，Header 在安全区下方。
 * - 用法：`<Screen>{children}</Screen>`
 * - 行为：自动处理上下左右安全区，状态栏文字黑色。
 *
 * ## 2. 沉浸式 Header (推荐)
 * - 场景：Header 背景色/图片需要延伸到状态栏 (如首页、个人中心)。
 * - 用法：`<Screen safeAreaEdges={['left', 'right', 'bottom']}>` (❌ 去掉 'top')
 * - 配合：页面内部 Header 组件必须手动添加 paddingTop:
 *   ```tsx
 *   const insets = useSafeAreaInsets();
 *   <View style={{ paddingTop: insets.top + 12, backgroundColor: '...' }}>
 *   ```
 *
 * ## 3. 底部有 TabBar 或 悬浮按钮
 * - 场景：页面底部有固定导航栏，或者需要精细控制底部留白。
 * - 用法：`<Screen safeAreaEdges={['top', 'left', 'right']}>` (❌ 去掉 'bottom')
 * - 配合：
 *   - 若是滚动页：`<ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>`
 *   - 若是固定页：`<View style={{ paddingBottom: insets.bottom + 60 }}>`
 *
 * ## 4. 滚动列表/表单
 * - 场景：长内容，需要键盘避让。
 * - 用法：`<Screen>{children}</Screen>`
 * - 行为：若子树不包含 ScrollView/FlatList/SectionList，则外层自动使用 ScrollView，
 *        自动处理键盘遮挡，底部安全区会自动加在内容末尾。
 */
interface ScreenProps {
  children: React.ReactNode;
  /** 背景色，默认 #fff */
  backgroundColor?: string;
  /**
   * 状态栏样式
   * - 'dark': 黑色文字 (默认)
   * - 'light': 白色文字 (深色背景时用)
   */
  statusBarStyle?: 'auto' | 'inverted' | 'light' | 'dark';
  /**
   * 状态栏背景色
   * - 默认 'transparent' 以支持沉浸式
   * - Android 下如果需要不透明，可传入具体颜色
   */
  statusBarColor?: string;
  /**
   * 安全区控制 (关键属性)
   * - 默认: ['top', 'left', 'right', 'bottom'] (全避让)
   * - 沉浸式 Header: 去掉 'top'
   * - 自定义底部: 去掉 'bottom'
   */
  safeAreaEdges?: Edge[];
  /** 自定义容器样式 */
  style?: ViewStyle;
}

type KeyboardAwareProps = {
  element: React.ReactElement<any, any>;
  extraPadding: number;
  contentInsetBehaviorIOS: 'automatic' | 'never';
};

// 使用原生 ScrollView 替代 KeyboardAwareScrollView（兼容 React 19）
const KeyboardAwareScrollable = ({
  element,
  extraPadding,
  contentInsetBehaviorIOS,
}: KeyboardAwareProps) => {
  // 获取原始组件的 props
  const childAttrs: any = (element as any).props || {};
  const originStyle = childAttrs['contentContainerStyle'];
  const styleArray = Array.isArray(originStyle) ? originStyle : originStyle ? [originStyle] : [];
  const merged = Object.assign({}, ...styleArray);
  const currentPB = typeof merged.paddingBottom === 'number' ? merged.paddingBottom : 0;

  // 合并 paddingBottom (安全区 + 额外留白)
  const enhancedContentStyle = [{ ...merged, paddingBottom: currentPB + extraPadding }];

  // 基础配置 props
  const commonProps = {
    ...childAttrs,
    contentContainerStyle: enhancedContentStyle,
    keyboardShouldPersistTaps: childAttrs['keyboardShouldPersistTaps'] ?? 'handled',
    keyboardDismissMode: childAttrs['keyboardDismissMode'] ?? 'on-drag',
    ...(Platform.OS === 'ios'
      ? { contentInsetAdjustmentBehavior: childAttrs['contentInsetAdjustmentBehavior'] ?? contentInsetBehaviorIOS }
      : {}),
  };

  const t = (element as any).type;

  // 根据组件类型返回对应的增强版本
  if (t === ScrollView) {
    return <ScrollView {...commonProps} />;
  }

  if (t === FlatList) {
    return <FlatList {...commonProps} />;
  }

  if (t === SectionList) {
    return <SectionList {...commonProps} />;
  }

  // 理论上不应运行到这里，如果是非标准组件则原样返回，仅修改样式
  return React.cloneElement(element, {
    contentContainerStyle: enhancedContentStyle,
    keyboardShouldPersistTaps: childAttrs['keyboardShouldPersistTaps'] ?? 'handled',
    keyboardDismissMode: childAttrs['keyboardDismissMode'] ?? 'on-drag',
  });
};

export const Screen = ({
  children,
  backgroundColor = '#fff',
  statusBarStyle = 'dark',
  statusBarColor = 'transparent',
  safeAreaEdges = ['top', 'left', 'right', 'bottom'],
  style,
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const [keyboardShown, setKeyboardShown] = React.useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s1 = Keyboard.addListener(showEvent, () => setKeyboardShown(true));
    const s2 = Keyboard.addListener(hideEvent, () => setKeyboardShown(false));
    return () => { s1.remove(); s2.remove(); };
  }, []);

  // 自动检测：若子树中包含 ScrollView/FlatList/SectionList，则认为页面自身处理滚动
  const isNodeScrollable = (node: React.ReactNode): boolean => {
    const isScrollableElement = (el: unknown): boolean => {
      if (!React.isValidElement(el)) return false;
      const element = el as React.ReactElement<any, any>;
      const t = element.type;
      // 不递归检查 Modal 内容，避免将弹窗内的 ScrollView 误判为页面已具备垂直滚动
      if (t === Modal) return false;
      const props = element.props as Record<string, unknown> | undefined;
      // 仅识别"垂直"滚动容器；横向滚动不视为页面已处理垂直滚动
      // eslint-disable-next-line react/prop-types
      const isHorizontal = !!(props && (props as any).horizontal === true);
      if ((t === ScrollView || t === FlatList || t === SectionList) && !isHorizontal) return true;
      const c: React.ReactNode | undefined = props && 'children' in props
        ? (props.children as React.ReactNode)
        : undefined;
      if (Array.isArray(c)) return c.some(isScrollableElement);
      return c ? isScrollableElement(c) : false;
    };
    if (Array.isArray(node)) return node.some(isScrollableElement);
    return isScrollableElement(node);
  };

  const childIsNativeScrollable = isNodeScrollable(children);

  // 解析安全区设置
  const hasTop = safeAreaEdges.includes('top');
  const hasBottom = safeAreaEdges.includes('bottom');
  const hasLeft = safeAreaEdges.includes('left');
  const hasRight = safeAreaEdges.includes('right');

  // 强制禁用 iOS 自动调整内容区域，完全由手动 padding 控制
  const contentInsetBehaviorIOS = 'never';

  const wrapperStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: hasTop ? insets.top : 0,
    paddingLeft: hasLeft ? insets.left : 0,
    paddingRight: hasRight ? insets.right : 0,
    // 当页面不使用外层 ScrollView 时（子树本身可滚动），由外层 View 负责底部安全区
    paddingBottom: (childIsNativeScrollable && hasBottom)
      ? (keyboardShown ? 0 : insets.bottom)
      : 0,
  };

  // 若子树不可滚动，则外层使用 ScrollView 提供"全局页面滑动"能力
  const useScrollContainer = !childIsNativeScrollable;

  const Container = useScrollContainer ? ScrollView : View;

  const containerProps = useScrollContainer ? {
    contentContainerStyle: {
      flexGrow: 1,
      paddingBottom: hasBottom ? (keyboardShown ? 0 : insets.bottom) : 0,
    },
    keyboardShouldPersistTaps: 'handled' as const,
    showsVerticalScrollIndicator: false,
    keyboardDismissMode: 'on-drag' as const,
    ...(Platform.OS === 'ios'
      ? { contentInsetAdjustmentBehavior: contentInsetBehaviorIOS }
      : {}),
  } : {};

  // 若子元素自身包含滚动容器，给该滚动容器单独添加键盘避让
  const wrapScrollableWithKeyboardAvoid = (nodes: React.ReactNode): React.ReactNode => {
    const isVerticalScrollable = (el: React.ReactElement<any, any>): boolean => {
      const t = el.type;
      const elementProps = (el as any).props || {};
      const isHorizontal = !!(elementProps as any).horizontal;
      return (t === ScrollView || t === FlatList || t === SectionList) && !isHorizontal;
    };

    const wrapIfNeeded = (el: React.ReactElement<any, any>, idx?: number): React.ReactElement => {
      if (isVerticalScrollable(el)) {
        return (
          <KeyboardAwareScrollable
            key={el.key ?? idx}
            element={el}
            extraPadding={keyboardShown ? 0 : (hasBottom ? insets.bottom : 0)}
            contentInsetBehaviorIOS={contentInsetBehaviorIOS}
          />
        );
      }
      return el;
    };

    if (Array.isArray(nodes)) {
      return nodes.map((n, idx) => {
        if (React.isValidElement(n)) {
          return wrapIfNeeded(n as React.ReactElement<any, any>, idx);
        }
        return n;
      });
    }
    if (React.isValidElement(nodes)) {
      return wrapIfNeeded(nodes as React.ReactElement<any, any>, 0);
    }
    return nodes;
  };

  return (
    <View style={wrapperStyle}>
      <StatusBar
        style={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent
      />

      {useScrollContainer ? (
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Container style={[styles.innerContainer, style]} {...containerProps}>
            {children}
          </Container>
        </KeyboardAvoidingView>
      ) : (
        childIsNativeScrollable ? (
          <View style={[styles.innerContainer, style]}>
            {wrapScrollableWithKeyboardAvoid(children)}
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={Platform.OS === 'web'}>
            <View style={[styles.innerContainer, style]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
