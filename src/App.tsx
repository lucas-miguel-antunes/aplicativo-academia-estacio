import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Principal from './Principal.tsx';

const Stack = createStackNavigator();

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Principal" screenOptions={{ headerShown: false }}>
        <Stack.Screen name={"Principal"} component={Principal}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
