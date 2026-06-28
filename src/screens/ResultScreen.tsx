import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useTranslation} from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

function ResultScreen({route}: Props): React.JSX.Element {
  const {t} = useTranslation();
  const {segments} = route.params;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const segment of segments) {
        await CameraRoll.saveAsset(`file://${segment.path}`, {type: 'video'});
      }
      setSaved(true);
      Alert.alert(
        t('result.saveSuccess'),
        t('result.saveSuccessMsg', {count: segments.length}),
      );
    } catch (err: any) {
      Alert.alert(t('result.saveFailed'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 10);
    if (m > 0) {
      return `${m}分 ${String(s).padStart(2, '0')}秒`;
    }
    return `${s}.${ms} 秒`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {t('result.completed')} {segments.length} {t('result.segments')}
        </Text>
      </View>

      <FlatList
        data={segments}
        keyExtractor={item => String(item.index)}
        renderItem={({item}) => (
          <View style={styles.segmentItem}>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{item.index}</Text>
            </View>
            <View style={styles.segmentInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.fileName}
              </Text>
              <Text style={styles.duration}>
                {t('result.fileDuration')}：{formatDuration(item.duration)}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={[styles.saveButton, (saving || saved) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving || saved}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {saved ? t('result.saved') : t('result.saveToGallery')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  list: {
    padding: 16,
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  segmentInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    margin: 16,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResultScreen;