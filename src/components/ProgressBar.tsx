import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface Props {
  progress: number; // 0~1
  current: number;
  total: number;
}

function ProgressBar({progress, current, total}: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        處理中：{current} / {total} 個片段
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, {width: `${progress * 100}%`}]} />
      </View>
      <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  track: {
    height: 12,
    backgroundColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  percent: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ProgressBar;