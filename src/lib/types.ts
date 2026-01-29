export type OrderStatus = 'Pendente' | 'Em Andamento' | 'Concluída';
export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type ChecklistItems = {
  importacaoProdutos: boolean;
  adicionaisOpcionais: boolean;
  codigoPDV: boolean;
  preco: boolean;
  bairros: boolean;
  imagens: boolean;
  fiscal: boolean;
};

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
  certificateUrl?: string;
  assignedTo: string;
  service: string;
  status: OrderStatus;
  date: string;
  priority: Priority;
  description: string;
  checklist: ChecklistItems;
  lastUpdatedBy?: string;
  updatedAt?: string;
}

export type Employee = string;

export type User = {
  name: string;
  email: string;
};
