import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  Result: {
    segments: {
      fileName: string;
      duration: number;
      path: string;
    }[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: '影片分割'}}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{title: '分割結果'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;