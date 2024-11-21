import React, {PropsWithChildren} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Cores from '../Cores.ts';

type Props = PropsWithChildren<{
  titulo: string;
  elementoIcone?: React.ReactNode;
  chevron?: boolean;
  onClick?: () => void;
}>;

export default function ItemLista(props: Props): React.JSX.Element {
  return (
    <Pressable onPress={() => props.onClick ? props.onClick() : {}}>
      <View style={[styles.card, styles.itemLista]}>
        {props.elementoIcone && props.elementoIcone}
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

        {props.chevron && (
          <View style={styles.chevron}>
            <Text style={styles.textoChevron}>{'>'}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chevron: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoChevron: {
    color: Cores.padrao.text,
    fontSize: 24,
    fontWeight: '900',
  },
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
    fontSize: 16,
  },
});
