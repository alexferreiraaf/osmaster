'use server';
/**
 * @fileOverview An AI agent to suggest a technician for a service order based on service type and client location.
 *
 * - suggestTechnicianForOrder - A function that suggests a technician for a service order.
 * - SuggestTechnicianForOrderInput - The input type for the suggestTechnicianForOrder function.
 * - SuggestTechnicianForOrderOutput - The return type for the suggestTechnicianForOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTechnicianForOrderInputSchema = z.object({
  service: z.string().describe('The type of service required for the order.'),
  clientCity: z.string().describe('The city where the client is located.'),
  clientState: z.string().describe('The state where the client is located.'),
});
export type SuggestTechnicianForOrderInput = z.infer<typeof SuggestTechnicianForOrderInputSchema>;

const SuggestTechnicianForOrderOutputSchema = z.object({
  suggestedTechnician: z.string().describe('The name of the technician suggested for the service order.'),
  reason: z.string().describe('The reason why this technician is suggested.'),
});
export type SuggestTechnicianForOrderOutput = z.infer<typeof SuggestTechnicianForOrderOutputSchema>;

export async function suggestTechnicianForOrder(input: SuggestTechnicianForOrderInput): Promise<SuggestTechnicianForOrderOutput> {
  return suggestTechnicianForOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTechnicianForOrderPrompt',
  input: {schema: SuggestTechnicianForOrderInputSchema},
  output: {schema: SuggestTechnicianForOrderOutputSchema},
  prompt: `You are an expert in assigning technicians to service orders.

  Based on the service type and client location, suggest the best technician for the job.

  Service Type: {{{service}}}
  Client Location: {{{clientCity}}}, {{{clientState}}}

  Consider technician skills, availability, and proximity to the client.
  Return the name of the suggested technician and a brief reason for the suggestion.
  Make sure that the output is valid JSON.`,
});

const suggestTechnicianForOrderFlow = ai.defineFlow(
  {
    name: 'suggestTechnicianForOrderFlow',
    inputSchema: SuggestTechnicianForOrderInputSchema,
    outputSchema: SuggestTechnicianForOrderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
