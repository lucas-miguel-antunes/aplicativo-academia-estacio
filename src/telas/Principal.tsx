import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Treinos from './Treinos.tsx';
import Historico from './Historico.tsx';
import Dados from './Dados.tsx';
import Cores from '../Cores.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App.tsx';

const Navegacao = createBottomTabNavigator();

export type TiposTelasPrincipal = {
  Treinos: {},
  Historico: {},
  Dados: {},
}

type Props = NativeStackScreenProps<RootStackParamList, "Principal">;

function Principal(props: Props): React.JSX.Element {
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
      <Navegacao.Screen name={"Treinos"} component={Treinos}></Navegacao.Screen>
      <Navegacao.Screen name={"Histórico"} component={Historico}></Navegacao.Screen>
      <Navegacao.Screen name={"Dados"} component={Dados}></Navegacao.Screen>
    </Navegacao.Navigator>
  );
}

export default Principal;
