import React, {PropsWithChildren} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Cores from '../Cores.ts';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = PropsWithChildren<{
  titulo: string;
  elementoIcone?: React.ReactNode;
  elementoDireita?: React.ReactNode;
  onClick?: () => void;
}>;

export default function ItemLista(props: Props): React.JSX.Element {
  return (
    <Pressable onPress={() => props.onClick ? props.onClick() : {}}>
      <View style={[styles.card, styles.itemLista]}>
        {props.elementoIcone}
        <View style={styles.containerTituloItemLista}>
          <Text
            style={[
              {flexShrink: 1, fontWeight: 'bold', flexGrow: 1},
              styles.tituloItemLista,
            ]}>
            {props.titulo}
          </Text>
          {props.children}
        </View>

        {props.elementoDireita}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    paddingHorizontal: 8,
  },
  itemLista: {
    flexDirection: 'row',
  },
  containerTituloItemLista: {
    flexDirection: 'column',
    padding: 8,
    flex: 1,
  },
  tituloItemLista: {
    color: Cores.padrao.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
