import React from 'react';
import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {useLicense} from '../contexts/LicenseContext';

function WelcomeModal(): React.JSX.Element {
  const {t} = useTranslation();
  const {showWelcome, dismissWelcome} = useLicense();

  return (
    <Modal transparent visible={showWelcome} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Icon name="celebration" size={40} color="#4CAF50" />
          <Text style={styles.title}>{t('paywall.trialTitle')}</Text>
          <Text style={styles.message}>{t('paywall.trialMessage')}</Text>
          <TouchableOpacity style={styles.btn} onPress={dismissWelcome}>
            <Text style={styles.btnText}>{t('paywall.trialConfirm')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 12,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  btn: {
    width: '100%',
    backgroundColor: '#2196F3',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeModal;