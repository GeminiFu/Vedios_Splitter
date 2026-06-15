import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import {pick, types} from '@react-native-documents/picker';
import {getVideoDuration} from '../utils/ffmpeg';

interface VideoInfo {
  uri: string;
  name: string;
  duration: number;
}

interface Props {
  onVideoSelected: (video: VideoInfo) => void;
}

function VideoSelector({onVideoSelected}: Props): React.JSX.Element {
  const [loading, setLoading] = useState(false);

  const handlePick = async () => {
    try {
      const [file] = await pick({type: [types.video]});
      setLoading(true);

      const duration = await getVideoDuration(file.uri);

      if (duration === 0) {
        Alert.alert('無法讀取影片', '請選擇其他影片');
        return;
      }

      if (duration > 600) {
        Alert.alert('影片過長', '請選擇 10 分鐘以內的影片');
        return;
      }

      onVideoSelected({
        uri: file.uri,
        name: file.name ?? 'unknown',
        duration,
      });
    } catch (err) {
      // 使用者取消選取
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePick}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>選擇影片</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#90CAF9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoSelector;