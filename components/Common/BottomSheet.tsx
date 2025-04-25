import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomSwitch from './CustomSwitch';
import { Trash2 } from 'lucide-react-native';

interface CustomBottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  showApiInfo: boolean;
  toggleApiInfo: () => void;
  useApiResponse: boolean;
  toggleUseApiResponse: () => void;
  clearMessages?: () => void;
  deleteChat?: () => void;
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
  clearMessages,
  deleteChat,
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

  const handleClearChat = useCallback(() => {
    if (!clearMessages) return;
    
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear all messages?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearMessages();
            bottomSheetModalRef.current?.close();
          }
        }
      ]
    );
  }, [clearMessages, bottomSheetModalRef]);

  const handleDeleteChat = useCallback(() => {
    if (!deleteChat) return;
    
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteChat();
            bottomSheetModalRef.current?.close();
          }
        }
      ]
    );
  }, [deleteChat, bottomSheetModalRef]);

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
          <CustomSwitch
            value={showApiInfo}
            onValueChange={toggleApiInfo}
          />
        </View>
        
        <View style={styles.option}>
          <Text style={styles.optionText}>Use API Response</Text>
          <CustomSwitch
            value={useApiResponse}
            onValueChange={toggleUseApiResponse}
          />
        </View>
        
        {clearMessages && (
          <TouchableOpacity 
            style={styles.clearChatButton} 
            onPress={handleClearChat}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color="#FF4545" />
            <Text style={styles.clearChatText}>Clear Chat History</Text>
          </TouchableOpacity>
        )}

        {deleteChat && (
          <TouchableOpacity 
            style={[styles.clearChatButton, { backgroundColor: '#3A1A1A' }]} 
            onPress={handleDeleteChat}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color="#FF4545" />
            <Text style={styles.clearChatText}>Delete Chat</Text>
          </TouchableOpacity>
        )}
        
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
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  apiInfoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  apiInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  apiInfoText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  indicator: {
    backgroundColor: '#555555',
    width: 40,
  },
  clearChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  clearChatText: {
    color: '#FF4545',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default CustomBottomSheet;