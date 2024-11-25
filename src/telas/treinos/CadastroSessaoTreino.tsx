import React, {useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../../App.tsx';
import ItemListaTreino from '../../componentes/ItemListaTreino.tsx';
import Cores from '../../Cores.ts';
import GerenciadorDados, {
  ExercicioSessao,
  ExercicioTreino,
  SerieExercicioSessao,
  Treino,
} from '../../services/GerenciadorDados.ts';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import ItemLista from '../../componentes/ItemLista.tsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SelecionadorNumero} from '../../componentes/SelecionadorNumero.tsx';

type Props = StackScreenProps<RootStackParamList, 'CadastroSessaoTreino'>;

enum CadastroExercicioAtualEstado {
  PREPARAR_INICIO_SERIE,
  SERIE,
  REPOUSO,
  REVISAO,
}

type CadastroExercicioAtual = {
  exercicio?: number;
  seriesConsolidadas: SerieExercicioSessao[];
  ultimoTimestamp?: Date;
  estadoAtual: CadastroExercicioAtualEstado;
};

export default function CadastroSessaoTreino(props: Props): React.JSX.Element {
  const {treino, idTreino} = props.route.params;
  let [exercicios, setExercicios] = useState<ExercicioSessao[]>([]);
  let [ultimoExercicio, setUltimoExercicio] = useState<number | undefined>(
    undefined,
  );
  let [cadastroTreinoAtual, setCadastroTreinoAtual] =
    useState<CadastroExercicioAtual>({
      seriesConsolidadas: [],
      estadoAtual: CadastroExercicioAtualEstado.PREPARAR_INICIO_SERIE,
    });
  const gerenciadorDados = new GerenciadorDados();

  function alterarExercicio(exercicio: ExercicioSessao, idExercicio: number) {
    const novosExercicios = [...exercicios];
    novosExercicios[idExercicio] = exercicio;
    setExercicios(novosExercicios);
  }

  const handleBackButtonClick = () => {
    Alert.alert('Sair do treino?', 'Progresso atual será perdido.', [
      {
        text: 'Cancelar',
        onPress: () => {},
      },
      {
        text: 'Sair',
        onPress: () => props.navigation.goBack(),
      },
    ]);

    return true;
  };

  useEffect(() => {
    const eventHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    props.navigation.setOptions({
      title: 'Sessão de treino ' + treino.letraTreino,
      headerLeft: () => <View style={{width: 16}}></View>,
      headerRight: () => (
        <Icon
          name={'close'}
          size={24}
          style={{marginRight: 16}}
          onPress={() => handleBackButtonClick()}
        />
      ),
    });

    return () => eventHandler.remove();
  }, []);

  function terminarExercicioAtual(novoTreinoAtual: CadastroExercicioAtual) {
    setUltimoExercicio(cadastroTreinoAtual.exercicio);
    setCadastroTreinoAtual(novoTreinoAtual);
    setExercicios([
      ...exercicios,
      {
        exercicio: cadastroTreinoAtual.exercicio!,
        series: cadastroTreinoAtual.seriesConsolidadas,
      },
    ]);
  }

  function finalizarTreino() {
    Alert.alert(
      'Finalizar treino?',
      'Você não vai poder mais alterar os dados.',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
        },
        {
          text: 'Finalizar',
          onPress: async () => {
            await gerenciadorDados.cadastrarSessaoTreino({
              data: new Date(),
              treino: idTreino,
              exercicios,
            });
            props.navigation.goBack();
          },
        },
      ],
    );
  }

  function trocarTreino(index: number) {
    if (cadastroTreinoAtual.exercicio === index) {
      return;
    }
    if (
      cadastroTreinoAtual.exercicio !== undefined &&
      cadastroTreinoAtual.estadoAtual !==
      CadastroExercicioAtualEstado.PREPARAR_INICIO_SERIE
    ) {
      Alert.alert(
        'Trocar de exercício?',
        'Isso vai finalizar o exercício atual.',
        [
          {
            text: 'Cancelar',
            onPress: () => {},
          },
          {
            text: 'Trocar',
            onPress: () =>
              terminarExercicioAtual({
                exercicio: index,
                seriesConsolidadas: [],
                estadoAtual:
                CadastroExercicioAtualEstado.PREPARAR_INICIO_SERIE,
              }),
          },
        ],
      );
    } else {
      setCadastroTreinoAtual({
        exercicio: index,
        seriesConsolidadas: [],
        estadoAtual:
        CadastroExercicioAtualEstado.PREPARAR_INICIO_SERIE,
      });
    }

  }

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
          <ItemListaTreino treino={treino} />

        <BarraProgressoExercicios
          exerciciosFinalizados={exercicios}
          treino={treino}
          exercicioAtual={cadastroTreinoAtual}
        />

        <CadastroExercicioAtualComponent
          treino={treino}
          cadastroTreinoAtual={cadastroTreinoAtual}
          ultimoExercicio={ultimoExercicio}
          onChange={novo => {
            setCadastroTreinoAtual(novo);
          }}
          onFinish={() =>
            terminarExercicioAtual({
              seriesConsolidadas: [],
              estadoAtual: CadastroExercicioAtualEstado.PREPARAR_INICIO_SERIE,
            })
          }
        />

        <View style={styles.divisoriaExercicioAtual}>
          <Text style={styles.textoDivisoriaExercicioAtual}>Exercícios</Text>
        </View>

        {treino.listaExercicios.map((exercicio, index) => {
          return (
            <CardExercicio
              key={index}
              exercicio={exercicio}
              exercicioSessao={exercicios.find(it => it.exercicio === index)}
              onChange={novaSessao => {
                alterarExercicio(novaSessao, index);
              }}
              onClick={() => trocarTreino(index)}
            />
          );
        })}

        <Button nome="Finalizar treino" onPress={() => finalizarTreino()} />
        <View style={styles.espacamento}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Button
