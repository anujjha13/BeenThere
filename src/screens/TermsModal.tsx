import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, TouchableOpacity, Text, View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const TERMS_URL = 'https://beenaround.app/terms';

const TermsModal = ({ visible, onAccept }: { visible: boolean; onAccept: () => void }) => {
  const [checked, setChecked] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  useEffect(() => { if (!visible) { setChecked(false); setShowWebView(false); } }, [visible]);

  const { height, width } = Dimensions.get('window');
  const compactHeight = 320;
  const compactWidth = width * 0.92;
  const expandedHeight = height * 0.85;
  const expandedWidth = width * 0.92;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 10,
          width: showWebView ? expandedWidth : compactWidth,
          height: showWebView ? expandedHeight : compactHeight,
          overflow: 'hidden',
        }}>
          {showWebView ? (
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => setShowWebView(false)} style={{ alignSelf: 'flex-end', padding: 12 }}>
                <Text style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
              <WebView source={{ uri: TERMS_URL }} style={{ flex: 1, borderRadius: 8 }} />
            </View>
          ) : (
            <>
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Terms & Conditions</Text>
                <Text style={{ marginBottom: 10 }}>
                  By using BeenAround, you agree to our{' '}
                  <Text style={{ color: 'blue' }} onPress={() => setShowWebView(true)}>
                    Terms & Conditions
                  </Text>
                  .
                </Text>
                <Text style={{ color: 'red', fontWeight: 'bold', marginBottom: 10 }}>
                  There is ZERO TOLERANCE for objectionable content or abusive users. Any violation may result in immediate removal of content and/or account suspension.
                </Text>
                <Text style={{ color: '#555', marginBottom: 10 }}>
                  Please read and accept to continue using BeenAround.
                </Text>
              </ScrollView>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 20 }}>
                <TouchableOpacity onPress={() => setChecked(!checked)} style={{width: 24, height: 24, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 4, alignItems: 'center', justifyContent: 'center'}}>
                  {checked ? <View style={{width: 16, height: 16, backgroundColor: '#2E7D32', borderRadius: 2}} /> : null}
                </TouchableOpacity>
                <Text style={{ marginLeft: 8 }}>I agree to the Terms & Conditions</Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: checked ? '#2E7D32' : '#ccc',
                  padding: 12,
                  borderRadius: 6,
                  marginTop: 20,
                  alignItems: 'center',
                  marginHorizontal: 20,
                }}
                disabled={!checked}
                onPress={onAccept}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Accept & Continue</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TermsModal;