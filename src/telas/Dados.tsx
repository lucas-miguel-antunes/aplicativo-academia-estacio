import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import Cores from '../Cores.ts';
import React, {useEffect, useState} from 'react';
import GerenciadorDados, {
  SessaoTreino,
  Treino,
} from '../services/GerenciadorDados.ts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Dados() {
  const [sessoes, setSessoes] = useState<SessaoTreino[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);

  async function carregarDados() {
    const gerenciadorDados = new GerenciadorDados();
    const sessoesBd = await gerenciadorDados.carregarSessoesTreino();
    const treinosBd = await gerenciadorDados.carregarTreinos();

    setSessoes(
      sessoesBd.sessoes.sort(
        (a, b) => new Date(b.data).getUTCDate() - new Date(a.data).getUTCDate(),
      ),
    );
    setTreinos(treinosBd.treinos);
  }

  useEffect(() => {
    carregarDados().then(() => {
      console.log('Dados carregados');
    });
  }, []);

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <Text style={styles.textoTopo}>Dados gerais</Text>
        <View style={styles.card}>
          <TabelaDados sessoes={sessoes} />
        </View>

        {treinos.map((treino, index) => {
          return (
            <DadosTreino
              key={index}
              idTreino={index}
              treino={treino}
              sessoes={sessoes}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

type TabelaDadosProps = {
  sessoes: SessaoTreino[];
};

function TabelaDados(props: TabelaDadosProps) {
  const sessoes = props.sessoes;
  const totalExercicios = sessoes.reduce(
    (acc, sessao) => acc + sessao.exercicios.length,
    0,
  );
  const cargaTotal = sessoes.reduce((acc, sessao) => {
    return (
      acc +
      sessao.exercicios.reduce(
        (acc2, exercicio) =>
          acc2 +
          exercicio.series.reduce(
            (acc3, serie) => acc3 + serie.peso * serie.repeticoes,
            0,
          ),
        0,
      )
    );
  }, 0);
  const tempoTotal = sessoes.reduce((acc, sessao) => {
    return (
      acc +
      sessao.exercicios.reduce(
        (acc2, exercicio) =>
          acc2 +
          exercicio.series.reduce(
            (acc3, serie) => acc3 + serie.duracao + serie.repouso,
            0,
          ),
        0,
      )
    );
  }, 0);
  const tempoTotalHoras = Math.round((tempoTotal / 60 / 60) * 10) / 10;

  return (
    <>
      <View style={styles.rowTabelas}>
        <View style={styles.colunaTabela}>
          <Text style={styles.textoTabela}>Total de treinos</Text>
          <Text style={styles.textoTabelaDireito}>{sessoes.length}</Text>
        </View>
        <View style={styles.colunaTabela}>
          <Text style={styles.textoTabela}>Total de exercícios</Text>
          <Text style={styles.textoTabelaDireito}>{totalExercicios}</Text>
        </View>
      </View>
      <View style={styles.rowTabelas}>
        <View style={styles.colunaTabela}>
          <Text style={styles.textoTabela}>Carga total</Text>
          <Text style={styles.textoTabelaDireito}>{`${cargaTotal} kg`}</Text>
        </View>
        <View style={styles.colunaTabela}>
          <Text style={styles.textoTabela}>Tempo total</Text>
          <Text
            style={styles.textoTabelaDireito}>{`${tempoTotalHoras} h`}</Text>
        </View>
      </View>
    </>
  );
}

function formatarData(data: Date) {
  function pad(num: number) {
    return num.toString().padStart(2, '0');
  }

  return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data
    .getFullYear()
    .toString()
    .substring(2, 4)}`;
}

type DadosTreinoProps = {
  idTreino: number;
  treino: Treino;
  sessoes: SessaoTreino[];
};

function DadosTreino(props: DadosTreinoProps) {
  const sessoesRelevantes = props.sessoes.filter(
    it => it.treino === props.idTreino,
  );
  return (
    <>
      <Text style={styles.textoTopo}>
        {props.treino.letraTreino} - {props.treino.nomeTreino}
      </Text>
      <View style={styles.card}>
        <TabelaDados sessoes={sessoesRelevantes} />
        {props.treino.listaExercicios.map((exercicio, index) => {
          const execucoes = sessoesRelevantes
            .map(sessao => {
              return {
                data: new Date(sessao.data),
                execucao: sessao.exercicios.find(ex => ex.exercicio === index),
              };
            })
            .filter(sessao => sessao.execucao !== undefined);
          const pesoEfetivo = execucoes.map(execucao => {
            let seriesValidas = execucao.execucao!.series.filter(
              serie =>
                serie.repeticoes >
                props.treino.listaExercicios[index].minRepeticoes,
            );
            if (seriesValidas.length === 0) {
              seriesValidas = execucao.execucao!.series;
            }
            const pesoEfetivo = seriesValidas.reduce(
              (acc, serie) => Math.max(acc, serie.peso),
              0,
            );

            return { data: execucao.data, peso: pesoEfetivo };
          });
          const maiorPeso = pesoEfetivo.reduce(
            (acc, execucao) => Math.max(acc, execucao.peso),
            0,
          );

          return (
            <>
              <Text style={styles.textoHeader}>{exercicio.nomeExercicio}</Text>
              <Text style={styles.subtexto}>Progressão de carga</Text>
              <ScrollView
                horizontal={true}
                style={styles.progressaoCargaContainer}>
                {pesoEfetivo.map((execucao, index) => {
                  const pesoRelativo = execucao.peso / maiorPeso;
                  return (
                    <View style={styles.progressaoCargaItem}>
                      <View style={styles.iconeProgressaoCargaWrapper}>
                        <Icon
                          style={styles.iconeProgressaoCarga}
                          name={'arm-flex'}
                          size={Math.max(pesoRelativo * 31, 10)}
                          color={Cores.padrao.background}
                        />
                      </View>
                      <Text style={styles.pesoProgressaoCarga}>
                        {execucao.peso} kg
                      </Text>
                      <Text style={styles.dataProgressaoCarga}>
                        {formatarData(new Date(execucao.data))}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  iconeProgressaoCargaWrapper: {
    marginHorizontal: 'auto',
    width: 32,
    height: 32,
    flexDirection: 'row',
  },
  iconeProgressaoCarga: {
    margin: 'auto',
    backgroundColor: Cores.padrao.secondary,
    borderRadius: 50,
  },
  pesoProgressaoCarga: {
    color: Cores.padrao.text,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataProgressaoCarga: {
    color: Cores.padrao.secondary,
    textAlign: 'center',
    fontSize: 12,
  },
  progressaoCargaContainer: {
    flexDirection: 'row',
  },
  progressaoCargaItem: {
    width: 100,
    flexDirection: 'column',
  },
  rowTabelas: {
    flexDirection: 'row',
    flex: 1,
  },
  colunaTabela: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  textoTabela: {
    color: Cores.padrao.text,
  },
  textoTabelaDireito: {
    color: Cores.padrao.secondary,
    textAlign: 'right',
  },
  card: {
    backgroundColor: Cores.padrao.background,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  topo: {
    marginVertical: 8,
  },
  container: {
    marginVertical: 8,
    padding: 8,
    flexDirection: 'column',
  },
  textoTopo: {
    color: Cores.padrao.secondary,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  subtexto: {
    color: Cores.padrao.text,
    fontSize: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  iconeTexto: {
    marginRight: 8,
  },
  textoHeader: {
    color: Cores.padrao.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16,
    marginHorizontal: 16,
  },
});
