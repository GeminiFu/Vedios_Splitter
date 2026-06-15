import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface Props {
  totalDuration: number;
  segmentDuration: number;
}

function SplitInfo({totalDuration, segmentDuration}: Props): React.JSX.Element {
  const segmentCount = Math.ceil(totalDuration / segmentDuration);
  const lastSegmentDuration = totalDuration % segmentDuration || segmentDuration;
  const isLastSegmentShort = lastSegmentDuration < segmentDuration;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>分割資訊</Text>
      <Text style={styles.info}>分割時長：{segmentDuration} 秒</Text>
      <Text style={styles.info}>共會分割成：{segmentCount} 個片段</Text>
      {isLastSegmentShort && (
        <Text style={styles.warning}>
          ⚠️ 最後一段時長：{lastSegmentDuration.toFixed(1)} 秒
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  warning: {
    fontSize: 14,
    color: '#E65100',
    marginTop: 4,
  },
});

export default SplitInfo;