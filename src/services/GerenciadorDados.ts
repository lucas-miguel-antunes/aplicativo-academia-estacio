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

export type SerieExercicioSessao = {
  peso: number;
  repeticoes: number;
  duracao: number;
  repouso: number;
};

export type ExercicioSessao = {
  exercicio: number;
  series: SerieExercicioSessao[];
};

export type SessaoTreino = {
  data: Date;
  treino: number;
  exercicios: ExercicioSessao[];
};

export default class GerenciadorDados {
  async carregarSessoesTreino(): Promise<{sessoes: SessaoTreino[]}> {
    const dados = await AsyncStorage.getItem('sessoesTreino');
    if (dados) {
      return JSON.parse(dados);
    } else {
      return {sessoes: []};
    }
  }

  async salvarSessoesTreino(dados: {sessoes: SessaoTreino[]}): Promise<void> {
    await AsyncStorage.setItem('sessoesTreino', JSON.stringify(dados));
  }

  async cadastrarSessaoTreino(sessao: SessaoTreino): Promise<void> {
    const dados = await this.carregarSessoesTreino();
    dados.sessoes.push(sessao);
    await this.salvarSessoesTreino(dados);
  }

  async salvarTreinos(dados: ListaTreinos): Promise<void> {
    await AsyncStorage.setItem('treinos', JSON.stringify(dados));
  }

  async adicionarTreino(treino: Treino): Promise<void> {
    const dados = await this.carregarTreinos();
    dados.treinos.push(treino);
    await this.salvarTreinos(dados);
  }

  async deletarTreino(id: number): Promise<void> {
    const dados = await this.carregarTreinos();
    dados.treinos.splice(id, 1);
    await this.salvarTreinos(dados);
  }

  async editarTreino(id: number, treino: Treino): Promise<void> {
    const dados = await this.carregarTreinos();
    dados.treinos[id] = treino;
    await this.salvarTreinos(dados);
  }

  async carregarTreinos(): Promise<ListaTreinos> {
    const dados = await AsyncStorage.getItem('treinos');
    if (dados) {
      return JSON.parse(dados);
    } else {
      return {treinos: []};
    }
  }
}
