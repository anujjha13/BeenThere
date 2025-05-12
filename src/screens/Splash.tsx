import React ,{useEffect}from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import BeenThere from '../../utils/BeenThere';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';

export default function Splash( {navigation} ) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Startup');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        <BeenThere/>
      </SafeAreaView>
    </GradientScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
