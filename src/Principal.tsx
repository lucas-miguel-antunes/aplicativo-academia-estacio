import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Atividades from './Atividades.tsx';
import Competicoes from './Competicoes.tsx';
import Pessoas from './Pessoas.tsx';
import Cores from './Cores.ts';
import {StyleSheet, View} from 'react-native';

const Navegacao = createBottomTabNavigator();

function Principal(): React.JSX.Element {
  return (
    <Navegacao.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: 80,
      },
      tabBarLabelStyle: {
        fontSize: 16,
      },
      tabBarIconStyle: {
        fontSize: 8,
      },
      tabBarActiveTintColor: Cores.padrao.accent600,
      tabBarInactiveTintColor: Cores.padrao.text,
    }}>
      <Navegacao.Screen name={"Atividades"} component={Atividades}></Navegacao.Screen>
      <Navegacao.Screen name={"Competições"} component={Competicoes}></Navegacao.Screen>
      <Navegacao.Screen name={"Pessoas"} component={Pessoas}></Navegacao.Screen>
    </Navegacao.Navigator>
  );
}

export default Principal;
