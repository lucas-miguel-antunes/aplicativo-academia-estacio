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

  async adicionarTreino(treino: Treino): Promise<void> {
    // Carrega os dados do banco de dados
    const dados = await this.carregarTreinos();
    // Adiciona o treino
    dados.treinos.push(treino);
    // Salva os dados no banco de dados
    await this.salvarTreinos(dados);
  }

  async deletarTreino(id: number): Promise<void> {
    // Carrega os dados do banco de dados
    const dados = await this.carregarTreinos();
    // Remove o treino
    dados.treinos.splice(id, 1);
    // Salva os dados no banco de dados
    await this.salvarTreinos(dados);
  }

  async editarTreino(id: number, treino: Treino): Promise<void> {
    // Carrega os dados do banco de dados
    const dados = await this.carregarTreinos();
    // Substitui o treino
    dados.treinos[id] = treino;
    // Salva os dados no banco de dados
    await this.salvarTreinos(dados);
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
