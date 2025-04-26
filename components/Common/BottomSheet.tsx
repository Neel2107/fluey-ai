import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Trash2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomSwitch from './CustomSwitch';

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
  forceNextFail?: boolean;
  setForceNextFail?: (v: boolean) => void;
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  bottomSheetModalRef,
  showApiInfo,
  toggleApiInfo,
  useApiResponse,
  toggleUseApiResponse,
  deleteChat,
  apiInfo,
  forceNextFail,
  setForceNextFail
}) => {
  const snapPoints = React.useMemo(() => ['40%'], []);
  const insets = useSafeAreaInsets();

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
      handleIndicatorStyle={{ backgroundColor: '#555555', width: 40 }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#1F1F1F' }}
    >
      <BottomSheetView className="flex-1 p-4" style={{ paddingBottom: insets.bottom }}>
        <Text className="text-xl font-bold text-white mb-6">Settings</Text>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base text-white">Show API Info</Text>
          <CustomSwitch
            value={showApiInfo}
            onValueChange={toggleApiInfo}
          />
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base text-white">Use API Response</Text>
          <CustomSwitch
            value={useApiResponse}
            onValueChange={toggleUseApiResponse}
          />
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base text-white">Force Next Message to Fail</Text>
          <TouchableOpacity
            onPress={() => setForceNextFail && setForceNextFail(!forceNextFail)}
            style={{
              padding: 12,
              backgroundColor: forceNextFail ? '#ef4444' : '#444',
              borderRadius: 8,
              marginLeft: 12,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {forceNextFail ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base text-white">Delete Chat</Text>
          <TouchableOpacity
            className="p-2"
            onPress={handleDeleteChat}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color="#FF4545" />
          </TouchableOpacity>
        </View>

        {showApiInfo && apiInfo && (
          <View className="mt-6 p-4 bg-zinc-800 rounded-lg">
            <Text className="text-base font-bold text-white mb-2">API Information</Text>
            <Text className="text-sm text-zinc-300 mb-1">Model: {apiInfo.model}</Text>
            <Text className="text-sm text-zinc-300 mb-1">Provider: {apiInfo.provider}</Text>
            <Text className="text-sm text-zinc-300">
              Tokens: {apiInfo.promptTokens} prompt / {apiInfo.completionTokens} completion
            </Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default CustomBottomSheet;