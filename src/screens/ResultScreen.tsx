import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

function ResultScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text>ResultScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ResultScreen;