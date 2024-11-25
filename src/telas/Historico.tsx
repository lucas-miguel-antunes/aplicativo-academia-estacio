import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {useEffect, useState} from 'react';
import GerenciadorDados, {SessaoTreino} from '../services/GerenciadorDados.ts';
import Cores from '../Cores.ts';

export default function Historico() {
  const [sessoes, setSessoes] = useState<SessaoTreino[]>([]);

  useEffect(() => {
    const gerenciadorDados = new GerenciadorDados();
    gerenciadorDados.carregarSessoesTreino().then(sessoesTreino => {
      setSessoes(sessoesTreino.sessoes);
    });
  }, []);

  return (
    <SafeAreaView>
      <View>
        <FlatList
          data={sessoes}
          renderItem={sessao => {
            return (
              <Text key={sessao.index}>{JSON.stringify(sessao.item)}</Text>
            );
          }}></FlatList>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
