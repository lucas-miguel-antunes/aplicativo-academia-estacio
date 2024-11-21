import React, {useEffect, useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {RootStackParamList} from '../../App.tsx';
import Cores from '../../Cores.ts';
import PilulaTag from '../../componentes/PilulaTag.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import GerenciadorDados, {
  ExercicioTreino,
  GrupoMuscular,
} from '../../services/GerenciadorDados.ts';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = NativeStackScreenProps<RootStackParamList, 'CadastroTipoTreino'>;
type ListagemExercicio = ExercicioTreino;

export default function CadastroTipoTreino(props: Props): React.JSX.Element {
  const editarTreino = props.route.params?.editarTreino;
  const [titulo, setTitulo] = useState('');
  const [letraEscolhida, setLetraEscolhida] = useState('A');
  const [listaExercicios, setListaExercicios] = useState<ListagemExercicio[]>(
    [],
  );
  const tempoAtual = listaExercicios
    .map(it => it.duracaoSerie * it.series + it.repousoSeries * (it.series - 1))
    .reduce((a, b) => a + b, 0);
  const gerenciadorDados = new GerenciadorDados();

  useEffect(() => {
      if (editarTreino !== undefined) {
        gerenciadorDados.carregarTreinos().then(treinos => {
          const treino = treinos.treinos[editarTreino]!;
          console.log("Editar treino " + editarTreino + ": ", treino);
          setTitulo(treino.nomeTreino);
          setLetraEscolhida(treino.letraTreino);
          setListaExercicios(treino.listaExercicios);
        });
      }
  }, []);

  function adicionarExercicio() {
    setListaExercicios([
      ...listaExercicios,
      {
        nomeExercicio: '',
        duracaoSerie: 30,
        repousoSeries: 60,
        series: 3,
        minRepeticoes: 10,
        maxRepeticoes: 12,
        principalGrupoMuscular: GrupoMuscular.Pernas,
      },
    ]);
  }

  function alterarExercicio(indice: number, novoValor: ListagemExercicio) {
    setListaExercicios(
      listaExercicios.map((item, index) => {
        if (index === indice) return novoValor;
        else return item;
      }),
    );
  }

  function removerExercicio(indice: number) {
    setListaExercicios(
      listaExercicios.filter((item, index) => {
        return index !== indice;
      }),
    );
  }

  function reordenarExercicios(indiceAntigo: number, indiceNovo: number) {
    if (indiceNovo < 0 || indiceNovo >= listaExercicios.length) {
      return;
    }
    const novoArray = [...listaExercicios];
    const [elemento] = novoArray.splice(indiceAntigo, 1);
    novoArray.splice(indiceNovo, 0, elemento);
    setListaExercicios(novoArray);
  }

  async function salvarTreino() {
    console.log('salvarTreino()');
    const treino = {
      nomeTreino: titulo,
      letraTreino: letraEscolhida,
      listaExercicios: listaExercicios,
    };
    if (editarTreino !== undefined) {
      await gerenciadorDados.editarTreino(editarTreino, treino);
    } else {
      await gerenciadorDados.adicionarTreino(treino);
    }

    props.navigation.goBack();
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <View style={[styles.card, {marginHorizontal: 0, flexWrap: 'wrap'}]}>
            <View style={styles.tags}>
              {[
                {
                  texto: `${listaExercicios.length} exercícios`,
                  cor: Cores.padrao.primary,
                },
                {
                  texto: `${Math.ceil(tempoAtual / 60)} minutos`,
                  cor: Cores.padrao.primary,
                },
                ...[
                  ...new Set(
                    listaExercicios.map(it => it.principalGrupoMuscular),
                  ),
                ].map(grupo => {
                  return {
                    texto: grupo,
                    cor: Cores.padrao.secondary,
                  };
                }),
              ].map(item => {
                return <PilulaTag texto={item.texto} cor={item.cor} />;
              })}
            </View>
          </View>

          <Text style={styles.textHeader}>Letra do Treino</Text>
          <Text style={styles.subtext}>
            Você pode decidir uma letra para cada treino, usando o sistema que
            quiser para classificar a letra.
          </Text>
          <View style={styles.escolhaLetras}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map(letra => {
              const letraAtualEscolhida = letra === letraEscolhida;
              return (
                <Pressable onPress={() => setLetraEscolhida(letra)}>
                  <View
                    style={[
                      styles.opcaoLetraContainer,
                      {
                        backgroundColor: letraAtualEscolhida
                          ? Cores.padrao.primary
                          : Cores.padrao.secondary,
                      },
                    ]}>
                    <Text style={styles.letraTreino}>{letra}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.textHeader}>Nome do treino</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={Cores.padrao.text300}
            placeholder={'Dê um nome para esse treino'}
            onChangeText={setTitulo}
            value={titulo}
          />

          <Text style={styles.textHeader}>Exercícios</Text>
          {listaExercicios.map((exercicio, index) => {
            return (
              <ListagemExercicioComponente
                index={index}
                key={index}
                exercicio={exercicio}
                onEdit={novoExercicio => alterarExercicio(index, novoExercicio)}
                onRemove={() => removerExercicio(index)}
                onReorder={novoIndex => reordenarExercicios(index, novoIndex)}
              />
            );
          })}
          <Button
            onClick={() => adicionarExercicio()}
            texto="Adicionar exercício"></Button>
          {listaExercicios.length > 0 && (
            <Button
              onClick={() => salvarTreino()}
              texto="Salvar treino"></Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ListagemExercicioProps = {
  index: number;
  exercicio: ListagemExercicio;
  onEdit: (novo: ListagemExercicio) => void;
  onRemove: () => void;
  onReorder: (novoIndex: number) => void;
};

function ListagemExercicioComponente(props: ListagemExercicioProps) {
  const exercicio = props.exercicio;
  return (
    <View style={styles.card}>
      <View style={styles.cabecalhoExercicio}>
        <Text style={styles.textBoldHeader}>Exercício {props.index + 1}</Text>
        <View style={styles.cabecalhoExercicioIcones}>
          {
            props.index > 0 && <Pressable onPress={() => props.onReorder(props.index - 1)}>
              <Icon style={{marginHorizontal: 4}} name={'arrow-up'} size={24} color={Cores.padrao.text} />
            </Pressable>
          }
          <Pressable onPress={() => props.onReorder(props.index + 1)}>
            <Icon style={{marginHorizontal: 4}} name={'arrow-down'} size={24} color={Cores.padrao.text} />
          </Pressable>
          <Pressable onPress={() => props.onRemove()}>
            <Icon style={{marginHorizontal: 4}} name={'trash'} size={24} color={Cores.padrao.primary400} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.textHeader}>Nome do exercício</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={Cores.padrao.text300}
        placeholder={'Informe o nome do exercício'}
        onChangeText={novoNome =>
          props.onEdit({...exercicio, nomeExercicio: novoNome})
        }
        value={exercicio.nomeExercicio}
      />

      <Text style={styles.textHeader}>Séries</Text>
      <View style={styles.dadosSeries}>
        <View style={styles.dadosSeriesTituloComponente}>
          <Text style={styles.textHeader}>Quantidade</Text>
          <SelecionadorNumero
            valor={exercicio.series}
            onChange={novoNumero =>
              props.onEdit({...exercicio, series: novoNumero})
            }></SelecionadorNumero>
        </View>
        <View style={styles.dadosSeriesTituloComponente}>
          <Text style={styles.textHeader}>Duração exec.</Text>
          <TextInput
            style={styles.input}
            onChangeText={novoNumero => {
              let novoNumeroInt = parseInt(novoNumero, 10);
              if (novoNumeroInt <= 0 || isNaN(novoNumeroInt)) {
                novoNumeroInt = 30;
              }
              props.onEdit({...exercicio, duracaoSerie: novoNumeroInt});
            }}
            placeholder={exercicio.duracaoSerie.toString()}
            placeholderTextColor={Cores.padrao.text}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.dadosSeriesTituloComponente}>
          <Text style={styles.textHeader}>Descanso</Text>
          <TextInput
            style={styles.input}
            onChangeText={novoNumero => {
              let novoNumeroInt = parseInt(novoNumero, 10);
              if (novoNumeroInt <= 0 || isNaN(novoNumeroInt)) {
                novoNumeroInt = 60;
              }
              props.onEdit({...exercicio, repousoSeries: novoNumeroInt});
            }}
            placeholder={exercicio.repousoSeries.toString()}
            placeholderTextColor={Cores.padrao.text}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.textHeader}>Repetições</Text>
      <View style={styles.dadosSeries}>
        <View style={styles.dadosSeriesTituloComponente}>
          <Text style={styles.textHeader}>Mínimo</Text>
          <SelecionadorNumero
            valor={exercicio.minRepeticoes}
            onChange={novoNumero => {
              if (novoNumero <= exercicio.maxRepeticoes && novoNumero > 0) {
                props.onEdit({...exercicio, minRepeticoes: novoNumero});
              }
            }}></SelecionadorNumero>
        </View>
        <View style={styles.dadosSeriesTituloComponente}>
          <Text style={styles.textHeader}>Máximo</Text>
          <SelecionadorNumero
            valor={exercicio.maxRepeticoes}
            onChange={novoNumero => {
              if (novoNumero >= exercicio.minRepeticoes && novoNumero > 0) {
                props.onEdit({...exercicio, maxRepeticoes: novoNumero});
              }
            }}></SelecionadorNumero>
        </View>
      </View>

      <Text style={styles.textHeader}>Principal grupo muscular</Text>
      <ScrollView horizontal={true} style={styles.tagsWrapper}>
        <View style={styles.tags}>
          {Object.keys(GrupoMuscular).map(grupo => {
            return (
              <PilulaTag
                texto={grupo}
                cor={
                  exercicio.principalGrupoMuscular === grupo
                    ? Cores.padrao.primary
                    : Cores.padrao.secondary
                }
                onClick={() =>
                  props.onEdit({
                    ...exercicio,
                    principalGrupoMuscular: grupo as GrupoMuscular,
                  })
                }></PilulaTag>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

type SelecionadorNumeroProps = {
  valor: number;
  onChange: (novoValor: number) => void;
};

function SelecionadorNumero(props: SelecionadorNumeroProps) {
  return (
    <View style={styles.selecionadorValor}>
      <Pressable
        style={styles.botaoNumeroSeries}
        onPress={() => props.onChange(props.valor - 1)}>
        <Text style={styles.botaoNumeroSeriesTexto}>-</Text>
      </Pressable>
      <Text style={styles.textoCentralizado}>{props.valor}</Text>
      <Pressable
        style={styles.botaoNumeroSeries}
        onPress={() => props.onChange(props.valor + 1)}>
        <Text style={styles.botaoNumeroSeriesTexto}>+</Text>
      </Pressable>
    </View>
  );
}

type ButtonProps = {
  texto: string;
  onClick: () => void;
};

function Button(props: ButtonProps) {
  return (
    <Pressable onPress={() => props.onClick()}>
      <View style={[styles.btn]}>
        <Text style={styles.novoExercicioTexto}>{props.texto}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tagsWrapper: {
    marginTop: 8,
    marginHorizontal: 0,
    flexWrap: 'wrap',
  },
  tags: {
    flexDirection: 'row',
    flex: 1,
  },
  cabecalhoExercicioIcones: {
    flexDirection: 'row',
  },
  cabecalhoExercicioIcone: {
    color: Cores.padrao.text900,
    margin: 4,
    fontWeight: 'bold',
    width: 24,
    height: 24,
    verticalAlign: 'middle',
    textAlign: 'center',
    borderRadius: 16,
  },
  cabecalhoExercicio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selecionadorValor: {
    flexDirection: 'row',
    verticalAlign: 'middle',
    flex: 1,
    justifyContent: 'space-around',
  },
  botaoNumeroSeries: {
    width: 32,
    height: 32,
    margin: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Cores.padrao.secondary,
    borderRadius: 32,
  },
  botaoNumeroSeriesTexto: {
    flex: 1,
    textAlign: 'center',
    color: Cores.padrao.text950,
    fontSize: 24,
    fontWeight: 'bold',
  },
  textoCentralizado: {
    height: 48,
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  dadosSeries: {
    flexDirection: 'row',
  },
  dadosSeriesTituloComponente: {
    flexDirection: 'column',
    flex: 1,
  },
  card: {
    margin: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Cores.padrao.background,
    borderRadius: 16,
  },
  btn: {
    margin: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    height: 40,
    borderRadius: 32,
    backgroundColor: Cores.padrao.accent,
  },
  novoExercicio: {
    backgroundColor: Cores.padrao.accent,
    height: 40,
    borderRadius: 32,
  },
  novoExercicioTexto: {
    color: Cores.padrao.text,
    padding: 8,
    fontSize: 20,
    fontWeight: '900',
  },
  opcaoLetraContainer: {
    width: 48,
    height: 48,
    marginRight: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    alignSelf: 'flex-start',
  },
  letraTreino: {
    flex: 1,
    textAlign: 'center',
    verticalAlign: 'middle',
    color: Cores.padrao.text950,
    fontSize: 32,
    fontWeight: 'bold',
  },
  escolhaLetras: {
    margin: 8,
    flexDirection: 'row',
  },
  textHeader: {
    color: Cores.padrao.text,
  },
  textBoldHeader: {
    color: Cores.padrao.text,
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
  },
  subtext: {
    color: Cores.padrao.text300,
  },
  container: {
    margin: 16,
    flexDirection: 'column',
  },
  input: {
    color: Cores.padrao.text,
    margin: 8,
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 16,
    borderColor: Cores.padrao.background300,
    flex: 1,
  },
});
