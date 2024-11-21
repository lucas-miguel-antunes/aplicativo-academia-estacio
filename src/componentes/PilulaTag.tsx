import React, {PropsWithChildren, ReactElement} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Cores from '../Cores.ts';

type Props = PropsWithChildren<{
  texto: string,
  icone?: ReactElement,
  onClick?: () => void,
  cor: string,
}>;

export default function PilulaTag(props: Props): React.JSX.Element {
  return (
    <Pressable onPress={() => props.onClick ? props.onClick() : {}}>
      <View style={[styles.containerTag, { backgroundColor: props.cor }]}>
        {props.icone}
        <Text style={styles.textoTag}>{props.texto}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  containerTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  textoTag: {
    color: Cores.padrao.text,
    flexWrap: 'wrap',
    fontSize: 12,
    flexShrink: 1,
    flexGrow: 0,
  },
});
