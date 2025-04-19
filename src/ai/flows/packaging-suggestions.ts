'use server';
/**
 * @fileOverview Provides optimal packaging suggestions based on item dimensions to reduce shipping costs.
 *
 * - packagingSuggestions - A function that suggests optimal packaging solutions.
 * - PackagingSuggestionsInput - The input type for the packagingSuggestions function.
 * - PackagingSuggestionsOutput - The return type for the packagingSuggestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PackagingSuggestionsInputSchema = z.object({
  itemLength: z.number().describe('The length of the item in inches.'),
  itemWidth: z.number().describe('The width of the item in inches.'),
  itemHeight: z.number().describe('The height of the item in inches.'),
  itemWeight: z.number().describe('The weight of the item in pounds.')
});
export type PackagingSuggestionsInput = z.infer<typeof PackagingSuggestionsInputSchema>;

const PackagingSuggestionsOutputSchema = z.object({
  suggestedPackageType: z.string().describe('The suggested type of package to use (e.g., small box, padded envelope).'),
  suggestedPackageDimensions: z.string().describe('The suggested dimensions for the package in inches (e.g., 12x9x2).'),
  packagingTips: z.string().describe('Additional tips for packaging the item securely and efficiently.'),
  estimatedCostSavings: z.string().describe('Estimated cost savings by using suggested packaging solution.')
});
export type PackagingSuggestionsOutput = z.infer<typeof PackagingSuggestionsOutputSchema>;

export async function packagingSuggestions(input: PackagingSuggestionsInput): Promise<PackagingSuggestionsOutput> {
  return packagingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'packagingSuggestionsPrompt',
  input: {
    schema: z.object({
      itemLength: z.number().describe('The length of the item in inches.'),
      itemWidth: z.number().describe('The width of the item in inches.'),
      itemHeight: z.number().describe('The height of the item in inches.'),
      itemWeight: z.number().describe('The weight of the item in pounds.')
    }),
  },
  output: {
    schema: z.object({
      suggestedPackageType: z.string().describe('The suggested type of package to use (e.g., small box, padded envelope).'),
      suggestedPackageDimensions: z.string().describe('The suggested dimensions for the package in inches (e.g., 12x9x2).'),
      packagingTips: z.string().describe('Additional tips for packaging the item securely and efficiently.'),
      estimatedCostSavings: z.string().describe('Estimated cost savings by using suggested packaging solution.')
    }),
  },
  prompt: `You are an expert in packaging and shipping. Given the dimensions and weight of an item, you will suggest the optimal packaging solution to minimize shipping costs.

Item Length: {{{itemLength}}} inches
Item Width: {{{itemWidth}}} inches
Item Height: {{{itemHeight}}} inches
Item Weight: {{{itemWeight}}} pounds

Consider the following factors when determining the optimal packaging solution:

*   **Package Type:** Suggest the most appropriate type of package (e.g., small box, medium box, large box, padded envelope, tube).
*   **Package Dimensions:** Suggest the ideal dimensions for the package to minimize volume while still providing adequate protection.
*   **Packaging Tips:** Provide specific tips for packaging the item securely and efficiently (e.g., using bubble wrap, packing peanuts, proper sealing techniques).
*   **Cost Savings:** Estimate the potential cost savings compared to using a larger or less efficient packaging solution.
`
});

const packagingSuggestionsFlow = ai.defineFlow<
  typeof PackagingSuggestionsInputSchema,
  typeof PackagingSuggestionsOutputSchema
>({
  name: 'packagingSuggestionsFlow',
  inputSchema: PackagingSuggestionsInputSchema,
  outputSchema: PackagingSuggestionsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