type ButtonProps = {
  nome: string;
  onPress: () => void;
  cor?: string;
};

function Button(props: ButtonProps) {
  return (
    <Pressable onPress={props.onPress}>
      <View
        style={[
          styles.button,
          {backgroundColor: props.cor || Cores.padrao.primary},
        ]}>
        <Text style={styles.buttonText}>{props.nome}</Text>
      </View>
    </Pressable>
  );
}

type ItemListaExercicioProps = {
  exercicio: ExercicioTreino;
  onClick?: () => void;
};

function ItemListaExercicio(props: ItemListaExercicioProps) {
  return (
    <ItemLista
      titulo={props.exercicio.nomeExercicio}
      onClick={props.onClick}
      elementoDireita={
        props.onClick ? (
          <View style={styles.chevron}>
            <Icon name={'chevron-right'} size={24} color={Cores.padrao.text} />
          </View>
        ) : (
          <></>
        )
      }
      elementoIcone={
        <View style={styles.containerIconeExercicioAtual}>
          <Icon
            style={{marginLeft: 2}}
            name={'arm-flex'}
            size={32}
            color={Cores.padrao.background}
          />
        </View>
      }>
      <Text style={styles.text}>
        {props.exercicio.series} séries de {props.exercicio.minRepeticoes} a{' '}
        {props.exercicio.maxRepeticoes} repetições
      </Text>
      <Text style={styles.text}>
        Repouso de {props.exercicio.repousoSeries} segundos entre séries
      </Text>
    </ItemLista>
  );
}

type CadastroExercicioAtualComponentProps = {
  treino: Treino;
  cadastroTreinoAtual: CadastroExercicioAtual;
  ultimoExercicio?: number;
  onChange: (cadastroTreinoAtual: CadastroExercicioAtual) => void;
  onFinish: () => void;
};

