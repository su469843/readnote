import React, {useState, useRef} from 'react';
import {View, StyleSheet, PanResponder, Dimensions, Text} from 'react-native';
import Svg, {Path, Circle, G} from 'react-native-svg';
import {Annotation} from '../types';

interface AnnotationLayerProps {
  width: number;
  height: number;
  annotations: Annotation[];
  currentPage: number;
  isAnnotating: boolean;
  onAnnotationAdd: (annotation: Annotation) => void;
  color?: string;
  strokeWidth?: number;
}

export default function AnnotationLayer({
  width,
  height,
  annotations,
  currentPage,
  isAnnotating,
  onAnnotationAdd,
  color = '#FF4444',
  strokeWidth = 3,
}: AnnotationLayerProps) {
  const [currentPoints, setCurrentPoints] = useState<{x: number; y: number}[]>([]);
  // 用 ref 保存最新回调值，避免 PanResponder 闭包捕获过期 state
  const isAnnotatingRef = useRef(isAnnotating);
  isAnnotatingRef.current = isAnnotating;
  const colorRef = useRef(color);
  colorRef.current = color;
  const strokeWidthRef = useRef(strokeWidth);
  strokeWidthRef.current = strokeWidth;
  const onAnnotationAddRef = useRef(onAnnotationAdd);
  onAnnotationAddRef.current = onAnnotationAdd;
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  const pageAnnotations = annotations.filter((a) => a.page === currentPage);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isAnnotatingRef.current,
      onMoveShouldSetPanResponder: () => isAnnotatingRef.current,
      onPanResponderGrant: (evt) => {
        const {locationX, locationY} = evt.nativeEvent;
        setCurrentPoints([{x: locationX, y: locationY}]);
      },
      onPanResponderMove: (evt) => {
        const {locationX, locationY} = evt.nativeEvent;
        setCurrentPoints((prev) => [...prev, {x: locationX, y: locationY}]);
      },
      onPanResponderRelease: () => {
        setCurrentPoints((prev) => {
          if (prev.length > 1) {
            const newAnnotation: Annotation = {
              id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              page: currentPageRef.current,
              points: prev,
              color: colorRef.current,
              strokeWidth: strokeWidthRef.current,
            };
            onAnnotationAddRef.current(newAnnotation);
          }
          return [];
        });
      },
    }),
  ).current;

  const buildPathData = (points: {x: number; y: number}[]) => {
    if (!points || points.length === 0) return '';
    // 过滤掉坐标异常的点防止 SVG 原生层崩溃
    const valid = points.filter((p) => p != null && isFinite(p.x) && isFinite(p.y));
    if (valid.length < 2) return '';
    return valid
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  };

  if (!isAnnotating && pageAnnotations.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, {width, height}]} {...panResponder.panHandlers}>
      <Svg width={width} height={height} style={styles.svg}>
        {pageAnnotations.map((ann) => (
          <Path
            key={ann.id}
            d={buildPathData(ann.points)}
            stroke={ann.color}
            strokeWidth={ann.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {isAnnotating && currentPoints.length > 0 && (
          <Path
            d={buildPathData(currentPoints)}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        )}
      </Svg>
      {isAnnotating && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>标注中</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
