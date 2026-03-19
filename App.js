// App.js
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CartProvider } from './src/store/CartContext';
import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarHideOnKeyboard: true,
              tabBarActiveTintColor: '#14532D',
            }}
          >
             <Tab.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{
                headerShown: false,
                title: 'Command Center',
                tabBarIcon: ({color, size}) => <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
              }}
            />
            <Tab.Screen 
              name="Scanner" 
              component={ScannerScreen} 
              options={{
                headerShown: false,
                tabBarIcon: ({color, size}) => <MaterialCommunityIcons name="barcode-scan" size={size} color={color} />
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}