function CadastroExercicioAtualComponent(
  props: CadastroExercicioAtualComponentProps,
) {
  let numeroExercicioAtual = props.cadastroTreinoAtual.exercicio;
  if (numeroExercicioAtual === undefined) {
    let proximoExercicio =
      props.ultimoExercicio === undefined ? 0 : props.ultimoExercicio + 1;
    if (proximoExercicio >= props.treino.listaExercicios.length) {
      return (
        <View style={[styles.padding16, styles.card]}>
          <Text style={styles.textHeader}>Fim dos exercícios</Text>
          <Text style={styles.text}>
            Revise os dados abaixo e clique em 'Finalizar treino' para concluir.
          </Text>
          <Text style={styles.text}>
            Você ainda pode executar algum dos exercícios que pulou ao clicar
            nele.
          </Text>
        </View>
      );
    }
    numeroExercicioAtual = proximoExercicio;
  }
  const exercicioAtual = props.treino.listaExercicios[numeroExercicioAtual];

  return (
    <View style={[styles.padding16, styles.card]}>
      <Text style={styles.textHeader}>Exercício atual</Text>
      <ItemListaExercicio exercicio={exercicioAtual} />
      <CadastroExercicioAtualActions
        cadastroTreinoAtual={props.cadastroTreinoAtual}
        treino={props.treino}
        onChange={novo =>
          props.onChange({...novo, exercicio: numeroExercicioAtual})
        }
        onFinish={() => props.onFinish()}
      />
    </View>
  );
}

type CadastroExercicioAtualActionsProps = {
  cadastroTreinoAtual: CadastroExercicioAtual;
  treino: Treino;
  onChange: (cadastroTreinoAtual: CadastroExercicioAtual) => void;
  onFinish: () => void;
};

function formatarTempo(segundos: number) {
  return `${Math.floor(segundos / 60)}:${Math.abs(segundos % 60)
    .toString()
    .padStart(2, '0')}`;
}

function calcularTempoSegundos(data: Date) {
  return Math.floor((new Date().getTime() - data.getTime()) / 1000);
}

function CadastroExercicioAtualActions(
  props: CadastroExercicioAtualActionsProps,
) {
  const [tempo, setTempo] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTempo(tempo + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [tempo]);

  switch (props.cadastroTreinoAtual.estadoAtual) {
    case CadastroExercicioAtualEstado.PREPARAR_INICIO_SERIE:
      return (
        <ExercicioAtualPreparar
          onChange={props.onChange}
          onFinish={props.onFinish}
          cadastroTreinoAtual={props.cadastroTreinoAtual}
          treino={props.treino}
        />
      );
    case CadastroExercicioAtualEstado.SERIE:
      return (
        <ExercicioAtualExecucao
          onChange={props.onChange}
          onFinish={props.onFinish}
          cadastroTreinoAtual={props.cadastroTreinoAtual}
          treino={props.treino}
        />
      );
    case CadastroExercicioAtualEstado.REPOUSO:
      return (
        <ExercicioAtualRepouso
          onChange={props.onChange}
          onFinish={props.onFinish}
          cadastroTreinoAtual={props.cadastroTreinoAtual}
          treino={props.treino}
        />
      );
    case CadastroExercicioAtualEstado.REVISAO:
      return (
        <ExercicioAtualRevisao
          onChange={props.onChange}
          onFinish={props.onFinish}
          cadastroTreinoAtual={props.cadastroTreinoAtual}
          treino={props.treino}
        />
      );
  }
}

function ExercicioAtualPreparar({
  onChange,
  cadastroTreinoAtual,
}: CadastroExercicioAtualActionsProps) {
  return (
    <View style={styles.column}>
      <Button
        nome={'Começar série'}
        onPress={() => {
          onChange({
            ...cadastroTreinoAtual,
            estadoAtual: CadastroExercicioAtualEstado.SERIE,
            ultimoTimestamp: new Date(),
          });
        }}
      />
    </View>
  );
}

function ExercicioAtualExecucao({
  onChange,
  cadastroTreinoAtual,
  treino,
}: CadastroExercicioAtualActionsProps) {
  const tempoExecucao = calcularTempoSegundos(
    cadastroTreinoAtual.ultimoTimestamp!,
  );
  return (
    <>
      <Text style={styles.estadoHeader}>Tempo de execução</Text>
      <Text style={styles.stopwatchTimer}>{formatarTempo(tempoExecucao)}</Text>
      <Button
        nome="Terminar execução"
        onPress={() => {
          onChange({
            ...cadastroTreinoAtual,
            seriesConsolidadas: [
              ...cadastroTreinoAtual.seriesConsolidadas,
              {
                peso: cadastroTreinoAtual.seriesConsolidadas[0]?.peso || 1,
                repeticoes:
                  treino.listaExercicios[cadastroTreinoAtual.exercicio]
                    ?.minRepeticoes || 1,
                repouso: 0,
                duracao: calcularTempoSegundos(
                  cadastroTreinoAtual.ultimoTimestamp!,
                ),
              },
            ],
            estadoAtual: CadastroExercicioAtualEstado.REPOUSO,
            ultimoTimestamp: new Date(),
          });
        }}
      />
    </>
  );
}

