import React, {useEffect, useState} from 'react';
import {
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
import {
  ExercicioSessao,
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

  function alterarExercicio(exercicio: ExercicioSessao, idExercicio: number) {
    const novosExercicios = [...exercicios];
    novosExercicios[idExercicio] = exercicio;
    setExercicios(novosExercicios);
  }

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <ItemListaTreino treino={treino} />
        </View>

        <BarraProgressoExercicios exercicios={exercicios} treino={treino} />

        <CadastroExercicioAtualComponent
          treino={treino}
          cadastroTreinoAtual={cadastroTreinoAtual}
          ultimoExercicio={ultimoExercicio}
          onChange={novo => {
            setCadastroTreinoAtual(novo);
          }}
          onFinish={() => {
            setUltimoExercicio(cadastroTreinoAtual.exercicio);
            setCadastroTreinoAtual({
              seriesConsolidadas: [],
              estadoAtual: CadastroExercicioAtualEstado.PREPARAR_INICIO_SERIE,
            });
            setExercicios([...exercicios, {
              exercicio: cadastroTreinoAtual.exercicio!,
              series: cadastroTreinoAtual.seriesConsolidadas,
            }]);
          }}
        />

        {treino.listaExercicios.map((exercicio, index) => {
          const execucao = exercicios[index];
          return (
            <CardExercicio
              key={index}
              exercicio={execucao}
              onExercicioChange={novoExercicio =>
                alterarExercicio(novoExercicio, index)
              }
            />
          );
        })}
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
  const numeroExercicioAtual =
    props.cadastroTreinoAtual.exercicio !== undefined ? props.cadastroTreinoAtual.exercicio
      : props.ultimoExercicio !== undefined ? props.ultimoExercicio + 1 : 0;
  const exercicioAtual = props.treino.listaExercicios[numeroExercicioAtual];

  return (
    <View style={[styles.padding16, styles.card]}>
      <Text style={styles.text}>Exercício atual</Text>
      <ItemLista
        titulo={exercicioAtual.nomeExercicio}
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
          {exercicioAtual.series} séries de {exercicioAtual.minRepeticoes} a{' '}
          {exercicioAtual.maxRepeticoes} repetições
        </Text>
        <Text style={styles.text}>
          Repouso de {exercicioAtual.repousoSeries} segundos entre séries
        </Text>
      </ItemLista>
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
        <View style={styles.column}>
          <Button
            nome={'Começar série'}
            onPress={() => {
              props.onChange({
                ...props.cadastroTreinoAtual,
                estadoAtual: CadastroExercicioAtualEstado.SERIE,
                ultimoTimestamp: new Date(),
              });
            }}
          />
        </View>
      );
    case CadastroExercicioAtualEstado.SERIE:
      const tempoExecucao = calcularTempoSegundos(
        props.cadastroTreinoAtual.ultimoTimestamp!,
      );
      return (
        <>
          <Text style={styles.estadoHeader}>Tempo de execução</Text>
          <Text style={styles.stopwatchTimer}>
            {formatarTempo(tempoExecucao)}
          </Text>
          <Button
            nome="Terminar execução"
            onPress={() => {
              props.onChange({
                ...props.cadastroTreinoAtual,
                seriesConsolidadas: [
                  ...props.cadastroTreinoAtual.seriesConsolidadas,
                  {
                    peso: 0,
                    repeticoes: 0,
                    repouso: 0,
                    duracao: calcularTempoSegundos(
                      props.cadastroTreinoAtual.ultimoTimestamp!,
                    ),
                  },
                ],
                estadoAtual: CadastroExercicioAtualEstado.REPOUSO,
                ultimoTimestamp: new Date(),
              });
            }}></Button>
        </>
      );
    case CadastroExercicioAtualEstado.REPOUSO:
      const tempoEsperando = calcularTempoSegundos(
        props.cadastroTreinoAtual.ultimoTimestamp!,
      );
      const exercicio =
        props.treino.listaExercicios[props.cadastroTreinoAtual.exercicio!];
      const repouso = exercicio.repousoSeries;
      const tempoRestante = repouso - tempoEsperando;

      const finalDeExercicio =
        props.cadastroTreinoAtual.seriesConsolidadas.length ===
        exercicio.series;
      const indiceSerieAtual =
        props.cadastroTreinoAtual.seriesConsolidadas.length - 1;
      const serieAtual =
        props.cadastroTreinoAtual.seriesConsolidadas[indiceSerieAtual];

      function alterarPropriedadesSerie(serie: SerieExercicioSessao) {
        const novaSerie = [...props.cadastroTreinoAtual.seriesConsolidadas];
        novaSerie[indiceSerieAtual] = serie;
        props.onChange({
          ...props.cadastroTreinoAtual,
          seriesConsolidadas: novaSerie,
        });
      }

      return (
        <>
          <Text style={styles.estadoHeader}>Repouso</Text>;
          <Text
            style={[
              styles.estadoHeader,
              {
                color:
                  tempoRestante < 0
                    ? Cores.padrao.primary
                    : Cores.padrao.text300,
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
          <View style={styles.espacamento}></View>
          <Button
            nome="Cadastrar e começar próxima série"
            onPress={() => {
              const novaSerie = [
                ...props.cadastroTreinoAtual.seriesConsolidadas,
              ];
              const totalRepouso = calcularTempoSegundos(
                props.cadastroTreinoAtual.ultimoTimestamp!,
              );
              novaSerie[indiceSerieAtual] = {
                repouso: totalRepouso,
                ...serieAtual,
              };
              if (finalDeExercicio) {
                props.onChange({
                  ...props.cadastroTreinoAtual,
                  seriesConsolidadas: novaSerie,
                  estadoAtual: CadastroExercicioAtualEstado.REVISAO,
                });
              } else {
                props.onChange({
                  ...props.cadastroTreinoAtual,
                  seriesConsolidadas: novaSerie,
                  estadoAtual: CadastroExercicioAtualEstado.SERIE,
                  ultimoTimestamp: new Date(),
                });
              }
            }}
          />
        </>
      );
    case CadastroExercicioAtualEstado.REVISAO:
      return (
        <>
          <Text style={styles.estadoHeader}>Revisão do exercício</Text>
          <View style={styles.revisaoSerie}>
            <Text style={styles.revisaoSerieIndice}>#</Text>
            <Text style={styles.revisaoSerieHeader}>Peso</Text>
            <Text style={styles.revisaoSerieHeader}>Repetições</Text>
            <Text style={styles.revisaoSerieHeader}>Duração</Text>
            <Text style={styles.revisaoSerieHeader}>Repouso</Text>
          </View>
          {props.cadastroTreinoAtual.seriesConsolidadas.map((serie, index) => {
            return (
              <View key={index} style={styles.revisaoSerie}>
                <Text style={styles.revisaoSerieIndice}>{index + 1}ª</Text>
                <TextInput
                  style={styles.revisaoSerieInputField}
                  value={serie.peso.toString()}
                />
                <TextInput
                  style={styles.revisaoSerieInputField}
                  value={serie.repeticoes.toString()}
                />
                <TextInput
                  style={styles.revisaoSerieInputField}
                  value={serie.duracao.toString()}
                />
                <TextInput
                  style={styles.revisaoSerieInputField}
                  value={serie.repouso.toString()}
                />
              </View>
            );
          })}
          <Button
            nome="Próximo exercício"
            onPress={() => {
              props.onFinish();
            }}
          />
        </>
      );
  }
}

type CardExercicioProps = {
  exercicio?: ExercicioSessao;
  onExercicioChange: (exercicio: ExercicioSessao) => void;
};

function CardExercicio(props: CardExercicioProps) {
  return (
    <View style={[styles.padding16, styles.card]}>
      <Text>exercicio</Text>
    </View>
  );
}

type BarraProgressoExerciciosProps = {
  exercicios: ExercicioSessao[];
  treino: Treino;
};

function BarraProgressoExercicios(props: BarraProgressoExerciciosProps) {
  return (
    <View style={styles.barraProgressoExercicios}>
      {props.treino.listaExercicios.map((exercicio, index) => {
        const execucao = props.exercicios.find(it => it.exercicio === index);
        return (
          <>
            <View style={styles.segmentoBarraProgresso}>
              <FontAwesome6Icon
                style={styles.icone}
                name={'dumbbell'}
                size={16}
                color={Cores.padrao.accent}
              />
              <View
                key={index}
                style={[
                  styles.parteBarraProgresso,
                  {
                    flex: exercicio.series,
                    flexGrow: 1,
                    backgroundColor: Cores.padrao.background,
                  },
                ]}></View>
            </View>
          </>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 24,
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
    height: 8,
    flex: 1,
  },
  icone: {
    position: 'relative',
    zIndex: 1,
    top: 12,
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
});
