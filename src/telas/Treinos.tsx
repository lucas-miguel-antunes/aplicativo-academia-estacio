import {
  FlatList,
  Pressable,
  RefreshControl,
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
import Icon from 'react-native-vector-icons/FontAwesome';

type ListagemTipoTreino = Treino;

type Props = CompositeScreenProps<
  BottomTabScreenProps<TiposTelasPrincipal, 'Treinos'>,
  StackScreenProps<RootStackParamList>
>;

export default function Treinos({navigation}: Props) {
  let [treinos, setTreinos] = useState<Treino[]>();
  let [refreshing, setRefreshing] = useState<boolean>(false);
  let [editing, setEditing] = useState<boolean>(false);

  function carregarTreinos() {
    setRefreshing(true);
    new GerenciadorDados().carregarTreinos().then(treinos => {
      setTreinos(treinos.treinos);
      setRefreshing(false);
    });
  }

  function deletarTreino(index: number) {
    new GerenciadorDados().deletarTreino(index).then(() => carregarTreinos());
  }

  function editarTreino(index: number) {
    navigation.push('CadastroTipoTreino', {
      editarTreino: index,
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
              <>
                {editing ? (
                  <Button
                    name="Cancelar"
                    onClick={() => setEditing(false)}></Button>
                ) : (
                  <Button
                    name="Editar atividade"
                    onClick={() => setEditing(true)}></Button>
                )}
                <Button
                  name="Adicionar atividade"
                  onClick={() =>
                    navigation.push('CadastroTipoTreino', {})
                  }></Button>
              </>
            ) : (
              <ItemListaTiposTreino
                id={item.index}
                onDelete={() => deletarTreino(item.index)}
                onEdit={() => editarTreino(item.index)}
                editing={editing}
                treino={item.item}></ItemListaTiposTreino>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => carregarTreinos()}
            />
          }></FlatList>
      ) : (
        <Button
          name="Adicionar atividade"
          onClick={() => navigation.push('CadastroTipoTreino', {})}></Button>
      )}
    </SafeAreaView>
  );
}

type ButtonProps = {
  name: string;
  onClick: () => void;
};

function Button(props: ButtonProps) {
  return (
    <Pressable onPress={() => props.onClick()}>
      <View style={[styles.card, styles.novaAtividade]}>
        <Text style={styles.novaAtividadeTexto}>{props.name}</Text>
      </View>
    </Pressable>
  );
}

type ItemListaTiposTreinoProps = {
  editing: boolean;
  treino: ListagemTipoTreino;
  id: number;
  onDelete: () => void;
  onEdit: () => void;
};

function ItemListaTiposTreino(props: ItemListaTiposTreinoProps) {
  const treino = props.treino;
  const editando = props.editing;
  const gruposMusculares = [
    ...new Set(
      props.treino.listaExercicios.map(it => it.principalGrupoMuscular),
    ),
  ];
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
        elementoDireita={
          <View style={styles.chevron}>
            {editando ? (
              <>
                <Icon
                  onPress={() => props.onEdit()}
                  name={'pencil'}
                  size={24}
                  color={Cores.padrao.text}
                />
                <Icon
                  onPress={() => props.onDelete()}
                  name={'trash'}
                  size={24}
                  color={Cores.padrao.text}
                />
              </>
            ) : (
              <Icon
                name={'chevron-right'}
                size={24}
                color={Cores.padrao.text}
              />
            )}
          </View>
        }>
        <View style={styles.tags}>
          <PilulaTag
            texto={`${treino.listaExercicios.length} exercícios`}
            cor={Cores.padrao.primary}></PilulaTag>
          <PilulaTag
            texto={`${Math.ceil(tempoTotal / 60)} minutos`}
            cor={Cores.padrao.primary}></PilulaTag>
        </View>
        <View style={[styles.tags, {marginTop: 8}]}>
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
  chevron: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