function ExercicioAtualRepouso({
  onChange,
  cadastroTreinoAtual,
  treino,
}: CadastroExercicioAtualActionsProps) {
  const tempoEsperando = calcularTempoSegundos(
    cadastroTreinoAtual.ultimoTimestamp!,
  );
  const exercicio = treino.listaExercicios[cadastroTreinoAtual.exercicio!];
  const repouso = exercicio.repousoSeries;
  const tempoRestante = repouso - tempoEsperando;

  const finalDeExercicio =
    cadastroTreinoAtual.seriesConsolidadas.length === exercicio.series;
  const indiceSerieAtual = cadastroTreinoAtual.seriesConsolidadas.length - 1;
  const serieAtual = cadastroTreinoAtual.seriesConsolidadas[indiceSerieAtual];

  function alterarPropriedadesSerie(serie: SerieExercicioSessao) {
    const novaSerie = [...cadastroTreinoAtual.seriesConsolidadas];
    novaSerie[indiceSerieAtual] = serie;
    onChange({
      ...cadastroTreinoAtual,
      seriesConsolidadas: novaSerie,
    });
  }

  function proximo(finalizarExercicio: boolean) {
    const novaSerie = [...cadastroTreinoAtual.seriesConsolidadas];
    const totalRepouso = calcularTempoSegundos(
      cadastroTreinoAtual.ultimoTimestamp!,
    );
    novaSerie[indiceSerieAtual] = {
      ...serieAtual,
      repouso: totalRepouso,
    };
    if (finalizarExercicio) {
      onChange({
        ...cadastroTreinoAtual,
        seriesConsolidadas: novaSerie,
        estadoAtual: CadastroExercicioAtualEstado.REVISAO,
      });
    } else {
      onChange({
        ...cadastroTreinoAtual,
        seriesConsolidadas: novaSerie,
        estadoAtual: CadastroExercicioAtualEstado.SERIE,
        ultimoTimestamp: new Date(),
      });
    }
  }

  return (
    <>
      <Text style={styles.estadoHeader}>Repouso</Text>
      <Text
        style={[
          styles.estadoHeader,
          {
            color:
              tempoRestante < 0 ? Cores.padrao.primary : Cores.padrao.text300,
          },
        ]}>
        {tempoRestante < 0 ? '-' : ''}
        {formatarTempo(Math.abs(tempoRestante))}
      </Text>
      <Text style={styles.textCenter}>Informações sobre a execução</Text>
      <Text style={styles.text}>Repetições</Text>
      <SelecionadorNumero
        valor={serieAtual.repeticoes}
        onChange={novoValor => {
          if (novoValor <= 0) {
            return;
          }
          alterarPropriedadesSerie({...serieAtual, repeticoes: novoValor});
        }}
        incrementos={[1, 5]}
      />
      <Text style={styles.text}>Peso</Text>
      <SelecionadorNumero
        valor={serieAtual.peso}
        onChange={novoValor => {
          if (novoValor <= 0) {
            return;
          }
          alterarPropriedadesSerie({...serieAtual, peso: novoValor});
        }}
        incrementos={[1, 5, 10]}
        suffix="kg"
      />
      <View style={styles.espacamento} />
      <Button
        nome="Cadastrar e começar próxima série"
        onPress={() => proximo(finalDeExercicio)}
      />
      {!finalDeExercicio && (
        <Button
          nome="Cadastrar e finalizar exercício"
          onPress={() => {
            const pulandoSeries =
              exercicio.series - cadastroTreinoAtual.seriesConsolidadas.length;
            Alert.alert(
              'Pular séries?',
              `Finalizar agora estaria pulando ${pulandoSeries} série${
                pulandoSeries > 1 ? 's' : ''
              }.`,
              [
                {
                  text: 'Cancelar',
                  onPress: () => {},
                },
                {
                  text: 'Pular',
                  onPress: () => proximo(true),
                },
              ],
            );
          }}
          cor={Cores.padrao.secondary}
        />
      )}
    </>
  );
}

