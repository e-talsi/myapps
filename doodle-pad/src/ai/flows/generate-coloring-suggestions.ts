// Use server directive is required for all Genkit flows.
'use server';

/**
 * @fileOverview AI-powered coloring suggestion flow for assisting young artists.
 *
 * - generateColoringSuggestions - A function that suggests colors based on the user's drawing.
 * - GenerateColoringSuggestionsInput - The input type for the generateColoringSuggestions function.
 * - GenerateColoringSuggestionsOutput - The return type for the generateColoringSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateColoringSuggestionsInputSchema = z.object({
  drawingDataUri: z
    .string()
    .describe(
      "A drawing as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' indicating the user's current drawing."
    ),
});
export type GenerateColoringSuggestionsInput = z.infer<
  typeof GenerateColoringSuggestionsInputSchema
>;

const GenerateColoringSuggestionsOutputSchema = z.object({
  suggestedColors: z
    .array(z.string())
    .describe('An array of suggested colors in hexadecimal format.'),
});
export type GenerateColoringSuggestionsOutput = z.infer<
  typeof GenerateColoringSuggestionsOutputSchema
>;

export async function generateColoringSuggestions(
  input: GenerateColoringSuggestionsInput
): Promise<GenerateColoringSuggestionsOutput> {
  return generateColoringSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateColoringSuggestionsPrompt',
  input: {schema: GenerateColoringSuggestionsInputSchema},
  output: {schema: GenerateColoringSuggestionsOutputSchema},
  prompt: `You are a helpful AI assistant that is used to suggest coloring for children's drawings.

  Based on the drawing provided, suggest a palette of colors that would be suitable for coloring it in. Respond with an array of hexadecimal color codes.

  Drawing: {{media url=drawingDataUri}}`,
});

const generateColoringSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateColoringSuggestionsFlow',
    inputSchema: GenerateColoringSuggestionsInputSchema,
    outputSchema: GenerateColoringSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
