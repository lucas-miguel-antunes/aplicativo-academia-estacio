import {
  Alert,
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
import ItemListaTreino from '../componentes/ItemListaTreino.tsx';

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

  function abrirTreino(index: number) {
    console.log('abrirTreino', index);
    navigation.push('CadastroSessaoTreino', {
      idTreino: index,
      treino: treinos![index],
    });
  }

  useEffect(() => {
    carregarTreinos();
  }, []);

  return (
    <SafeAreaView>
      {treinos ? (
        <FlatList
          data={[{topo: true}, ...treinos, {adicionarAdividade: true}]}
          renderItem={item => {
            if (item.item.topo) {
              return (
                <>
                  <View style={styles.topo}>
                    <Text style={styles.textoTopo}>Acompanhe seus treinos</Text>
                    <Text style={styles.texto}>Cadastre suas rotinas de treino para guardá-las.</Text>
                    <Text style={styles.texto}>Selecione um dos treinos cadastrados abaixo para começar uma sessão de treino acompanhada.</Text>
                  </View>
                  {treinos === undefined || treinos.length === 0 ? (
                    <View style={styles.topo}>
                      <Text style={styles.textoTopo}>
                        Nenhum treino cadastrado
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.topo}>
                      <Text style={styles.textoTopo}>Treinos cadastrados</Text>
                    </View>
                  )}
                </>
              );
            }
            if (item.item.adicionarAdividade) {
              return (
                <>
                  {treinos !== undefined &&
                    treinos.length > 0 &&
                    (editing ? (
                      <Button
                        name="Cancelar"
                        onClick={() => setEditing(false)}></Button>
                    ) : (
                      <Button
                        name="Editar os treinos"
                        onClick={() => setEditing(true)}></Button>
                    ))}
                  <Button
                    name="Criar um novo treino"
                    onClick={() =>
                      navigation.push('CadastroTipoTreino', {})
                    }></Button>
                </>
              );
            }
            return (
              <ItemListaTiposTreino
                key={item.index}
                id={item.index - 1}
                onDelete={() => {
                  Alert.alert('Deletar treino?', 'Essa ação é irreversível.', [
                    {
                      text: 'Cancelar',
                      style: 'cancel',
                    },
                    {
                      text: 'Deletar',
                      onPress: () => deletarTreino(item.index - 1),
                    },
                  ]);
                }}
                onEdit={() => editarTreino(item.index - 1)}
                onOpen={() => abrirTreino(item.index - 1)}
                editing={editing}
                treino={item.item}></ItemListaTiposTreino>
            );
          }}
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
  onOpen: () => void;
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
    <ItemListaTreino
      treino={treino}
      onOpen={() => props.onOpen()}
      elementoDireita={
        <View style={styles.chevron}>
          {editando ? (
            <View style={styles.containerIconesEditar}>
              <Icon
                onPress={() => props.onEdit()}
                style={styles.iconesEditar}
                name={'pencil'}
                size={16}
                color={Cores.padrao.background}
              />
              <Icon
                onPress={() => props.onDelete()}
                style={styles.iconesEditar}
                name={'trash'}
                size={16}
                color={Cores.padrao.background}
              />
            </View>
          ) : (
            <Icon name={'chevron-right'} size={24} color={Cores.padrao.text} />
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
        {gruposMusculares.map((grupo, index) => (
          <PilulaTag
            key={index}
            texto={grupo}
            cor={Cores.padrao.secondary}></PilulaTag>
        ))}
      </View>
    </ItemListaTreino>
  );
}

const styles = StyleSheet.create({
  chevron: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerIconesEditar: {
    flexDirection: 'row',
  },
  iconesEditar: {
    marginHorizontal: 8,
    borderRadius: 32,
    width: 32,
    height: 32,
    backgroundColor: Cores.padrao.secondary,
    textAlign: 'center',
    verticalAlign: 'middle',
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
  topo: {
    marginVertical: 8,
  },
  textoTopo: {
    color: Cores.padrao.secondary,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  texto: {
    color: Cores.padrao.text,
    fontSize: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
});
