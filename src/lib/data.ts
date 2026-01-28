import type { Order, Employee, OrderStatus, ChecklistItems } from './types';

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
    dll: 'a77df4ad504463ac353db846a1c84e611735a8d0f7560dd1d80dc25019565c26cee83258cf953deb0c5c09d8f6911cb08cada210faf5bc57ed5b16908227e8da',
    remoteCode: '456 123 789',
    assignedTo: 'Carlos Alberto',
    service: 'Manutenção de Ar Condicionado',
    status: 'Concluída',
    date: '2024-05-15',
    priority: 'Alta',
    description: 'Limpeza geral e troca de filtro do condensador.',
    checklist: {
      importacaoProdutos: true,
      adicionaisOpcionais: true,
      codigoPDV: false,
      preco: true,
      bairros: false,
      imagens: false,
      fiscal: true,
    },
    lastUpdatedBy: 'Admin',
    updatedAt: '2024-05-16T10:00:00Z'
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
    checklist: {
      importacaoProdutos: true,
      adicionaisOpcionais: false,
      codigoPDV: true,
      preco: true,
      bairros: false,
      imagens: true,
      fiscal: true,
    },
    lastUpdatedBy: 'Carlos Alberto',
    updatedAt: '2024-05-21T14:30:00Z'
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
    checklist: {
      importacaoProdutos: false,
      adicionaisOpcionais: false,
      codigoPDV: false,
      preco: false,
      bairros: false,
      imagens: false,
      fiscal: false,
    },
  },
];

let employees: Employee[] = ['Carlos Alberto', 'Mariana Souza', 'Ricardo Lima', 'Fernanda Oliveira'];

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

export async function createOrder(orderData: Omit<Order, 'id' | 'date' | 'status' | 'checklist'>): Promise<Order> {
  await delay(500);
  const newOrder: Order = {
    ...orderData,
    id: `OS-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
    date: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    checklist: {
      importacaoProdutos: false,
      adicionaisOpcionais: false,
      codigoPDV: false,
      preco: false,
      bairros: false,
      imagens: false,
      fiscal: false,
    },
    updatedAt: new Date().toISOString(),
  };
  orders = [newOrder, ...orders];
  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus, updatedBy: string): Promise<Order | undefined> {
  await delay(300);
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex > -1) {
    orders[orderIndex].status = status;
    orders[orderIndex].lastUpdatedBy = updatedBy;
    orders[orderIndex].updatedAt = new Date().toISOString();
    return orders[orderIndex];
  }
  return undefined;
}

export async function updateOrderChecklist(id: string, checklist: ChecklistItems, updatedBy: string): Promise<Order | undefined> {
  await delay(300);
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex > -1) {
    orders[orderIndex].checklist = checklist;
    orders[orderIndex].lastUpdatedBy = updatedBy;
    orders[orderIndex].updatedAt = new Date().toISOString();
    return orders[orderIndex];
  }
  return undefined;
}

export async function updateOrderDescription(id: string, description: string, updatedBy: string): Promise<Order | undefined> {
    await delay(300);
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex > -1) {
      orders[orderIndex].description = description;
      orders[orderIndex].lastUpdatedBy = updatedBy;
      orders[orderIndex].updatedAt = new Date().toISOString();
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

export async function addEmployee(name: Employee): Promise<Employee> {
    await delay(200);
    if (employees.find(e => e.toLowerCase() === name.toLowerCase())) {
        throw new Error('Técnico já existe.');
    }
    employees.push(name);
    return name;
}

export async function deleteEmployee(name: Employee): Promise<{ success: boolean }> {
    await delay(200);
    const initialLength = employees.length;
    employees = employees.filter(e => e !== name);
    // Unassign from any orders
    orders.forEach(o => {
        if (o.assignedTo === name) {
            o.assignedTo = '';
        }
    });
    return { success: employees.length < initialLength };
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
