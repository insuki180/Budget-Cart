import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { getProductMemory, saveProductMemory } from '../store/storage';
import { useCart } from '../store/CartContext';
import { calculateItemTotal } from '../utils/pricing';
import { fetchProductByBarcode, ExternalProduct } from '../utils/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = 280;

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState('');
  
  // External Product Preview
  const [previewProduct, setPreviewProduct] = useState<ExternalProduct | null>(null);

  // Form State (Manual Entry)
  const [name, setName] = useState('');
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  
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
    
    // 1. Check Memory Engine (Local Cache)
    const memory = await getProductMemory(data);
    if (memory) {
      const pricing = calculateItemTotal(memory.mrp, memory.lastSellingPrice, 1);
      addToCart({
        id: Math.random().toString(),
        barcode: data,
        name: memory.name,
        mrp: memory.mrp,
        sellingPrice: memory.lastSellingPrice,
        quantity: 1,
        savings: pricing.totalSavings,
        offer: { type: 'none' },
        finalTotal: pricing.finalTotal
      });
      Alert.alert("Added to Cart!", `${memory.name} was auto-added.`, [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
      return;
    }

    // 2. Not in Memory -> Fetch from Global API (CAPTURE-FIRST)
    setLoading(true);
    try {
      const external = await fetchProductByBarcode(data);
      if (external.found) {
        setPreviewProduct(external);
        setShowPreview(true);
      } else {
        // 3. Not found anywhere -> Forces Manual Entry flow
        setShowSheet(true);
      }
    } catch (e) {
      setShowSheet(true); // Fallback to manual on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddPreviewToCart = () => {
    if (!previewProduct) return;
    setName(previewProduct.name);
    setShowPreview(false);
    setShowSheet(true); // Open sheet to enter Price & MRP
  };

  const handleManualAdd = async () => {
    if(!name || !mrp || !price) return;
    
    const parsedMrp = parseFloat(mrp);
    const parsedPrice = parseFloat(price);
    
    await saveProductMemory(currentBarcode, {
      barcode: currentBarcode,
      name,
      mrp: parsedMrp,
      lastSellingPrice: parsedPrice,
      history: [{ date: new Date().toISOString(), price: parsedPrice }],
      associatedPromos: []
    });

    const pricing = calculateItemTotal(parsedMrp, parsedPrice, 1);
    addToCart({
      id: Math.random().toString(),
      barcode: currentBarcode,
      name,
      mrp: parsedMrp,
      sellingPrice: parsedPrice,
      quantity: 1,
      savings: pricing.totalSavings,
      offer: { type: 'none' },
      finalTotal: pricing.finalTotal
    });
    
    resetScanner();
  };

  const resetScanner = () => {
    setShowSheet(false);
    setShowPreview(false);
    setScanned(false);
    setName(''); setMrp(''); setPrice('');
    setPreviewProduct(null);
  };

  if (hasPermission === null) return <View className="flex-1 bg-black" />;
  if (hasPermission === false) return <Text className="text-white text-center mt-20">No access to camera</Text>;

  return (
    <View className="flex-1 bg-black">
      <CameraView 
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
        onBarcodeScanned={scanned || isPaused ? undefined : handleBarCodeScanned}
        zoom={0}
        enableTorch={false}
        autofocus="on"
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
           <Text className="text-gray-400 text-[10px] font-bold mt-1 uppercase">Automated Price Discovery</Text>
         </View>
      </View>

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-black/70">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="mt-6 text-white font-black text-xl tracking-tighter">Analyzing Product...</Text>
        </View>
      )}

      {/* API PREVIEW MODAL */}
      <Modal visible={showPreview} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[48px] p-8 items-center border-t-4 border-emerald-500 shadow-2xl">
            {previewProduct?.image ? (
              <Image source={{ uri: previewProduct.image }} className="w-40 h-40 rounded-3xl mb-6 shadow-lg" />
            ) : (
              <View className="w-40 h-40 bg-gray-100 rounded-3xl mb-6 items-center justify-center">
                <MaterialCommunityIcons name="package-variant" size={64} color="#d1d5db" />
              </View>
            )}
            <Text className="text-2xl font-black text-gray-900 text-center mb-1 leading-tight">{previewProduct?.name}</Text>
            <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-8">{previewProduct?.brand || 'Unknown Brand'}</Text>

            <TouchableOpacity 
              className="w-full bg-blue-600 p-6 rounded-[32px] items-center shadow-2xl border-b-4 border-blue-800"
              activeOpacity={0.8}
              onPress={handleAddPreviewToCart}
            >
              <Text className="text-white text-xl font-black uppercase tracking-widest">Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity className="mt-6 p-2" onPress={resetScanner}>
              <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest text-center">Discard Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MANUAL ENTRY MODAL */}
      <Modal visible={showSheet} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[48px] p-8 shadow-2xl border-t-4 border-blue-500">
            <View className="flex-row justify-between items-start mb-6">
               <View>
                  <Text className="text-3xl font-black text-gray-900 tracking-tighter">
                    {previewProduct ? 'Price Tag' : 'New Discovery'}
                  </Text>
                  <Text className="text-gray-400 font-bold text-[10px] uppercase mt-1 tracking-widest">Barcode: {currentBarcode}</Text>
               </View>
               <TouchableOpacity onPress={resetScanner} className="bg-gray-100 p-2 rounded-full">
                  <MaterialCommunityIcons name="close" size={24} color="#9ca3af" />
               </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View>
                 <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Identity</Text>
                 <TextInput 
                  className="bg-gray-50 p-5 rounded-2xl text-lg font-bold text-gray-800 border border-gray-100"
                  placeholder="Enter Item Name" 
                  value={name} 
                  onChangeText={setName} 
                />
              </View>

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">MRP Total</Text>
                  <TextInput 
                    className="bg-gray-50 p-5 rounded-2xl text-lg font-bold text-gray-800 border border-gray-100"
                    placeholder="₹ 0.00" 
                    keyboardType="numeric" 
                    value={mrp} 
                    onChangeText={setMrp} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Today's Price</Text>
                  <TextInput 
                    className="bg-gray-50 p-5 rounded-2xl text-lg font-bold text-gray-800 border border-gray-100"
                    placeholder="₹ 0.00" 
                    keyboardType="numeric" 
                    value={price} 
                    onChangeText={setPrice} 
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              className="w-full bg-emerald-600 p-6 rounded-[32px] items-center shadow-2xl mt-12 border-b-4 border-emerald-800"
              activeOpacity={0.8}
              onPress={handleManualAdd}
            >
              <Text className="text-white text-xl font-black uppercase tracking-widest">Verify & Add</Text>
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
