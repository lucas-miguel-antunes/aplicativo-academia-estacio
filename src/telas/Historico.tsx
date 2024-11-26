import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import GerenciadorDados, {
  SessaoTreino,
  Treino,
} from '../services/GerenciadorDados.ts';
import Cores from '../Cores.ts';

export default function Historico() {
  const dataAtual = new Date();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sessoes, setSessoes] = useState<SessaoTreino[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [mesCalendario, setMesCalendario] = useState<number>(dataAtual.getUTCMonth());
  const [anoCalendario, setAnoCalendario] = useState<number>(dataAtual.getUTCFullYear());

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
      <View>
        <FlatList
          data={[{topo: true}, ...sessoes]}
          style={styles.container}
          renderItem={sessao => {
            if (sessao.item.topo) {
              return (
                <>
                  <View style={styles.topo}>
                    <Text style={styles.textoTopo}>Calendário</Text>
                    <CalendarioTreinos
                      sessoes={sessoes}
                      treinos={treinos}
                      mes={mesCalendario}
                      ano={anoCalendario}
                    onChangeYear={(aumento) => {
                      let novoMes = mesCalendario + (aumento ? 1 : -1);
                      if (novoMes === -1) {
                        novoMes = 11;
                        setAnoCalendario(anoCalendario - 1);
                      } else if (novoMes === 12) {
                        novoMes = 0;
                        setAnoCalendario(anoCalendario + 1);
                      }
                      setMesCalendario(novoMes);
                    }} />
                  </View>
                  {sessoes === undefined || sessoes.length === 0 ? (
                    <View style={styles.topo}>
                      <Text style={styles.textoTopo}>
                        Nenhum treino cadastrado
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.topo}>
                      <Text style={styles.textoTopo}>
                        Suas sessões de treino
                      </Text>
                    </View>
                  )}
                </>
              );
            }
            return (
              <SessaoTreinoItem
                sessao={sessao.item}
                treino={treinos[sessao.item.treino]}
              />
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => carregarDados()}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

type CalendarioTreinosProps = {
  sessoes: SessaoTreino[];
  treinos: Treino[];
  mes: number;
  ano: number;
  onChangeYear: (subida: boolean) => void;
};

function CalendarioTreinos(props: CalendarioTreinosProps) {
  let calendario: Date[][] = [];
  let dataAtual = new Date(props.ano, props.mes, 1);
  while (dataAtual.getDay() !== 0) {
    dataAtual.setDate(dataAtual.getDate() - 1);
  }
  do {
    if (calendario.length === 0) {
      calendario.push([]);
    }
    let semana = calendario[calendario.length - 1];
    if (semana.length > 0 && semana[semana.length - 1].getDay() === 6) {
      calendario.push([]);
      semana = calendario[calendario.length - 1];
    }
    semana.push(new Date(dataAtual));

    dataAtual.setDate(dataAtual.getDate() + 1);
  } while (
    dataAtual.getMonth() === props.mes ||
    calendario[calendario.length - 1].length < 7
  );

  return (
    <View style={[styles.card, styles.calendario]}>
      <View style={styles.botoesCalendario}>
        <Text
          style={styles.iconeLetraPequeno}
          onPress={() => props.onChangeYear(false)}>
          {'<'}
        </Text>
        <Text style={styles.texto}>{props.mes + 1}/{props.ano}</Text>
        <Text
          style={styles.iconeLetraPequeno}
          onPress={() => props.onChangeYear(true)}>
          {'>'}
        </Text>
      </View>
      {calendario.map(semana => {
        return (
          <View style={styles.calendarioSemana}>
            {semana.map(dia => {
              const diaEstaNoMes = dia.getMonth() === props.mes;
              const sessaoDia = props.sessoes.find(sessao => {
                const dataSessao = new Date(sessao.data);
                console.log(`Data ${dataSessao} (${dataSessao.getUTCDate()}/${dataSessao.getUTCMonth()}/${dataSessao.getUTCFullYear()})
                    dia ${dia} (${dia.getUTCDate()}/${dia.getUTCMonth()}/${dia.getUTCFullYear()})`);
                return (
                  new Date(sessao.data).getUTCDate() === dia.getUTCDate() &&
                  new Date(sessao.data).getUTCMonth() === dia.getUTCMonth() &&
                  new Date(sessao.data).getUTCFullYear() ===
                    dia.getUTCFullYear()
                );
              });
              return (
                <View style={styles.calendarioDia}>
                  <Text
                    style={
                      diaEstaNoMes
                        ? styles.calendarioDiaTexto
                        : [styles.calendarioDiaTexto, styles.calendarioForaMes]
                    }>
                    {dia.getDate()}
                  </Text>
                  <View
                    style={
                      sessaoDia !== undefined
                        ? [
                            styles.calendarioBolha,
                            styles.calendarioBolhaPreenchido,
                          ]
                        : styles.calendarioBolha
                    }>
                    {sessaoDia && (
                      <Text style={styles.iconeLetraPequeno}>
                        {props.treinos[sessaoDia.treino].letraTreino}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

function formatarData(data: Date) {
  function pad(num: number) {
    return num.toString().padStart(2, '0');
  }

  return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${pad(
    data.getFullYear(),
  )} ${pad(data.getHours())}:${pad(data.getMinutes())}`;
}

type SessaoTreinoItemProps = {
  sessao: SessaoTreino;
  treino: Treino;
};

function SessaoTreinoItem(props: SessaoTreinoItemProps) {
  const {sessao, treino} = props;
  const tempoMinutos = Math.floor(
    props.sessao.exercicios.reduce(
      (acc, it) =>
        acc +
        it.series.reduce((acc2, serie) => {
          return acc2 + serie.duracao + serie.repouso;
        }, 0),
      0,
    ) / 60,
  );
  const totalSeries = props.sessao.exercicios.reduce(
    (acc, it) => acc + it.series.length,
    0,
  );
  const cargaTotal = props.sessao.exercicios.reduce(
    (acc, it) =>
      acc +
      it.series.reduce((acc2, serie) => {
        return acc2 + serie.peso * serie.repeticoes;
      }, 0),
    0,
  );

  return (
    <View style={styles.card}>
      <View style={styles.topoTreino}>
        <View style={styles.row}>
          <Text style={styles.iconeLetraPequeno}>{treino.letraTreino}</Text>
          <Text style={styles.textoTreino}>{treino.nomeTreino}</Text>
        </View>
        <Text style={styles.textoTempo}>
          {formatarData(new Date(sessao.data))}
        </Text>
      </View>
      <View style={styles.rowTabelas}>
        <View style={styles.colunaTabela}>
          <Text style={styles.textoTabela}>Tempo</Text>
          <Text
            style={styles.textoTabelaDireito}>{`${tempoMinutos} minutos`}</Text>
        </View>
        <View style={styles.colunaTabela}>
          <Text style={styles.textoTabela}>Exercícios</Text>
          <Text style={styles.textoTabelaDireito}>
            {sessao.exercicios.length.toString()}
          </Text>
        </View>
      </View>
      <View style={styles.rowTabelas}>
        <View style={styles.colunaTabela}>
          <Text style={styles.textoTabela}>Total de séries</Text>
          <Text style={styles.textoTabelaDireito}>
            {totalSeries.toString()}
          </Text>
        </View>
        <View style={styles.colunaTabela}>
          <Text style={styles.textoTabela}>Carga total</Text>
          <Text style={styles.textoTabelaDireito}>
            {cargaTotal.toString()} kg
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  text: {
    color: Cores.padrao.text,
  },
  textoTabela: {
    color: Cores.padrao.text,
  },
  textoTabelaDireito: {
    color: Cores.padrao.secondary,
    textAlign: 'right',
  },
  textoTreino: {
    fontSize: 16,
    color: Cores.padrao.text,
    verticalAlign: 'middle',
    marginLeft: 8,
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
  botoesCalendario: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  calendario: {
    padding: 16,
    flexDirection: 'column',
  },
  calendarioSemana: {
    flexDirection: 'row',
  },
  calendarioDia: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: Cores.padrao.secondary900,
    padding: 2,
  },
  calendarioBolha: {
    height: 24,
    width: 24,
    borderRadius: 12,
    marginHorizontal: 'auto',
    marginVertical: 4,
  },
  calendarioBolhaPreenchido: {
    backgroundColor: Cores.padrao.primary,
  },
  calendarioDiaTexto: {
    textAlign: 'right',
    verticalAlign: 'top',
    fontSize: 10,
    color: Cores.padrao.secondary,
    flex: 1,
  },
  calendarioForaMes: {
    color: Cores.padrao.secondary800,
  },
  topoTreino: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  textoTempo: {
    fontSize: 16,
    color: Cores.padrao.secondary,
    verticalAlign: 'middle',
  },
  card: {
    backgroundColor: Cores.padrao.background,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  container: {
    padding: 8,
    flexDirection: 'column',
  },
  iconeLetraPequeno: {
    textAlign: 'center',
    fontSize: 16,
    verticalAlign: 'middle',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Cores.padrao.primary,
    color: Cores.padrao.background,
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
