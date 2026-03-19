import * as React from 'react';
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { useCart } from '../store/CartContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { injectMockData } from '../utils/mockData';

export default function CartScreen() {
  const { cartItems, totalBachat, currentTotal, budget, setBudget, updateQuantity, clearCart, addToCart } = useCart();
  const navigation = useNavigation<any>();
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.toString());

  const isOver = currentTotal > budget;
  const percentage = Math.max(0, (currentTotal / budget) * 100);
  
  let progressColor = 'bg-emerald-500';
  let bgColor = 'bg-gray-50';
  let accentColor = 'text-emerald-500';

  if (isOver) {
    progressColor = 'bg-rose-600';
    bgColor = 'bg-[#FEE2E2]';
    accentColor = 'text-rose-600';
  } else if (percentage >= 80) {
    progressColor = 'bg-amber-500';
    accentColor = 'text-amber-500';
  }

  const handleUpdateBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      setShowBudgetModal(false);
    }
  };

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* HEADER BAR */}
      <View className="flex-row justify-between items-center px-6 pt-6 pb-2">
        <Text className="text-3xl font-black text-gray-900 tracking-tighter">My Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <MaterialCommunityIcons name="trash-can-outline" size={28} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View className="px-6 flex-1">
        {/* PROGRESS & BUDGET */}
        <View className="mt-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <View className="flex-row justify-between mb-3 items-end">
            <TouchableOpacity onPress={() => { setTempBudget(budget.toString()); setShowBudgetModal(true); }}>
              <View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Budget Limit</Text>
                <View className="flex-row items-center">
                  <Text className="text-xl font-black text-gray-800">₹{budget}</Text>
                  <MaterialCommunityIcons name="pencil" size={14} color="#9ca3af" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </TouchableOpacity>
            <View className="items-end">
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Spent</Text>
              <Text className={`text-xl font-black ${isOver ? 'text-rose-600' : 'text-gray-800'}`}>₹{currentTotal}</Text>
            </View>
          </View>
          
          <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <View className={`h-full ${progressColor}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
          </View>
          {isOver && (
            <Text className="text-[10px] font-black text-rose-600 uppercase mt-2 text-center tracking-widest">⚠️ Budget Exceeded</Text>
          )}
        </View>

        {/* ITEMS LIST */}
        <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mt-8 mb-4 ml-2">Items ({cartItems.length})</Text>
        
        <FlatList
          data={cartItems}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <MaterialCommunityIcons name="cart-variant" size={64} color="#e5e7eb" />
              <Text className="text-center text-gray-400 font-bold mt-4 text-lg">Your cart is empty.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-5 mb-4 rounded-[32px] shadow-sm border border-gray-100 flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-black text-gray-900 leading-tight mb-1">{item.name}</Text>
                <View className="flex-row items-center">
                   <View className="bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                    <Text className="text-emerald-700 font-black text-[10px]">SAVE ₹{(item.savings/item.quantity).toFixed(2)}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs ml-3 font-bold line-through">₹{item.mrp}</Text>
                </View>

                {/* QUANTITY CONTROL */}
                <View className="flex-row items-center mt-4 bg-gray-50 self-start rounded-2xl p-1 border border-gray-100">
                  <TouchableOpacity 
                    onPress={() => updateQuantity(item.id, -1)}
                    className="w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <MaterialCommunityIcons name="minus" size={20} color="#374151" />
                  </TouchableOpacity>
                  <Text className="mx-4 text-lg font-black text-gray-800">{item.quantity}</Text>
                  <TouchableOpacity 
                    onPress={() => updateQuantity(item.id, 1)}
                    className="w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <MaterialCommunityIcons name="plus" size={20} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-2xl font-black text-gray-900">₹{item.finalTotal}</Text>
                <Text className="text-[10px] font-bold text-gray-400">₹{item.sellingPrice}/ea</Text>
              </View>
            </View>
          )}
        />
      </View>

      {/* STICKY footer FOR BACHAT */}
      <View className="absolute bottom-28 left-6 right-6">
        <View className="bg-emerald-600 p-4 rounded-3xl shadow-xl flex-row justify-between items-center border-2 border-white">
          <View>
             <Text className="text-emerald-100 font-black text-[9px] uppercase tracking-widest">Total Bachat</Text>
             <Text className="text-2xl font-black text-white">₹{totalBachat}</Text>
          </View>
          <View className="bg-emerald-500/50 px-3 py-1 rounded-full">
            <Text className="text-white font-black text-[10px]">SAVED! 🎉</Text>
          </View>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity 
        className="absolute bottom-8 right-8 w-20 h-20 bg-blue-600 rounded-[30px] shadow-2xl items-center justify-center border-4 border-white"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Scanner')}
      >
        <MaterialCommunityIcons name="barcode-scan" size={36} color="white" />
      </TouchableOpacity>

      {/* BUDGET MODAL */}
      <Modal visible={showBudgetModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
            <Text className="text-2xl font-black text-gray-900 mb-2">Edit Budget</Text>
            <Text className="text-gray-500 mb-6 font-bold">Set your spending limit for this trip.</Text>
            
            <TextInput 
              className="bg-gray-50 p-6 rounded-3xl text-3xl font-black text-gray-900 border-2 border-gray-100 mb-8"
              keyboardType="numeric"
              autoFocus
              value={tempBudget}
              onChangeText={setTempBudget}
              placeholder="₹ Amount"
            />

            <View className="flex-row space-x-4">
               <TouchableOpacity 
                className="flex-1 p-5 rounded-2xl items-center"
                onPress={() => setShowBudgetModal(false)}
              >
                <Text className="text-gray-400 text-lg font-black uppercase">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-2 bg-emerald-600 p-5 rounded-[24px] items-center shadow-lg shadow-emerald-200"
                onPress={handleUpdateBudget}
              >
                <Text className="text-white text-lg font-black uppercase">Save Limit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
