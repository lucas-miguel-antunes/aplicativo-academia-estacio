import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import React from 'react';
import Cores from '../Cores.ts';

type SelecionadorNumeroProps = {
  valor: number;
  suffix?: string;
  prefix?: string;
  onChange: (novoValor: number) => void;
  incrementos?: number[];
};

export function SelecionadorNumero(props: SelecionadorNumeroProps) {
  let incrementos = props.incrementos || [1];
  return (
    <View style={styles.selecionadorValor}>
      {[...incrementos].reverse().map((incremento, index) => (
        <Pressable
          key={index}
          style={styles.botaoNumeroSeries}
          onPress={() => props.onChange(props.valor - incremento)}>
          <Text style={styles.botaoNumeroSeriesTexto}>
            {incremento > 1 ? `-${incremento}` : '-'}
          </Text>
        </Pressable>
      ))}
      <View style={styles.parteCentral}>
        {props.prefix && (
          <Text style={styles.textoCentralizado}>{props.prefix}</Text>
        )}
        <TextInput
          placeholderTextColor={Cores.padrao.text300}
          onChangeText={novoValor => {
            const novoValorInt = parseInt(novoValor, 10);
            if (isFinite(novoValorInt) && novoValor.length > 0) {
              props.onChange(novoValorInt);
            }
          }}
          keyboardType={'numeric'}
          value={props.valor.toString()}
          style={styles.textoCentralizado}
        />
        {props.suffix && (
          <Text style={styles.textoCentralizado}>{props.suffix}</Text>
        )}
      </View>
      {incrementos.map((incremento, index) => (
        <Pressable
          key={index}
          style={styles.botaoNumeroSeries}
          onPress={() => props.onChange(props.valor + incremento)}>
          <Text style={styles.botaoNumeroSeriesTexto}>
            {incremento > 1 ? `+${incremento}` : '+'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  selecionadorValor: {
    flexDirection: 'row',
    verticalAlign: 'middle',
    flex: 1,
    justifyContent: 'space-around',
  },
  botaoNumeroSeries: {
    width: 32,
    height: 32,
    margin: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Cores.padrao.secondary,
    borderRadius: 32,
  },
  botaoNumeroSeriesTexto: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: Cores.padrao.background,
    verticalAlign: 'middle',
    borderWidth: 1,
    borderRadius: 32,
    borderColor: Cores.padrao.text950,
    color: Cores.padrao.text,
  },
  parteCentral: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCentralizado: {
    color: Cores.padrao.text,
    height: 48,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    verticalAlign: 'middle',
  },
});
