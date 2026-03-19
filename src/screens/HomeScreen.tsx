import * as React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, FlatList, Image, Modal, TextInput } from 'react-native';
import { useCart, CartItem } from '../store/CartContext';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { parseWhatsAppList } from '../utils/whatsappParser';

/**
 * HomeScreen - Phase 13.2 (Import Modal UI)
 */

export default function HomeScreen() {
  const { budget, setBudget, currentTotal, cartItems, clearCart, updateQuantity, totalBachat, addMultipleToCart } = useCart();
  const navigation = useNavigation<any>();

  // PHASE 13.2: IMPORT MODAL STATE
  const [isImportModalVisible, setIsImportModalVisible] = React.useState(false);
  const [whatsappText, setWhatsappText] = React.useState('');

  // PHASE 14.3: BUDGET MODAL STATE
  const [isBudgetModalVisible, setIsBudgetModalVisible] = React.useState(false);
  const [tempBudgetInput, setTempBudgetInput] = React.useState(budget.toString());

  // PHASE UI.7: OVERBUDGET BLEED LOGIC
  const overage = Math.max(0, currentTotal - budget);
  const overagePercent = budget > 0 ? (overage / budget) * 100 : 0;
  
  // Card turns red from 0% to 100% over budget (max 30% opacity)
  const cardRedOpacity = Math.min(overagePercent / 100, 1) * 0.3;
  
  // Screen turns red ONLY after 100% over budget (gradually to 95% opacity by 1000%)
  const screenRedOpacity = overagePercent > 100 ? Math.min((overagePercent - 100) / 900, 1) * 0.95 : 0;

  const percentage = budget > 0 ? (currentTotal / budget) * 100 : 0;
  let progressColor = '#10B981'; // Green
  if (percentage >= 100) progressColor = '#E11D48'; // Red
  else if (percentage >= 80) progressColor = '#F59E0B'; // Orange

  const handleUpdateBudget = () => {
    const val = parseFloat(tempBudgetInput);
    if (!isNaN(val) && val >= 0) {
      setBudget(val);
      setIsBudgetModalVisible(false);
    }
  };

  const handleImport = () => {
    if (!whatsappText.trim()) return;
    const items = parseWhatsAppList(whatsappText);
    addMultipleToCart(items as any);
    setWhatsappText('');
    setIsImportModalVisible(false);
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const isPending = item.sellingPrice === 0;

    return (
      <View 
        className={`bg-white w-[180px] p-4 mr-4 rounded-[32px] shadow-sm border ${isPending ? 'border-dashed border-orange-200 bg-orange-50/10' : 'border-gray-100'} flex-col`}
        style={{ height: 160 }}
      >
         {/* Phase 14.2: Solid Image Placeholder */}
         <View style={{ backgroundColor: '#F3F4F6', height: 50, width: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
            <Feather name={isPending ? "alert-circle" : "shopping-bag"} size={20} color={isPending ? "#FB923C" : "#9CA3AF"} />
         </View>
         
         <Text className={`font-black text-xs leading-tight mb-1 h-8 ${isPending ? 'text-gray-400' : 'text-[#1F2937]'}`} numberOfLines={2}>
           {item.name}
         </Text>
         
         <View className="flex-row items-center justify-between mt-auto">
            {isPending ? (
              <Text className="text-orange-400 font-black text-[9px] uppercase tracking-widest">Pending</Text>
            ) : (
              <Text className="text-[#14532D] font-black text-sm">₹{item.sellingPrice}</Text>
            )}

            {/* Phase 14.2: Fixed Quantity Controls (Native Style) */}
            <View 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: '#F3F4F6', 
                borderRadius: 8, 
                paddingHorizontal: 6, 
                paddingVertical: 2,
                opacity: isPending ? 0.5 : 1
              }}
              pointerEvents={isPending ? 'none' : 'auto'}
            >
                <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} disabled={isPending}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', paddingHorizontal: 6 }}>-</Text>
                </TouchableOpacity>
                
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1F2937' }}>{item.quantity}</Text>
                
                <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} disabled={isPending}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', paddingHorizontal: 6 }}>+</Text>
                </TouchableOpacity>
            </View>
         </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F4F1EA]">
      {/* GLOBAL SCREEN BLEED OVERLAY (Phase UI.8 - Fixed for Android) */}
      <View 
        style={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          left: 0, 
          right: 0, 
          backgroundColor: `rgba(153, 27, 27, ${screenRedOpacity})`
        }} 
      />

      {/* 1. MAIN CONTENT AREA */}
      <View className="flex-1 px-8 pt-5">
        <View className="flex-row justify-between items-center pb-2 border-b border-gray-200">
           <Text className="text-[#1F2937] text-3xl font-black tracking-tighter">Command Center</Text>
           <TouchableOpacity 
             onPress={() => {
                const { Alert } = require('react-native');
                Alert.alert(
                  "Clear Cart",
                  "Remove all items from your tracker?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", style: "destructive", onPress: clearCart }
                  ]
                );
             }}
             className="w-12 h-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100"
           >
             <Feather name="trash-2" size={24} color="#EF4444" />
           </TouchableOpacity>
        </View>

        {/* BUDGET SECTION WRAPPER (Phase 15.2: Pull & Lock) */}
        <View style={{ marginTop: -12, marginBottom: 20 }}>
           {/* BUDGET PROGRESS (Restored) */}
           <View className="mt-2">
              <View className="flex-row justify-between items-end mb-3">
                 <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Budget Progress</Text>
                 <Text className="text-[#1F2937] font-black text-sm">{Math.round(percentage)}%</Text>
              </View>
              <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
                 <View 
                   style={{ 
                     width: `${Math.min(percentage, 100)}%`, 
                     backgroundColor: progressColor,
                     height: '100%'
                   }} 
                 />
              </View>
           </View>
   
           {/* BUDGET STATUS CARDS */}
           <View className="flex-row space-x-4 mt-4">
              {/* Card 1: Budget Limit (Phase 14.3: Clickable) */}
              <TouchableOpacity 
                onPress={() => {
                  setTempBudgetInput(budget.toString());
                  setIsBudgetModalVisible(true);
                }}
                activeOpacity={0.7}
                className="flex-1 p-6 rounded-[32px] shadow-sm border border-gray-100"
                style={{ backgroundColor: overagePercent > 0 ? `rgba(239, 68, 68, ${cardRedOpacity})` : '#FFFFFF' }}
              >
                 <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Budget Limit</Text>
                    <Feather name="edit-2" size={10} color="#9CA3AF" />
                 </View>
                 <Text className={`text-2xl font-black ${currentTotal > budget ? 'text-rose-600' : 'text-[#1F2937]'}`}>
                   ₹{budget}
                 </Text>
              </TouchableOpacity>
   
              {/* Card 2: Spent */}
              <View 
                className="flex-1 p-6 rounded-[32px] shadow-sm border border-gray-100"
                style={{ backgroundColor: overagePercent > 0 ? `rgba(239, 68, 68, ${cardRedOpacity})` : '#FFFFFF' }}
              >
                 <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2">Spent</Text>
                 <Text className="text-2xl font-black text-[#14532D]">₹{currentTotal}</Text>
              </View>
           </View>
   
           {/* BUDGET EXCEEDED WARNING */}
           {currentTotal > budget && (
             <View className="flex-row items-center mt-4 ml-2">
                <Feather name="alert-triangle" size={14} color="#E11D48" />
                <Text className="text-[#E11D48] font-black text-[10px] uppercase tracking-widest ml-2">
                  Budget Exceeded
                </Text>
             </View>
           )}
        </View>

        {/* WHATSAPP IMPORT BUTTON */}
        <TouchableOpacity 
          onPress={() => setIsImportModalVisible(true)}
          activeOpacity={0.8}
          className="mt-8 bg-[#14532D] flex-row items-center justify-center py-5 rounded-[24px] shadow-lg shadow-emerald-900/20"
        >
          <FontAwesome name="whatsapp" size={20} color="#FFFFFF" />
          <Text className="text-white font-black ml-3 text-lg uppercase tracking-tight">Import from WhatsApp</Text>
        </TouchableOpacity>

        {/* ITEMS SECTION */}
        <View className="mt-10 flex-1">
           <Text className="text-[#1F2937] text-xl font-black mb-6">Items ({cartItems.length})</Text>
           
           <View style={{ minHeight: 180 }}>
             <FlatList
               data={cartItems}
               renderItem={renderItem}
               keyExtractor={item => item.id}
               horizontal
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={{ paddingBottom: 100 }}
               ListEmptyComponent={
                 <View className="bg-white rounded-[32px] p-8 items-center justify-center border-2 border-dashed border-gray-200 w-[240px]">
                   <Feather name="shopping-bag" size={40} color="#E5E7EB" />
                   <Text className="text-gray-400 font-bold mt-4 text-center">No items added yet.</Text>
                 </View>
               }
             />
           </View>
        </View>
      </View>

      {/* 2. FIXED FOOTER (Phase UI.6 - Shrinked) */}
      <View 
        className="bg-white border-t border-gray-100 flex-row space-x-4 shadow-2xl"
        style={{ paddingVertical: 8, paddingHorizontal: 16 }}
      >
         {/* Left Button: Total Bachat (Reduced ID for Overlap Fix) */}
         <View className="flex-[1.5] bg-[#14532D] flex-row items-center justify-between px-6 py-3 rounded-[28px] shadow-sm">
            <View>
               <Text className="text-emerald-100 font-black text-[9px] uppercase tracking-widest">Total Bachat</Text>
               <Text className="text-lg font-black text-white">₹{totalBachat}</Text>
            </View>
            <Feather name="trending-down" size={10} color="#10B981" />
         </View>

         {/* Right Button: Scanner */}
         <TouchableOpacity 
           onPress={() => navigation.navigate('Scanner')}
           activeOpacity={0.8}
           className="flex-1 bg-[#14532D] flex-row items-center justify-center rounded-[28px] shadow-sm px-4 py-3"
         >
            <Feather name="camera" size={16} color="#FFFFFF" />
            <Text className="text-white font-black ml-2 uppercase text-[10px] tracking-widest">Scan</Text>
         </TouchableOpacity>
      </View>

      {/* IMPORT MODAL (Phase 13.2) */}
      <Modal visible={isImportModalVisible} transparent={true} animationType="slide">
         <View className="flex-1 bg-black/50 items-center justify-center px-6">
            <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
               <Text className="text-[#1F2937] text-2xl font-black mb-2">Paste WhatsApp List</Text>
               <Text className="text-gray-500 font-bold mb-6 text-xs uppercase tracking-widest">Separate items by commas or new lines</Text>
               
               <TextInput
                 multiline
                 numberOfLines={6}
                 value={whatsappText}
                 onChangeText={setWhatsappText}
                 placeholder="e.g., 2x Milk, Bread, 3 Eggs"
                 className="bg-gray-50 rounded-[24px] p-6 text-[#1F2937] font-bold text-lg border border-gray-100 h-40"
                 textAlignVertical="top"
               />

               <View className="flex-row space-x-4 mt-8">
                  <TouchableOpacity 
                    onPress={() => {
                       setIsImportModalVisible(false);
                       setWhatsappText('');
                    }}
                    className="flex-1 py-5 rounded-[24px] bg-gray-100 items-center"
                  >
                     <Text className="text-gray-600 font-black uppercase text-xs tracking-widest">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleImport}
                    className="flex-1 py-5 rounded-[24px] bg-[#14532D] items-center"
                  >
                     <Text className="text-white font-black uppercase text-xs tracking-widest">Import</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

      {/* BUDGET MODAL (Phase 14.3) */}
      <Modal visible={isBudgetModalVisible} transparent={true} animationType="slide">
         <View className="flex-1 bg-black/50 items-center justify-center px-6">
            <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
               <Text className="text-[#1F2937] text-2xl font-black mb-2">Edit Budget</Text>
               <Text className="text-gray-500 font-bold mb-6 text-xs uppercase tracking-widest">Set your target spending limit</Text>
               
               <TextInput
                 keyboardType="numeric"
                 autoFocus
                 value={tempBudgetInput}
                 onChangeText={setTempBudgetInput}
                 placeholder="₹ 5000"
                 className="bg-gray-50 rounded-[24px] p-6 text-[#1F2937] font-black text-3xl border border-gray-100 mb-8"
               />

               <View className="flex-row space-x-4">
                  <TouchableOpacity 
                    onPress={() => setIsBudgetModalVisible(false)}
                    className="flex-1 py-5 rounded-[24px] bg-gray-100 items-center"
                  >
                     <Text className="text-gray-600 font-black uppercase text-xs tracking-widest">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleUpdateBudget}
                    className="flex-1 py-5 rounded-[24px] bg-[#14532D] items-center"
                  >
                     <Text className="text-white font-black uppercase text-xs tracking-widest">Save Limit</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
    </View>
  );
}
