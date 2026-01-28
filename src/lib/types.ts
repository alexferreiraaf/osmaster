export type OrderStatus = 'Pendente' | 'Em Andamento' | 'Concluída';
export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface Order {
  id: string;
  client: string;
  document: string;
  contact: string;
  city: string;
  state: string;
  orderNow: 'Sim' | 'Não';
  mobile: 'Sim' | 'Não';
  ifoodIntegration: 'Sim' | 'Não';
  ifoodEmail?: string;
  ifoodPassword?: string;
  dll: string;
  remoteCode: string;
  certificateFile?: string;
  assignedTo: string;
  service: string;
  status: OrderStatus;
  date: string;
  priority: Priority;
  description: string;
}

export type Employee = string;
