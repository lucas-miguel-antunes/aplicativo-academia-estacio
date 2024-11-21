import {
  FlatList,
  Pressable, RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Cores from '../Cores.ts';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {TiposTelasPrincipal} from './Principal.tsx';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../App.tsx';
import ItemLista from '../componentes/ItemLista.tsx';
import PilulaTag from '../componentes/PilulaTag.tsx';
import GerenciadorDados, {Treino} from '../services/GerenciadorDados.ts';

type ListagemTipoTreino = Treino;

type Props = CompositeScreenProps<
  BottomTabScreenProps<TiposTelasPrincipal, 'Treinos'>,
  StackScreenProps<RootStackParamList>
>;

export default function Treinos({navigation}: Props) {
  let [treinos, setTreinos] = useState<Treino[]>();
  let [refreshing, setRefreshing] = useState<boolean>(false);

  function carregarTreinos() {
    setRefreshing(true);
    new GerenciadorDados()
      .carregarTreinos()
      .then(treinos => {
        setTreinos(treinos.treinos);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    carregarTreinos();
  }, []);

  return (
    <SafeAreaView>
      {treinos ? (
        <FlatList
          data={[...treinos, {adicionarAdividade: true}]}
          renderItem={item =>
            item.item.adicionarAdividade ? (
              <NovoCadastroTipoTreino
                onClick={() =>
                  navigation.push('CadastroTipoTreino', {})
                }></NovoCadastroTipoTreino>
            ) : (
              <ItemListaTiposTreino treino={item.item}></ItemListaTiposTreino>
            )
          }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregarTreinos()}/>
        }></FlatList>
      ) : (
        <NovoCadastroTipoTreino
          onClick={() =>
            navigation.push('CadastroTipoTreino', {})
          }></NovoCadastroTipoTreino>
      )}
    </SafeAreaView>
  );
}

type NovoCadastroTipoTreinoProps = {
  onClick: () => void;
};

function NovoCadastroTipoTreino(props: NovoCadastroTipoTreinoProps) {
  return (
    <Pressable onPress={() => props.onClick()}>
      <View style={[styles.card, styles.novaAtividade]}>
        <Text style={styles.novaAtividadeTexto}>Criar novo treino</Text>
      </View>
    </Pressable>
  );
}

function ItemListaTiposTreino(props: {treino: ListagemTipoTreino}) {
  const treino = props.treino;
  const gruposMusculares = [...new Set(props.treino.listaExercicios.map(it => it.principalGrupoMuscular))];
  const tempoTotal = treino.listaExercicios
    .map(it => it.duracaoSerie * it.series + it.repousoSeries * (it.series - 1))
    .reduce((a, b) => a + b, 0);
  return (
    <>
      <ItemLista
        titulo={treino.nomeTreino}
        elementoIcone={
          <View style={styles.containerLetraTreino}>
            <Text style={styles.letraTreino}>{treino.letraTreino}</Text>
          </View>
        }
        chevron={true}>
        <View style={styles.tags}>
          <PilulaTag texto={`${treino.listaExercicios.length} exercícios`} cor={Cores.padrao.primary}></PilulaTag>
          <PilulaTag texto={`${Math.ceil(tempoTotal / 60)} minutos`} cor={Cores.padrao.primary}></PilulaTag>
        </View>
        <View style={styles.tags}>
          {gruposMusculares.map(grupo => (
            <PilulaTag texto={grupo} cor={Cores.padrao.secondary}></PilulaTag>
          ))}
        </View>
      </ItemLista>
      <View style={styles.separator}></View>
    </>
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
  },
  tags: {
    flexDirection: 'row',
  },
  card: {
    margin: 8,
    paddingHorizontal: 8,
  },
  novaAtividade: {
    backgroundColor: Cores.padrao.accent,
    minHeight: 32,
    borderRadius: 32,
  },
  novaAtividadeTexto: {
    color: Cores.padrao.text,
    padding: 8,
    fontSize: 18,
    fontWeight: '900',
  },
  separator: {
    height: 1,
    width: '90%',
    marginHorizontal: '5%',
    backgroundColor: Cores.padrao.background900,
  },
});
