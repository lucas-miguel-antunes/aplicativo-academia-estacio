import AsyncStorage from '@react-native-async-storage/async-storage';

export enum GrupoMuscular {
  Pernas = 'Pernas',
  Peito = 'Peitoral',
  Costas = 'Costas',
  Ombros = 'Ombros',
  Biceps = 'Bíceps',
  Triceps = 'Tríceps',
  Abdomen = 'Abdômen',
}

export type ExercicioTreino = {
  nomeExercicio: string;
  duracaoSerie: number;
  repousoSeries: number;
  series: number;
  minRepeticoes: number;
  maxRepeticoes: number;
  principalGrupoMuscular: GrupoMuscular;
};

export type Treino = {
  nomeTreino: string;
  letraTreino: string;
  listaExercicios: ExercicioTreino[];
};

export type ListaTreinos = {
  treinos: Treino[];
};

export default class GerenciadorDados {
  async salvarTreinos(dados: ListaTreinos): Promise<void> {
    // Salva os dados no banco de dados
    await AsyncStorage.setItem('treinos', JSON.stringify(dados));
  }

  async carregarTreinos(): Promise<ListaTreinos> {
    // Carrega os dados do banco de dados
    const dados = await AsyncStorage.getItem('treinos');
    if (dados) {
      return JSON.parse(dados);
    } else {
      return {treinos: []};
    }
  }
}
