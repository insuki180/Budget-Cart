import React from 'react';
import { View, Text } from 'react-native';

export default function CartItemCard() {
  return (
    <View className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <Text className="font-semibold text-lg text-gray-800">Sample Item</Text>
      <Text className="text-gray-500">₹100</Text>
    </View>
  );
}
