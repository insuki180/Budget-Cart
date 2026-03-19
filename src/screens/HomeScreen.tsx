import * as React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useCart } from '../store/CartContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { budget, currentTotal, cartItems } = useCart();
  const navigation = useNavigation<any>();

  const available = budget - currentTotal;
  const isOver = currentTotal > budget;
  const percentage = Math.max(0, (currentTotal / budget) * 100);
  
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isOver) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [isOver]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: isOver ? pulse.value : 1,
  }));
  
  let statusColor = 'text-emerald-500';
  let progressBg = 'bg-emerald-500';
  let bgColor = 'bg-white';

  if (isOver) {
    statusColor = 'text-rose-600';
    progressBg = 'bg-rose-600';
    bgColor = 'bg-[#FEE2E2]';
  } else if (percentage >= 80) {
    statusColor = 'text-amber-500';
    progressBg = 'bg-amber-500';
  }

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <View className="px-8 pt-12">
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-gray-400 font-black uppercase tracking-[3px] text-[10px]">Command Center</Text>
            <Text className="text-3xl font-black text-gray-900 tracking-tighter mt-1">BudgetCart ₹</Text>
          </View>
          <TouchableOpacity 
            className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center border border-gray-200"
            onPress={() => navigation.navigate('Cart')}
          >
            <MaterialCommunityIcons name="cart-outline" size={24} color="#111827" />
            {cartItems.length > 0 && (
              <View className="absolute -top-1 -right-1 bg-blue-600 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-[10px] text-white font-black">{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* FINTECH BUDGET CARD */}
        <Animated.View 
          className="bg-white p-8 rounded-[48px] shadow-2xl shadow-gray-200 border border-gray-100 items-center"
          style={isOver ? animatedStyle : {}}
        >
          <Text className="text-gray-400 font-bold uppercase tracking-widest text-[11px] mb-2 text-center">Available Budget</Text>
          <Text className={`text-6xl font-black ${statusColor} tracking-tighter`}>₹{available}</Text>
          
          <View className="w-full mt-10">
            <View className="flex-row justify-between mb-3 px-1">
              <Text className="text-xs font-black text-gray-400 uppercase">Trip Progress</Text>
              <Text className={`text-xs font-black ${statusColor}`}>{Math.round(percentage)}%</Text>
            </View>
            <View className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <Animated.View 
                className={`h-full ${progressBg}`} 
                style={[{ width: `${Math.min(percentage, 100)}%` }, isOver ? animatedStyle : {}]} 
              />
            </View>
          </View>

          <View className="flex-row w-full mt-10 space-x-4">
             <View className="flex-1 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <Text className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Limit</Text>
                <Text className="text-lg font-black text-gray-800">₹{budget}</Text>
             </View>
             <View className="flex-1 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <Text className="text-[9px] font-black text-gray-400 uppercase mb-1">Current Spent</Text>
                <Text className="text-lg font-black text-gray-800">₹{currentTotal}</Text>
             </View>
          </View>
        </Animated.View>

        <View className="mt-12 items-center">
           <Text className="text-gray-300 font-bold text-center px-6">
             Your offline-first, crowdsourced savings tracker.
           </Text>
        </View>
      </View>

      {/* QUICK SCAN FAB */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Scanner')}
        className="absolute bottom-10 right-8 w-20 h-20 bg-emerald-600 rounded-full items-center justify-center shadow-2xl border-4 border-white"
      >
        <MaterialCommunityIcons name="barcode-scan" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
