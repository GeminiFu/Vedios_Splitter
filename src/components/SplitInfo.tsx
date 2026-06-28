import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

interface Props {
  totalDuration: number;
  segmentDuration: number;
}

function SplitInfo({totalDuration, segmentDuration}: Props): React.JSX.Element {
  const {t} = useTranslation();
  const segmentCount = Math.ceil(totalDuration / segmentDuration);
  const lastSegmentDuration = totalDuration % segmentDuration || segmentDuration;
  const isLastSegmentShort = lastSegmentDuration < segmentDuration;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.splitInfo')}</Text>
      <Text style={styles.info}>
        {t('home.segmentDuration')}：{segmentDuration} {t('home.seconds')}
      </Text>
      <Text style={styles.info}>
        {t('home.segmentCount')} {segmentCount} {t('home.segmentUnit')}
      </Text>
      {isLastSegmentShort && (
        <Text style={styles.warning}>
          {t('home.lastSegment')}：{lastSegmentDuration.toFixed(1)} {t('home.seconds')}
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