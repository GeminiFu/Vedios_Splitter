import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

interface Props {
  progress: number;
  current: number;
  total: number;
}

function ProgressBar({progress, current, total}: Props): React.JSX.Element {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {t('progress.processing')}：{current} / {total} {t('progress.segment')}
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