'use server';

import { suggestTechnicianForOrder, type SuggestTechnicianForOrderInput } from '@/ai/flows/suggest-technician-for-order';

export async function suggestTechnicianAction(input: SuggestTechnicianForOrderInput) {
    try {
        const result = await suggestTechnicianForOrder(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Falha ao sugerir técnico.' };
    }
}
