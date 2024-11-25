import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Principal from './telas/Principal.tsx';
import CadastroTipoTreino from './telas/treinos/CadastroTipoTreino.tsx';
import {NavigationContainer} from '@react-navigation/native';
import CadastroSessaoTreino from './telas/treinos/CadastroSessaoTreino.tsx';
import {Treino} from './services/GerenciadorDados.ts';

const Stack = createStackNavigator();

export type RootStackParamList = {
  Principal: {};
  CadastroSessaoTreino: {
    treino: Treino;
    idTreino: number;
  };
  CadastroTipoTreino: {
    editarTreino?: number;
  };
};

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Principal">
        <Stack.Screen
          options={{headerShown: false}}
          name={'Principal'}
          component={Principal}></Stack.Screen>
        <Stack.Screen
          name={'CadastroTipoTreino'}
          component={CadastroTipoTreino}
          options={{title: 'Cadastro de treino'}}></Stack.Screen>
        <Stack.Screen
          name={'CadastroSessaoTreino'}
          component={CadastroSessaoTreino}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
