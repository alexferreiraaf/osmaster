'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  createOrder as dbCreateOrder,
  deleteOrder as dbDeleteOrder,
  updateOrderStatus as dbUpdateOrderStatus,
  updateOrderChecklist as dbUpdateOrderChecklist,
  updateOrderDescription as dbUpdateOrderDescription,
} from '@/lib/data';
import type { Order, OrderStatus, ChecklistItems } from '@/lib/types';
import { suggestTechnicianForOrder, type SuggestTechnicianForOrderInput } from '@/ai/flows/suggest-technician-for-order';


const FormSchema = z.object({
  id: z.string(),
  client: z.string({ required_error: 'Nome do cliente é obrigatório.' }),
  document: z.string().optional(),
  contact: z.string().optional(),
  city: z.string({ required_error: 'Cidade é obrigatória.' }),
  state: z.string({ required_error: 'Estado é obrigatório.' }),
  orderNow: z.enum(['Sim', 'Não']),
  mobile: z.enum(['Sim', 'Não']),
  ifoodIntegration: z.enum(['Sim', 'Não']),
  ifoodEmail: z.string().optional(),
  ifoodPassword: z.string().optional(),
  dll: z.string().optional(),
  remoteCode: z.string().optional(),
  certificateFile: z.string().optional(),
  assignedTo: z.string().optional(),
  service: z.string({ required_error: 'Título do serviço é obrigatório.' }),
  priority: z.enum(['Baixa', 'Média', 'Alta', 'Urgente']),
  description: z.string().optional(),
  date: z.string(),
});

const CreateOrderSchema = FormSchema.omit({ id: true, date: true });

export async function createOrder(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  
  const validatedFields = CreateOrderSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos. Falha ao criar ordem de serviço.',
    };
  }

  try {
    const data = validatedFields.data;
    // This is a mock implementation. In a real app, you'd get the user from the session.
    const user = { name: 'Admin' };
    
    const orderData = {
        ...data,
        assignedTo: data.assignedTo === 'none' ? '' : data.assignedTo ?? '',
        description: data.description ?? '',
        document: data.document ?? '',
        contact: data.contact ?? '',
        dll: data.dll ?? '',
        remoteCode: data.remoteCode ?? '',
        lastUpdatedBy: user.name,
    } as Omit<Order, 'id'| 'date' | 'status' | 'checklist'>;
    
    await dbCreateOrder(orderData);
  } catch (error) {
    return {
      message: 'Erro de banco de dados: Falha ao criar ordem de serviço.',
    };
  }

  revalidatePath('/orders');
  revalidatePath('/dashboard');
  redirect('/orders');
}

export async function updateOrderStatus(id: string, status: OrderStatus, user: { name: string }) {
  try {
    await dbUpdateOrderStatus(id, status, user.name);
    revalidatePath(`/orders/${id}`);
    revalidatePath('/orders');
    revalidatePath('/dashboard');
    return { message: 'Status atualizado com sucesso.' };
  } catch (error) {
    return { message: 'Erro ao atualizar status.' };
  }
}

export async function updateOrderChecklist(id: string, checklist: ChecklistItems, user: { name: string }) {
  try {
    await dbUpdateOrderChecklist(id, checklist, user.name);
    revalidatePath(`/orders/${id}`);
    return { message: 'Checklist atualizado com sucesso.' };
  } catch (error) {
    return { message: 'Erro ao atualizar checklist.' };
  }
}

const DescriptionSchema = z.string().optional();

export async function updateOrderDescription(id: string, description: string, user: { name: string }) {
  const validatedDescription = DescriptionSchema.safeParse(description);
  if (!validatedDescription.success) {
    return { message: 'Observação inválida.' };
  }

  try {
    await dbUpdateOrderDescription(id, validatedDescription.data || '', user.name);
    revalidatePath(`/orders/${id}`);
    return { message: 'Observações atualizadas com sucesso.' };
  } catch (error) {
    return { message: 'Erro ao atualizar observações.' };
  }
}

export async function deleteOrder(id: string) {
  try {
    await dbDeleteOrder(id);
    revalidatePath('/orders');
    revalidatePath('/dashboard');
    return { message: 'Ordem de serviço deletada.' };
  } catch (error) {
    return { message: 'Erro ao deletar ordem de serviço.' };
  }
}

export async function suggestTechnicianAction(input: SuggestTechnicianForOrderInput) {
    try {
        const result = await suggestTechnicianForOrder(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Falha ao sugerir técnico.' };
    }
}
