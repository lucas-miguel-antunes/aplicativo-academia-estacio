import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../../App.tsx';

type Props = StackScreenProps<RootStackParamList, 'CadastroTipoTreino'>;

export default function CadastroTipoTreino(props: Props): React.JSX.Element {
  return (
    <SafeAreaView>
      <Text>CadastroTipoTreino</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
});