function ExercicioAtualRevisao({
  onFinish,
  onChange,
  cadastroTreinoAtual,
  treino,
}: CadastroExercicioAtualActionsProps) {
  return (
    <>
      <Text style={styles.estadoHeader}>Revisão do exercício</Text>
      <TabelaRevisaoExercicioProps
        treino={treino}
        onChange={series => {
          onChange({...cadastroTreinoAtual, seriesConsolidadas: series});
        }}
        series={cadastroTreinoAtual.seriesConsolidadas}
      />
      <Button nome="Próximo exercício" onPress={onFinish} />
    </>
  );
}

type TabelaRevisaoExercicioProps = {
  series: SerieExercicioSessao[];
  onChange: (series: SerieExercicioSessao[]) => void;
};

function TabelaRevisaoExercicioProps(props: TabelaRevisaoExercicioProps) {
  function alterarValorSerie(
    novoValor: string,
    serie: number,
    alterarPropriedade: (
      serie: SerieExercicioSessao,
      novoValor: number,
    ) => void,
  ) {
    const valor = parseInt(novoValor, 10);
    if (isFinite(valor) && novoValor.length > 0) {
      const novasSeries = [...props.series];
      const novaSerie = novasSeries[serie];
      alterarPropriedade(novaSerie, parseInt(novoValor, 10));
      novasSeries[serie] = novaSerie;
      props.onChange(novasSeries);
    }
  }

  return (
    <>
      <View style={styles.revisaoSerie}>
        <Text style={styles.revisaoSerieIndice}>#</Text>
        <Text style={styles.revisaoSerieHeader}>Peso</Text>
        <Text style={styles.revisaoSerieHeader}>Repetições</Text>
        <Text style={styles.revisaoSerieHeader}>Duração</Text>
        <Text style={styles.revisaoSerieHeader}>Repouso</Text>
      </View>
      {props.series.map((serie, index) => {
        return (
          <View key={index} style={styles.revisaoSerie}>
            <Text style={styles.revisaoSerieIndice}>{index + 1}ª</Text>
            <TextInput
              style={styles.revisaoSerieInputField}
              value={serie.peso.toString()}
              keyboardType="numeric"
              onChangeText={novoValorString =>
                alterarValorSerie(
                  novoValorString,
                  index,
                  (novaSerie, novoValor) => (novaSerie.peso = novoValor),
                )
              }
            />
            <TextInput
              style={styles.revisaoSerieInputField}
              value={serie.repeticoes.toString()}
              keyboardType="numeric"
              onChangeText={novoValorString =>
                alterarValorSerie(
                  novoValorString,
                  index,
                  (novaSerie, novoValor) => (novaSerie.repeticoes = novoValor),
                )
              }
            />
            <TextInput
              style={styles.revisaoSerieInputField}
              value={serie.duracao.toString()}
              keyboardType="numeric"
              onChangeText={novoValorString =>
                alterarValorSerie(
                  novoValorString,
                  index,
                  (novaSerie, novoValor) => (novaSerie.duracao = novoValor),
                )
              }
            />
            <TextInput
              style={styles.revisaoSerieInputField}
              value={serie.repouso.toString()}
              keyboardType="numeric"
              onChangeText={novoValorString =>
                alterarValorSerie(
                  novoValorString,
                  index,
                  (novaSerie, novoValor) => (novaSerie.repouso = novoValor),
                )
              }
            />
          </View>
        );
      })}
    </>
  );
}

type CardExercicioProps = {
  exercicio: ExercicioTreino;
  exercicioSessao?: ExercicioSessao;
  onChange: (sessaoNova: ExercicioSessao) => void;
  onClick: () => void;
};

function CardExercicio(props: CardExercicioProps) {
  return (
    <View style={styles.card}>
      <ItemListaExercicio
        exercicio={props.exercicio}
        onClick={() => {
          console.log('Clicou no exercício');
          props.onClick();
        }}
      />
      {props.exercicioSessao ? (
        <TabelaRevisaoExercicioProps
          series={props.exercicioSessao.series}
          onChange={novasSeries => {
            props.onChange({...props.exercicioSessao!, series: novasSeries});
          }}></TabelaRevisaoExercicioProps>
      ) : (
        <Text style={styles.naoExecutado}>Exercício não executado</Text>
      )}
    </View>
  );
}

