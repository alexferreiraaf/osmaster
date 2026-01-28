import type { Order, Employee, OrderStatus } from './types';

let orders: Order[] = [
  {
    id: 'OS-2024-001',
    client: 'João Silva',
    document: '123.456.789-00',
    contact: '(11) 98888-7777',
    city: 'São Paulo',
    state: 'SP',
    orderNow: 'Sim',
    mobile: 'Sim',
    ifoodIntegration: 'Não',
    dll: 'v1.2.0',
    remoteCode: '456 123 789',
    assignedTo: 'Carlos Alberto',
    service: 'Manutenção de Ar Condicionado',
    status: 'Concluída',
    date: '2024-05-15',
    priority: 'Alta',
    description: 'Limpeza geral e troca de filtro do condensador.',
  },
  {
    id: 'OS-2024-002',
    client: 'Maria Oliveira',
    document: '987.654.321-00',
    contact: '(21) 99999-5555',
    city: 'Rio de Janeiro',
    state: 'RJ',
    orderNow: 'Não',
    mobile: 'Sim',
    ifoodIntegration: 'Sim',
    ifoodEmail: 'maria@email.com',
    dll: 'v1.3.0',
    remoteCode: '123 456 789',
    assignedTo: 'Mariana Souza',
    service: 'Instalação de Software Fiscal',
    status: 'Em Andamento',
    date: '2024-05-20',
    priority: 'Média',
    description: 'Instalar e configurar emissor de notas fiscais.',
  },
  {
    id: 'OS-2024-003',
    client: 'Pedro Santos',
    document: '111.222.333-44',
    contact: '(31) 97777-6666',
    city: 'Belo Horizonte',
    state: 'MG',
    orderNow: 'Sim',
    mobile: 'Não',
    ifoodIntegration: 'Não',
    dll: 'v1.1.5',
    remoteCode: '987 654 321',
    assignedTo: 'Ricardo Lima',
    service: 'Configuração de Rede',
    status: 'Pendente',
    date: '2024-05-22',
    priority: 'Baixa',
    description: 'Configurar novo roteador e pontos de acesso.',
  },
];

const employees: Employee[] = ['Carlos Alberto', 'Mariana Souza', 'Ricardo Lima', 'Fernanda Oliveira'];

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getOrders(searchTerm?: string): Promise<Order[]> {
  await delay(100);
  let filteredOrders = orders;
  if (searchTerm) {
    const lowercasedTerm = searchTerm.toLowerCase();
    filteredOrders = orders.filter(o => 
      o.client.toLowerCase().includes(lowercasedTerm) || 
      o.service.toLowerCase().includes(lowercasedTerm) ||
      o.id.toLowerCase().includes(lowercasedTerm)
    );
  }
  return [...filteredOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  await delay(100);
  return orders.find(o => o.id === id);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> {
  await delay(500);
  const newOrder: Order = {
    ...orderData,
    id: `OS-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
    date: new Date().toISOString().split('T')[0],
    status: 'Pendente',
  };
  orders = [newOrder, ...orders];
  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
  await delay(300);
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex > -1) {
    orders[orderIndex].status = status;
    return orders[orderIndex];
  }
  return undefined;
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  await delay(300);
  const initialLength = orders.length;
  orders = orders.filter(o => o.id !== id);
  return { success: orders.length < initialLength };
}

export async function getEmployees(): Promise<Employee[]> {
  await delay(50);
  return employees;
}

export async function getOrderStats() {
  await delay(100);
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pendente').length,
    ongoing: orders.filter(o => o.status === 'Em Andamento').length,
    completed: orders.filter(o => o.status === 'Concluída').length,
  };
}
