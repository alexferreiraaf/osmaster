'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addEmployee, deleteEmployee as dbDeleteEmployee } from '@/lib/data';

const EmployeeSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
});

export async function addEmployeeAction(formData: FormData) {
  const validatedFields = EmployeeSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Nome inválido.',
    };
  }

  try {
    await addEmployee(validatedFields.data.name);
    revalidatePath('/settings');
    revalidatePath('/orders/new');
    return { success: true, message: `Técnico ${validatedFields.data.name} adicionado.` };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || 'Falha ao adicionar técnico.',
    };
  }
}

export async function deleteEmployeeAction(name: string) {
  try {
    await dbDeleteEmployee(name);
    revalidatePath('/settings');
    revalidatePath('/orders/new');
    revalidatePath('/orders');
    return { success: true, message: `Técnico ${name} removido.` };
  } catch (error) {
    return {
      success: false,
      message: 'Falha ao remover técnico.',
    };
  }
}
