import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { getProductMemory, saveProductMemory } from '../store/storage';
import { useCart } from '../store/CartContext';
import { calculateItemTotal } from '../utils/pricing';
import { fetchProductByBarcode, ExternalProduct } from '../utils/api';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = 280;

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState('');
  
  // External Product Data Cache for the Modal
  const [modalProduct, setModalProduct] = useState<ExternalProduct | null>(null);

  // Form State (Verification UI)
  const [name, setName] = useState('');
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (isPaused) return;
    
    // Start 2s Debounce
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2000);

    setScanned(true);
    setCurrentBarcode(data);
    setPriceError(''); // Clear previous error
    
    // 1. Check Memory Engine (Local Cache)
    const memory = await getProductMemory(data);
    if (memory) {
      setName(memory.name);
      setMrp(memory.mrp.toString());
      setPrice(memory.lastSellingPrice.toString());
      setModalProduct({
        name: memory.name,
        brand: '',
        source: 'Local Memory',
        found: true,
        barcode: data,
        image: ''
      });
      setShowSheet(true);
      return;
    }

    // 2. Not in Memory -> Fetch from Global API
    setLoading(true);
    try {
      const external = await fetchProductByBarcode(data);
      if (external && external.found) {
        setModalProduct(external);
        setName(external.name);
        setMrp('');
        setPrice('');
        setShowSheet(true);
      } else {
        // 3. Not found anywhere -> Empty Manual Entry flow
        setModalProduct(null);
        setName('');
        setMrp('');
        setPrice('');
        setShowSheet(true);
      }
    } catch (e) {
      setModalProduct(null);
      setShowSheet(true); // Fallback to manual on error
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async () => {
    const numPrice = parseFloat(price) || 0;
    const numMrp = parseFloat(mrp) || 0;

    if(!name || !mrp || !price) {
      Alert.alert("Missing Info", "Please enter product name, MRP, and Today's Price.");
      return;
    }
    
    if (isNaN(numMrp) || isNaN(numPrice)) {
      Alert.alert("Invalid Price", "Please enter valid numbers for MRP and Price.");
      return;
    }

    if (numPrice > numMrp) {
      setPriceError("Today's price cannot exceed the MRP.");
      return;
    }

    setPriceError(''); // Clear error if it passes

    // Update Local Memory (MRPs/Prices can change, so we save the latest)
    await saveProductMemory(currentBarcode, {
      barcode: currentBarcode,
      name,
      mrp: numMrp,
      lastSellingPrice: numPrice,
      history: [{ date: new Date().toISOString(), price: numPrice }],
      associatedPromos: []
    });

    const pricing = calculateItemTotal(numMrp, numPrice, 1);
    addToCart({
      id: Math.random().toString(), // Unique ID for each cart entry
      barcode: currentBarcode,
      name,
      mrp: numMrp,
      sellingPrice: numPrice,
      quantity: 1,
      savings: pricing.totalSavings,
      offer: { type: 'none' },
      finalTotal: pricing.finalTotal
    });
    
    resetScanner();
  };

  const resetScanner = () => {
    setShowSheet(false);
    setScanned(false);
    setName(''); setMrp(''); setPrice('');
    setModalProduct(null);
    setPriceError('');
  };

  if (hasPermission === null) return <View className="flex-1 bg-black" />;
  if (hasPermission === false) return <Text className="text-white text-center mt-20">No access to camera</Text>;

  return (
    <View className="flex-1 bg-black">
      <CameraView 
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ 
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"]
        }}
        onBarcodeScanned={scanned || isPaused ? undefined : handleBarCodeScanned}
        zoom={0.1}
        enableTorch={false}
        autofocus="off" // "off" often performs better on Android for batch scanning if zoom is fixed
        responsiveOrientationWhenOrientationLocked={true}
      />
      
      {/* PERFECTLY CENTERED VIEWFINDER */}
      <View style={StyleSheet.absoluteFillObject} className="items-center justify-center">
         <View 
           style={{ width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE }} 
           className="border-2 border-white/30 rounded-[40px] items-center justify-center"
         >
           <View className="w-full h-full border-4 border-emerald-500 rounded-[40px] opacity-80" />
           
           {/* SCAN LINES / CORNERS */}
           <View className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
           <View className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
           <View className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
           <View className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
         </View>
         
         <View className="mt-10 bg-black/60 px-8 py-4 rounded-[24px] border border-white/10 items-center">
           <Text className="text-white font-black text-sm uppercase tracking-[4px]">Align Barcode</Text>
           <Text className="text-gray-400 text-[10px] font-bold mt-1 uppercase">Manual Price Verification Required</Text>
         </View>
      </View>

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-black/70">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="mt-6 text-white font-black text-xl tracking-tighter">Identifying Product...</Text>
        </View>
      )}

      {/* VERIFICATION MODAL (Unified Flow) */}
      <Modal visible={showSheet} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[48px] p-8 shadow-2xl border-t-4 border-blue-500">
            <View className="flex-row justify-between items-start mb-6">
               <View className="flex-1">
                  <Text className="text-3xl font-black text-gray-900 tracking-tighter" numberOfLines={1}>
                    {modalProduct ? 'Verify Price' : 'New Discovery'}
                  </Text>
                  <Text className="text-gray-400 font-bold text-[10px] uppercase mt-1 tracking-widest">Barcode: {currentBarcode}</Text>
               </View>
               <TouchableOpacity onPress={resetScanner} className="bg-gray-100 p-2 rounded-full ml-4">
                  <Feather name="x" size={24} color="#9ca3af" />
               </TouchableOpacity>
            </View>
            
            <View className="mb-6 items-center flex-row bg-gray-50 p-4 rounded-3xl border border-gray-100">
               {modalProduct?.image ? (
                 <Image source={{ uri: modalProduct.image }} className="w-16 h-16 rounded-2xl mr-4" />
               ) : (
                 <View className="w-16 h-16 bg-gray-200 rounded-2xl mr-4 items-center justify-center">
                    <Feather name="box" size={32} color="#9ca3af" />
                 </View>
               )}
               <View className="flex-1">
                 <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product Identity</Text>
                 <TextInput 
                  className="text-lg font-bold text-gray-800 p-0"
                  placeholder="Item Name" 
                  value={name} 
                  onChangeText={setName} 
                />
               </View>
            </View>

            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">MRP (Max Retail Price)</Text>
                <TextInput 
                  className="bg-gray-50 p-5 rounded-2xl text-lg font-bold text-gray-800 border border-gray-100"
                  placeholder="₹ 0.00" 
                  keyboardType="numeric" 
                  value={mrp} 
                  onChangeText={setMrp} 
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Today's Store Price</Text>
                <TextInput 
                  className="bg-emerald-50 p-5 rounded-2xl text-lg font-bold text-emerald-700 border border-emerald-100"
                  placeholder="₹ 0.00" 
                  keyboardType="numeric" 
                  value={price} 
                  onChangeText={setPrice} 
                />
              </View>
            </View>

            {priceError ? (
              <View className="mb-6 items-center flex-row bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <Feather name="alert-circle" size={16} color="#E11D48" />
                <Text className="text-rose-600 font-bold text-xs ml-2">{priceError}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              className="w-full bg-emerald-600 p-6 rounded-[32px] items-center shadow-2xl border-b-4 border-emerald-800"
              activeOpacity={0.8}
              onPress={handleManualAdd}
            >
              <Text className="text-white text-xl font-black uppercase tracking-widest">Verify & Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity className="mt-6 p-2" onPress={resetScanner}>
              <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest text-center">Discard Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fallback styles if Tailwind fails for some absolute pos
});
