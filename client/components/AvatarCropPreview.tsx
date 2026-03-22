import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH * 0.7;

interface AvatarCropPreviewProps {
  visible: boolean;
  imageUri: string;
  onCancel: () => void;
  onConfirm: (croppedUri: string) => void;
}

export default function AvatarCropPreview({ visible, imageUri, onCancel, onConfirm }: AvatarCropPreviewProps) {
  const { theme } = useTheme();
  
  // 使用 useMemo 创建 Animated.Value（避免 ESLint 警告）
  const scale = useMemo(() => new Animated.Value(1), []);
  const translateX = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(0), []);
  
  // 当前值（用于手势处理）
  const currentScale = useRef(1);
  const currentTranslateX = useRef(0);
  const currentTranslateY = useRef(0);

  // 在 useEffect 中设置监听器
  useEffect(() => {
    const scaleListener = scale.addListener(({ value }) => {
      currentScale.current = value;
    });
    const translateXListener = translateX.addListener(({ value }) => {
      currentTranslateX.current = value;
    });
    const translateYListener = translateY.addListener(({ value }) => {
      currentTranslateY.current = value;
    });

    return () => {
      scale.removeListener(scaleListener);
      translateX.removeListener(translateXListener);
      translateY.removeListener(translateYListener);
    };
  }, [scale, translateX, translateY]);

  // 缩放手势处理
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // 限制缩放范围 1-3
      const newScale = Math.max(1, Math.min(3, currentScale.current));
      Animated.spring(scale, {
        toValue: newScale,
        useNativeDriver: true,
      }).start();
    }
  };

  // 拖拽手势处理
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // 限制拖拽范围
      const maxTranslate = (CROP_SIZE * (currentScale.current - 1)) / 2;
      const newTranslateX = Math.max(-maxTranslate, Math.min(maxTranslate, currentTranslateX.current));
      const newTranslateY = Math.max(-maxTranslate, Math.min(maxTranslate, currentTranslateY.current));
      
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: newTranslateX,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: newTranslateY,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // 重置手势
  const resetGestures = useCallback(() => {
    currentScale.current = 1;
    currentTranslateX.current = 0;
    currentTranslateY.current = 0;
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  }, [scale, translateX, translateY]);

  // 确认裁剪
  const handleConfirm = useCallback(() => {
    onConfirm(imageUri);
    resetGestures();
  }, [imageUri, onConfirm, resetGestures]);

  // 取消
  const handleCancel = useCallback(() => {
    resetGestures();
    onCancel();
  }, [onCancel, resetGestures]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* 顶部提示 */}
        <View style={styles.header}>
          <ThemedText variant="h4" color="#FFFFFF">调整头像</ThemedText>
          <ThemedText variant="body" color="#FFFFFF80">拖拽和缩放调整头像位置</ThemedText>
        </View>

        {/* 裁剪区域 */}
        <View style={styles.cropArea}>
          <GestureHandlerRootView style={styles.gestureContainer}>
            <PinchGestureHandler
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchHandlerStateChange}
            >
              <Animated.View style={styles.imageWrapper}>
                <PanGestureHandler
                  onGestureEvent={onPanGestureEvent}
                  onHandlerStateChange={onPanHandlerStateChange}
                >
                  <Animated.View style={{
                    transform: [
                      { scale },
                      { translateX },
                      { translateY },
                    ],
                  }}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.image}
                      contentFit="cover"
                    />
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </GestureHandlerRootView>
          
          {/* 圆形遮罩边框 */}
          <View style={styles.maskContainer} pointerEvents="none">
            <View style={[styles.maskCircle, { borderColor: theme.primary }]} />
          </View>
          
          {/* 网格线 */}
          <View style={styles.gridContainer} pointerEvents="none">
            <View style={[styles.gridLine, { top: '33.33%' }]} />
            <View style={[styles.gridLine, { top: '66.66%' }]} />
            <View style={[styles.gridLineVertical, { left: '33.33%' }]} />
            <View style={[styles.gridLineVertical, { left: '66.66%' }]} />
          </View>
        </View>

        {/* 底部按钮 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleCancel}>
            <FontAwesome6 name="xmark" size={20} color="#FFFFFF" />
            <ThemedText variant="bodyMedium" color="#FFFFFF" style={{ marginLeft: 8 }}>取消</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
            <FontAwesome6 name="check" size={20} color="#FFFFFF" />
            <ThemedText variant="bodyMedium" color="#FFFFFF" style={{ marginLeft: 8 }}>确认</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 操作提示 */}
        <View style={styles.tips}>
          <View style={styles.tipItem}>
            <FontAwesome6 name="hand-pointer" size={16} color="#FFFFFF80" />
            <ThemedText variant="caption" color="#FFFFFF80" style={{ marginLeft: 6 }}>双指缩放</ThemedText>
          </View>
          <View style={styles.tipItem}>
            <FontAwesome6 name="arrows-up-down-left-right" size={16} color="#FFFFFF80" />
            <ThemedText variant="caption" color="#FFFFFF80" style={{ marginLeft: 6 }}>拖拽移动</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cropArea: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    position: 'relative',
  },
  gestureContainer: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    overflow: 'hidden',
    borderRadius: CROP_SIZE / 2,
  },
  imageWrapper: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: CROP_SIZE,
    height: CROP_SIZE,
  },
  maskContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskCircle: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    borderRadius: CROP_SIZE / 2,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    height: 1,
  },
  gridLineVertical: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 1,
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH - 48,
    marginTop: 32,
    gap: 16,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#38BDF8',
  },
  tips: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
