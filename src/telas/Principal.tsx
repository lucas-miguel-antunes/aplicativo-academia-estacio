import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Treinos from './Treinos.tsx';
import Historico from './Historico.tsx';
import Dados from './Dados.tsx';
import Cores from '../Cores.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App.tsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

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
      tabBarActiveTintColor: Cores.padrao.primary,
      tabBarInactiveTintColor: Cores.padrao.text,
    }}>
      <Navegacao.Screen options={{
        tabBarIcon: ({color}) => (
          <FontAwesome5Icon name="dumbbell" size={24} color={color}></FontAwesome5Icon>
        ),
      }} name={"Treinos"} component={Treinos}></Navegacao.Screen>
      <Navegacao.Screen options={{
        tabBarIcon: ({color}) => (
          <Icon name="history" size={24} color={color}></Icon>
        ),
      }} name={"Histórico"} component={Historico}></Navegacao.Screen>
      <Navegacao.Screen options={{
        tabBarIcon: ({color}) => (
          <Icon name="database" size={24} color={color}></Icon>
        ),
      }} name={"Dados"} component={Dados}></Navegacao.Screen>
    </Navegacao.Navigator>
  );
}

export default Principal;