type BarraProgressoExerciciosProps = {
  exerciciosFinalizados: ExercicioSessao[];
  exercicioAtual?: CadastroExercicioAtual;
  treino: Treino;
};

function BarraProgressoExercicios(props: BarraProgressoExerciciosProps) {
  return (
    <View style={styles.barraProgressoExercicios}>
      {props.treino.listaExercicios.map((exercicio, index) => {
        const execucao = props.exerciciosFinalizados.find(
          it => it.exercicio === index,
        );
        const executando =
          props.exercicioAtual?.exercicio === index
            ? props.exercicioAtual
            : undefined;
        let corBarra =
          execucao === undefined
            ? Cores.padrao.background
            : Cores.padrao.primary600;
        let corIcone = Cores.padrao.accent;
        if (execucao !== undefined) {
          corIcone = Cores.padrao.primary;
        } else if (props.exercicioAtual?.exercicio === index) {
          corIcone = Cores.padrao.secondary;
        }
        return (
          <View style={styles.segmentoBarraProgresso}>
            <FontAwesome6Icon
              style={styles.icone}
              name={'dumbbell'}
              size={8}
              color={corIcone}
            />
            {props.exercicioAtual?.exercicio === index ? (
              <View
                style={[styles.parteBarraProgresso, {flexDirection: 'row'}]}>
                {[...Array(exercicio.series).keys()].map(indexSerie => {
                  const execucaoSerie =
                    executando?.seriesConsolidadas[indexSerie];
                  return (
                    <View
                      key={indexSerie + index * 100}
                      style={[
                        styles.parteBarraProgresso,
                        {
                          backgroundColor:
                            execucaoSerie === undefined
                              ? Cores.padrao.secondary400
                              : Cores.padrao.primary600,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ) : (
              <View
                key={index}
                style={[
                  styles.parteBarraProgresso,
                  {
                    flex: exercicio.series,
                    backgroundColor: corBarra,
                  },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chevron: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  espacamento: {
    height: 8,
  },
  revisaoSerieHeader: {
    flex: 1,
    color: Cores.padrao.text,
    textAlign: 'center',
    fontSize: 16,
  },
  revisaoSerieInputField: {
    flex: 1,
    backgroundColor: Cores.padrao.background,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: Cores.padrao.primary,
    color: Cores.padrao.text,
    marginHorizontal: 4,
  },
  revisaoSerie: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  revisaoSerieIndice: {
    fontSize: 18,
    color: Cores.padrao.text600,
  },
  estadoHeader: {
    fontSize: 18,
    color: Cores.padrao.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  stopwatchTimer: {
    fontSize: 64,
    textAlign: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 8,
  },
  buttonText: {
    color: Cores.padrao.background,
  },
  containerIconeExercicioAtual: {
    width: 48,
    height: 48,
    margin: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Cores.padrao.secondary,
    borderRadius: 32,
  },
  padding16: {
    padding: 16,
  },
  textHeader: {
    color: Cores.padrao.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    color: Cores.padrao.text,
  },
  textCenter: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: Cores.padrao.text,
    textAlign: 'center',
  },
  segmentoBarraProgresso: {
    flex: 1,
  },
  parteBarraProgresso: {
    flexGrow: 1,
    height: 4,
    flex: 1,
    marginRight: 1,
  },
  icone: {
    position: 'relative',
    zIndex: 1,
  },
  barraProgressoExercicios: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  card: {
    backgroundColor: Cores.padrao.background,
    borderRadius: 16,
    marginBottom: 16,
  },
  container: {
    padding: 8,
    flexDirection: 'column',
  },
  naoExecutado: {
    color: Cores.padrao.secondary,
    padding: 16,
    textAlign: 'center',
  },
  divisoriaExercicioAtual: {
    marginVertical: 16,
  },
  textoDivisoriaExercicioAtual: {
    color: Cores.padrao.secondary,
    textAlign: 'center',
    fontSize: 16,
  },
});
