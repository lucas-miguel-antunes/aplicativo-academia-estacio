import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import Cores from './Cores.ts';
import Icon from 'react-native-vector-icons/FontAwesome';

export enum TipoAtividade {
  Caminhada,
  Corrida,
  Musculacao,
  Natacao,
  AulaDanca,
}

export interface Usuario {
  nome: string;
}

export interface Atividade {
  tipo: TipoAtividade;
  titulo: string,
  duracaoMinutos: number,
  horario: string,
  data: string,
  calorias: number,
  usuario: Usuario,
}

const padraoAtividades: Atividade[] = [
  {
    tipo: TipoAtividade.Musculacao,
    titulo: 'Treino de perna',
    duracaoMinutos: 60,
    horario: '16:20',
    data: '10/11/2024',
    calorias: 210,
    usuario: {
      nome: 'Lucas Miguel',
    },
  },
  {
    tipo: TipoAtividade.Corrida,
    titulo: 'Corrida no parque',
    duracaoMinutos: 20,
    horario: '17:20',
    data: '10/11/2024',
    calorias: 186,
    usuario: {
      nome: 'Lucas Miguel',
    },
  },
  {
    tipo: TipoAtividade.AulaDanca,
    titulo: 'Fit dance',
    duracaoMinutos: 45,
    horario: '19:15',
    data: '10/11/2024',
    calorias: 328,
    usuario: {
      nome: 'Bruno Bismarck',
    },
  },
];

export default function Atividades() {
  let variasAtividades = [];

  for (var i = 0; i < 100; i ++){
    let dataDia = new Date();
    dataDia.setDate(dataDia.getDate() - 24 * 60 * 60 * 1000);

    for (var replic of padraoAtividades) {
      variasAtividades.push({
        ...replic,
        data: `${dataDia.getDay()}/${dataDia.getMonth()}/${dataDia.getFullYear()}`,
        duracaoMinutos: replic.duracaoMinutos + ((Math.random() * 2) - 1) * 10,
        calorias: replic.duracaoMinutos + ((Math.random() * 2) - 1) * 40,
      });
    }
  }
  return (
    <SafeAreaView>
      <NovaAtividade></NovaAtividade>
      <FlatList
        data={variasAtividades}
        renderItem={item => (
          <PreviewAtividade atividade={item.item}></PreviewAtividade>
        )}></FlatList>
    </SafeAreaView>
  );
}

function NovaAtividade() {
  return (
    <View style={[styles.card, styles.novaAtividade]}>
      <Text style={styles.novaAtividadeTexto}>Registrar Atividade</Text>
    </View>
  );
}

function nomeTipoAtividade(tipoAtividade: TipoAtividade) {
  switch (tipoAtividade) {
    case TipoAtividade.Caminhada:
      return 'Caminhada';
    case TipoAtividade.Corrida:
      return 'Corrida';
    case TipoAtividade.Musculacao:
      return 'Musculação';
    case TipoAtividade.Natacao:
      return 'Natação';
    case TipoAtividade.AulaDanca:
      return 'Aula de Dança';

  }
}

function PreviewAtividade(props: { atividade: Atividade }) {
  const atividade = props.atividade;
  return (
    <View style={[styles.card, styles.itemListaAtividades]}>
      <Icon style={styles.iconItemListaAtividades} name="rocket" size={32} color="#900" />
      <View style={styles.textosItemListaAtividades}>
        <Text style={[styles.textoItemListaAtividades]}>{atividade.usuario.nome}</Text>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <Text style={[{ flexShrink: 1, fontWeight: 'bold', flexGrow: 1 }, styles.textoItemListaAtividades]}>
            {atividade.titulo}
          </Text>
          <Text style={[{ alignItems: 'flex-end' }, styles.textoItemListaAtividades]}>{atividade.horario}</Text>
        </View>
        <View style={styles.tags}>
          <Tagzinha cor={Cores.padrao.secondary} texto={nomeTipoAtividade(atividade.tipo)}></Tagzinha>
          <Tagzinha cor={Cores.padrao.secondary} texto={Math.round(atividade.duracaoMinutos) + ' minutos'}></Tagzinha>
          <Tagzinha cor={Cores.padrao.primary} texto={Math.round(atividade.calorias) + ' calorias'}></Tagzinha>
        </View>
      </View>
    </View>
  );
}

function Tagzinha(props: { cor: string, texto: string }) {
  return (
    <View style={[{backgroundColor: props.cor }, styles.containerTag]}>
      <Text style={styles.containerTexto}>{props.texto}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tags: {
    flexWrap: 'wrap',
    flexDirection: 'column',
  },
  containerTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    margin: 8,
    borderRadius: 16,
    flexShrink: 1,
    flexGrow: 0,
  },
  containerTexto: {
    color: Cores.padrao.text,
    flexWrap: 'wrap',
    fontSize: 12,
    flexShrink: 1,
    flexGrow: 0,
  },
  card: {
    margin: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemListaAtividades: {
    flexDirection: 'row',
  },
  iconItemListaAtividades: {
    margin: 8,
  },
  textosItemListaAtividades: {
    flexDirection: 'column',
    padding: 8,
    flex: 1,
  },
  textoItemListaAtividades: {
    color: Cores.padrao.text,
    fontSize: 16,
  },
  novaAtividade: {
    backgroundColor: Cores.padrao.primary,
    minHeight: 32,
    borderRadius: 10,
  },
  novaAtividadeTexto: {
    color: Cores.padrao.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
