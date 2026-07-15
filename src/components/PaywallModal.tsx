import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {useLicense} from '../contexts/LicenseContext';

function PaywallModal(): React.JSX.Element {
  const {t} = useTranslation();
  const {showPaywall, closePaywall, markPurchased} = useLicense();

  const handlePurchase = async () => {
    // TODO: 接上 Google Play Billing
    await markPurchased();
  };

  const handleRestore = async () => {
    // TODO: 接上 Billing 的購買紀錄查詢
  };

  return (
    <Modal
      transparent
      visible={showPaywall}
      animationType="fade"
      onRequestClose={closePaywall}>
      <Pressable style={styles.overlay} onPress={closePaywall}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeBtn} onPress={closePaywall}>
            <Icon name="close" size={22} color="#999" />
          </TouchableOpacity>

          <Icon name="lock-open" size={40} color="#2196F3" />
          <Text style={styles.title}>{t('paywall.title')}</Text>
          <Text style={styles.description}>{t('paywall.description')}</Text>

          <View style={styles.priceBox}>
            <Text style={styles.price}>{t('paywall.price')}</Text>
            <Text style={styles.priceNote}>{t('paywall.priceNote')}</Text>
          </View>

          <TouchableOpacity style={styles.buyBtn} onPress={handlePurchase}>
            <Text style={styles.buyBtnText}>{t('paywall.purchase')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
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
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 6,
    zIndex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  priceBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  priceNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  buyBtn: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restoreText: {
    fontSize: 13,
    color: '#2196F3',
    padding: 6,
  },
});

export default PaywallModal;