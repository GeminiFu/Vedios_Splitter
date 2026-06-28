import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useVideoPlayer, VideoView} from 'react-native-video';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {splitVideo, videoSplitterEmitter} from '../utils/VideoSplitterModule';
import {generatePrefix} from '../utils/fileHelper';
import RNFS from 'react-native-fs';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Preview'>;

const TIMELINE_PADDING = 16;
const TIMELINE_WIDTH = Dimensions.get('window').width - TIMELINE_PADDING * 2;

interface SplitPoint {
  id: string;
  time: number;
}

function PreviewScreen({route}: Props): React.JSX.Element {
  const {t} = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const {uri, duration, segmentDuration} = route.params;
  const [currentTime, setCurrentTime] = useState(0);
  const [paused, setPaused] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);

  // 產生初始分割點
  const generateInitialPoints = (): SplitPoint[] => {
    const points: SplitPoint[] = [];
    let time = segmentDuration;
    let index = 0;
    while (time < duration) {
      points.push({id: String(index++), time});
      time += segmentDuration;
    }
    return points;
  };

  const [splitPoints] = useState<SplitPoint[]>(generateInitialPoints);

  const player = useVideoPlayer(uri, p => {
    p.pause();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(player.currentTime);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const timeToX = (time: number): number => {
    return (time / duration) * TIMELINE_WIDTH;
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const handleSplit = async () => {
    setProcessing(true);

  const listener = videoSplitterEmitter.addListener(
    'VideoSplitProgress',
    event => {
      setCurrentSegment(event.current);
      setProgress(event.progress);
      setTotalSegments(event.total);
    },
  );

    try {
      const prefix = generatePrefix();
      const outputDir = `${RNFS.CachesDirectoryPath}/VideoSplitter`;
      await RNFS.mkdir(outputDir);

      const segments = await splitVideo(
        uri,
        segmentDuration,
        outputDir,
        prefix,
      );

      listener.remove();
      navigation.navigate('Result', {segments});
    } catch (err: any) {
      Alert.alert(t('home.splitFailed'), err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 影片播放器 */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => {
          if (paused) {
            player.play();
          } else {
            player.pause();
          }
          setPaused(p => !p);
        }}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
        />
        {paused && (
          <View style={styles.playOverlay}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 時間顯示 */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* 時間條 */}
      <View style={styles.timelineWrapper}>
        {/* 分割點標示（時間條上方） */}
        <View style={styles.splitPointsRow}>
          {splitPoints.map(point => {
            const x = timeToX(point.time);
            if (x < 0 || x > TIMELINE_WIDTH) return null;
            return (
              <View
                key={point.id}
                style={[styles.splitPoint, {left: x - 6}]}
              />
            );
          })}
        </View>

        {/* 時間條主體 */}
        <View style={styles.timeline}>
          {/* 已播放區域 */}
          <View style={[styles.timelineFill, {width: timeToX(currentTime)}]} />
          {/* 播放游標 */}
          <View style={[styles.playhead, {left: timeToX(currentTime) - 1}]} />
          {/* 分割點垂直線 */}
          {splitPoints.map(point => {
            const x = timeToX(point.time);
            if (x < 0 || x > TIMELINE_WIDTH) return null;
            return (
              <View
                key={point.id}
                style={[styles.splitLine, {left: x - 1}]}
              />
            );
          })}
        </View>

        {/* 時間刻度 */}
        <View style={styles.timeScale}>
          {Array.from({length: 5}).map((_, i) => (
            <Text key={i} style={styles.timeScaleText}>
              {formatTime((i / 4) * duration)}
            </Text>
          ))}
        </View>
      </View>

      {/* 開始分割按鈕 */}
      <TouchableOpacity
        style={[styles.splitButton, processing && styles.splitButtonDisabled]}
        onPress={handleSplit}
        disabled={processing}>
        {processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.splitButtonText}>{t('preview.startSplit')}</Text>
        )}

      </TouchableOpacity>

      {/* 進度條 */}
      {processing && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {t('progress.processing')}：{currentSegment} / {totalSegments}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 48,
    color: 'rgba(255,255,255,0.8)',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: TIMELINE_PADDING,
    paddingVertical: 6,
    backgroundColor: '#111',
  },
  timeText: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  timelineWrapper: {
    paddingHorizontal: TIMELINE_PADDING,
    paddingVertical: 8,
    backgroundColor: '#111',
  },
  splitPointsRow: {
    height: 12,
    position: 'relative',
  },
  splitPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#FF9800',
    transform: [{rotate: '45deg'}],
  },
  timeline: {
    height: 36,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  timelineFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#2196F3',
    opacity: 0.4,
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#fff',
  },
  splitLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FF9800',
    opacity: 0.8,
  },
  timeScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeScaleText: {
    color: '#666',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  splitButton: {
    margin: 16,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  splitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  splitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
  margin: 16,
  padding: 16,
  backgroundColor: '#1a1a1a',
  borderRadius: 8,
},
progressText: {
  color: '#aaa',
  fontSize: 14,
  marginBottom: 8,
},
progressTrack: {
  height: 12,
  backgroundColor: '#333',
  borderRadius: 6,
  overflow: 'hidden',
},
progressFill: {
  height: '100%',
  backgroundColor: '#2196F3',
  borderRadius: 6,
},
progressPercent: {
  color: '#aaa',
  fontSize: 12,
  marginTop: 4,
  textAlign: 'right',
},
});

export default PreviewScreen;