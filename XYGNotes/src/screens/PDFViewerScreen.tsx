import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import AnnotationLayer from '../components/AnnotationLayer';
import {loadAnnotations, saveAnnotations} from '../utils/fileManager';
import {Annotation, AnnotationFile} from '../types';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export default function PDFViewerScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const {pdfPath, annotationsPath} = route.params;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationData, setAnnotationData] = useState<AnnotationFile>({
    pdfName: pdfPath.split('/').pop() || '',
    annotations: [],
    version: '1.0',
  });
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const pdfRef = useRef<any>(null);

  const loadAnnotationData = useCallback(async () => {
    const data = await loadAnnotations(annotationsPath);
    setAnnotationData(data);
  }, [annotationsPath]);

  React.useEffect(() => {
    loadAnnotationData();
  }, [loadAnnotationData]);

  const handleAnnotationAdd = async (annotation: Annotation) => {
    const updated = {
      ...annotationData,
      annotations: [...annotationData.annotations, annotation],
    };
    setAnnotationData(updated);
    await saveAnnotations(annotationsPath, updated);
  };

  const handleToggleAnnotate = () => {
    setIsAnnotating((prev) => !prev);
  };

  const handleClearAnnotations = () => {
    const updated = {
      ...annotationData,
      annotations: annotationData.annotations.filter(
        (a) => a.page !== currentPage,
      ),
    };
    setAnnotationData(updated);
    saveAnnotations(annotationsPath, updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          {currentPage} / {totalPages}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.annotateBtn,
              isAnnotating && styles.annotateBtnActive,
            ]}
            onPress={handleToggleAnnotate}>
            <Text
              style={[
                styles.annotateBtnText,
                isAnnotating && styles.annotateBtnTextActive,
              ]}>
              ✏️
            </Text>
          </TouchableOpacity>
          {isAnnotating && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearAnnotations}>
              <Text style={styles.clearBtnText}>清除</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.pdfContainer}>
        {!pdfLoaded && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#4A90D9" />
            <Text style={styles.loadingText}>加载 PDF...</Text>
          </View>
        )}
        <Pdf
          ref={pdfRef}
          source={{uri: pdfPath, cache: false}}
          style={styles.pdf}
          onLoadComplete={(numberOfPages: number) => {
            setTotalPages(numberOfPages);
            setPdfLoaded(true);
          }}
          onPageChanged={(page: number) => {
            setCurrentPage(page);
          }}
          onError={(error: any) => {
            console.warn('PDF load error:', error);
          }}
          enablePaging
          horizontal
        />
        {pdfLoaded && (
          <AnnotationLayer
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT - 120}
            annotations={annotationData.annotations}
            currentPage={currentPage}
            isAnnotating={isAnnotating}
            onAnnotationAdd={handleAnnotationAdd}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backText: {
    fontSize: 16,
    color: '#4A90D9',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  annotateBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  annotateBtnActive: {
    backgroundColor: '#FFE0E0',
    borderColor: '#FF4444',
  },
  annotateBtnText: {
    fontSize: 18,
  },
  annotateBtnTextActive: {
    fontSize: 18,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  clearBtnText: {
    color: '#fff',
    fontSize: 12,
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
});