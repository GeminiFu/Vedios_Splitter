import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import VideoSelector from '../components/VideoSelector';
import DurationSlider from '../components/DurationSlider';
import SplitInfo from '../components/SplitInfo';
import ProgressBar from '../components/ProgressBar';
import {splitVideo, videoSplitterEmitter} from '../utils/VideoSplitterModule';
import {generatePrefix} from '../utils/fileHelper';
import {RootStackParamList} from '../../App';
import RNFS from 'react-native-fs';

interface VideoInfo {
  uri: string;
  name: string;
  duration: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [segmentDuration, setSegmentDuration] = useState(30);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      listenerRef.current?.remove();
    };
  }, []);

  const handleSplit = async () => {
    if (!video) return;

    const segmentCount = Math.ceil(video.duration / segmentDuration);
    setTotalSegments(segmentCount);
    setProcessing(true);
    setProgress(0);
    setCurrentSegment(0);

    listenerRef.current = videoSplitterEmitter.addListener(
      'VideoSplitProgress',
      event => {
        setCurrentSegment(event.current);
        setProgress(event.progress);
      },
    );

    try {
      const prefix = generatePrefix();
      const outputDir = `${RNFS.CachesDirectoryPath}/VideoSplitter`;
      await RNFS.mkdir(outputDir);

      const segments = await splitVideo(
        video.uri,
        segmentDuration,
        outputDir,
        prefix,
      );

      listenerRef.current?.remove();
      navigation.navigate('Result', {segments});
    } catch (err: any) {
      Alert.alert('分割失敗', err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <VideoSelector onVideoSelected={setVideo} />
      {video && (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>已選擇：{video.name}</Text>
            <Text style={styles.infoText}>
              時長：{video.duration.toFixed(1)} 秒
            </Text>
          </View>
          <DurationSlider
            value={segmentDuration}
            onValueChange={setSegmentDuration}
          />
          <SplitInfo
            totalDuration={video.duration}
            segmentDuration={segmentDuration}
          />
          {processing ? (
            <ProgressBar
              progress={progress}
              current={currentSegment}
              total={totalSegments}
            />
          ) : (
            <TouchableOpacity
              style={styles.splitButton}
              onPress={handleSplit}>
              <Text style={styles.splitButtonText}>開始分割</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  splitButton: {
    margin: 16,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  splitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;