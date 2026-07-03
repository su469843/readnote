import React, {useState, useCallback} from 'react';
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

  const pageAnnotations = annotations.filter((a) => a.page === currentPage);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isAnnotating,
    onMoveShouldSetPanResponder: () => isAnnotating,
    onPanResponderGrant: (evt) => {
      const {locationX, locationY} = evt.nativeEvent;
      setCurrentPoints([{x: locationX, y: locationY}]);
    },
    onPanResponderMove: (evt) => {
      const {locationX, locationY} = evt.nativeEvent;
      setCurrentPoints((prev) => [...prev, {x: locationX, y: locationY}]);
    },
    onPanResponderRelease: () => {
      if (currentPoints.length > 1) {
        const newAnnotation: Annotation = {
          id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          page: currentPage,
          points: currentPoints,
          color,
          strokeWidth,
        };
        onAnnotationAdd(newAnnotation);
      }
      setCurrentPoints([]);
    },
  });

  const buildPathData = (points: {x: number; y: number}[]) => {
    if (points.length === 0) return '';
    return points
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