import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';

interface Props {
  value: number;
  onValueChange: (value: number) => void;
}

function DurationSlider({value, onValueChange}: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>分割時長：{value} 秒</Text>
      <Slider
        style={styles.slider}
        minimumValue={10}
        maximumValue={120}
        step={5}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor="#2196F3"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#2196F3"
      />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>10s</Text>
        <Text style={styles.rangeText}>120s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: 12,
    color: '#999',
  },
});

export default DurationSlider;