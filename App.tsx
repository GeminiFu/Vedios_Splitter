import './src/i18n';
import i18n from './src/i18n';
import {I18nextProvider} from 'react-i18next';
import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {LANGUAGES} from './src/i18n';
import HomeScreen from './src/screens/HomeScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import ResultScreen from './src/screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  Preview: {
    uri: string;
    duration: number;
    segmentDuration: number;
  };
  Result: {
    segments: {
      fileName: string;
      duration: number;
      path: string;
      index: number;
    }[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LanguagePicker() {
  const {i18n} = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.langIcon}>
        <Icon name="language" size={24} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.menuItem,
                  i18n.language === lang.code && styles.menuItemActive,
                ]}
                onPress={() => {
                  i18n.changeLanguage(lang.code);
                  setVisible(false);
                }}>
                <Text
                  style={[
                    styles.menuText,
                    i18n.language === lang.code && styles.menuTextActive,
                  ]}>
                  {lang.label}
                </Text>
                {i18n.language === lang.code && (
                  <Icon name="check" size={16} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function AppNavigator() {
  const {t} = useTranslation();

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'VideoSplitter',
          headerRight: () => <LanguagePicker />,
        }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{title: ''}}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{title: t('result.title')}}
      />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  langIcon: {
    paddingHorizontal: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
  },
  menu: {
    marginTop: 56,
    marginRight: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 180,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemActive: {
    backgroundColor: '#E3F2FD',
  },
  menuText: {
    fontSize: 15,
    color: '#333',
  },
  menuTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default App;