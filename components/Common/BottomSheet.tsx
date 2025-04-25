import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomBottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  showApiInfo: boolean;
  toggleApiInfo: () => void;
  useApiResponse: boolean;
  toggleUseApiResponse: () => void;
  apiInfo?: {
    model: string;
    provider: string;
    promptTokens: number;
    completionTokens: number;
  };
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  bottomSheetModalRef,
  showApiInfo,
  toggleApiInfo,
  useApiResponse,
  toggleUseApiResponse,
  apiInfo
}) => {
  const snapPoints = React.useMemo(() => ['40%'], []);
  const insets = useSafeAreaInsets();
  
  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      handleIndicatorStyle={styles.indicator}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
    >
      <BottomSheetView style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.option}>
          <Text style={styles.optionText}>Show API Info</Text>
          <Switch
            value={showApiInfo}
            onValueChange={toggleApiInfo}
            trackColor={{ false: '#3e3e3e', true: '#007AFF' }}
            thumbColor="#f4f3f4"
          />
        </View>
        
        <View style={styles.option}>
          <Text style={styles.optionText}>Use API Response</Text>
          <Switch
            value={useApiResponse}
            onValueChange={toggleUseApiResponse}
            trackColor={{ false: '#3e3e3e', true: '#007AFF' }}
            thumbColor="#f4f3f4"
          />
        </View>
        
        {showApiInfo && apiInfo && (
          <View style={styles.apiInfoContainer}>
            <Text style={styles.apiInfoTitle}>API Information</Text>
            <Text style={styles.apiInfoText}>Model: {apiInfo.model}</Text>
            <Text style={styles.apiInfoText}>Provider: {apiInfo.provider}</Text>
            <Text style={styles.apiInfoText}>
              Tokens: {apiInfo.promptTokens} prompt / {apiInfo.completionTokens} completion
            </Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#1F1F1F',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  indicator: {
    backgroundColor: '#666',
    width: 40,
    height: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  optionText: {
    fontSize: 16,
    color: 'white',
  },
  apiInfoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
  },
  apiInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  apiInfoText: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 5,
  },
});

export default CustomBottomSheet;