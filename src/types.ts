export type BirthdayStatus = 'não iniciado' | 'em andamento' | 'concluido';

export interface Birthday {
  id: string;
  name: string;
  date: string;
  status: BirthdayStatus;
  created_at?: string;
}
