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
  remoteTool?: 'AnyDesk' | 'TeamViewer' | 'Nenhum';
  remoteCode: string;
  certificateFileName?: string;
  certificateDataUrl?: string;
  imageFileName?: string;
  imageDataUrl?: string;
  assignedTo: string;
  service: string;
  status: OrderStatus;
  date: any;
  priority: Priority;
  description: string;
  checklist: ChecklistItems;
  lastUpdatedBy?: string;
  updatedAt?: any;
}

export type Employee = string;

export type User = {
  name: string;
  email: string;
};
