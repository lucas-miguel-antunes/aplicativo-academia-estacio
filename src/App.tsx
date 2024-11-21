import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Principal from './telas/Principal.tsx';
import CadastroTipoTreino from './telas/treinos/CadastroTipoTreino.tsx';
import {NavigationContainer} from '@react-navigation/native';

const Stack = createStackNavigator();

export type RootStackParamList = {
  Principal: {};
  CadastroTipoTreino: {
    editarTreino?: number;
  };
};

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Principal">
        <Stack.Screen options={{headerShown: false}} name={'Principal'} component={Principal}></Stack.Screen>
        <Stack.Screen
          name={'CadastroTipoTreino'}
          component={CadastroTipoTreino}
          options={{ title: 'Cadastro de treino' }}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
