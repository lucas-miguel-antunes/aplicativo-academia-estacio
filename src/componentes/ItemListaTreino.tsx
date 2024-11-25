import {Treino} from '../services/GerenciadorDados.ts';
import ItemLista from './ItemLista.tsx';
import {StyleSheet, Text, View} from 'react-native';
import Cores from '../Cores.ts';
import React from 'react';
import PilulaTag from './PilulaTag.tsx';

type ItemListaTreinoProps = {
  treino: Treino;
  elementoDireita?: React.ReactNode;
  onOpen?: () => void;
};

export default function ItemListaTreino(props: ItemListaTreinoProps) {
  const treino = props.treino;
  const gruposMusculares = [
    ...new Set(
      props.treino.listaExercicios.map(it => it.principalGrupoMuscular),
    ),
  ];
  const tempoTotal = treino.listaExercicios
    .map(it => it.duracaoSerie * it.series + it.repousoSeries * (it.series - 1))
    .reduce((a, b) => a + b, 0);

  return (
    <ItemLista
      onClick={() => props.onOpen ? props.onOpen() : {}}
      titulo={treino.nomeTreino}
      elementoIcone={
        <View style={styles.containerLetraTreino}>
          <Text style={styles.letraTreino}>{treino.letraTreino}</Text>
        </View>
      }
      elementoDireita={props.elementoDireita}>
      <View style={styles.tags}>
        <PilulaTag
          texto={`${treino.listaExercicios.length} exercícios`}
          cor={Cores.padrao.primary}></PilulaTag>
        <PilulaTag
          texto={`${Math.ceil(tempoTotal / 60)} minutos`}
          cor={Cores.padrao.primary}></PilulaTag>
      </View>
      <View style={[styles.tags, {marginTop: 8}]}>
        {gruposMusculares.map((grupo, index) => (
          <PilulaTag key={index} texto={grupo} cor={Cores.padrao.secondary}></PilulaTag>
        ))}
      </View>
    </ItemLista>
  );
}
const styles = StyleSheet.create({
  containerLetraTreino: {
    width: 48,
    height: 48,
    margin: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Cores.padrao.primary,
    borderRadius: 32,
  },
  letraTreino: {
    flex: 1,
    textAlign: 'center',
    color: Cores.padrao.text,
    fontSize: 32,
    fontWeight: 'bold',
    color: Cores.padrao.text950,
  },
  tags: {
    flexDirection: 'row',
  },
});
