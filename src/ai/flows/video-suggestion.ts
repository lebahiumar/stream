'use server';

/**
 * @fileOverview Personalized video suggestion flow.
 *
 * - getVideoSuggestions - A function that takes a user's viewing history and returns personalized video suggestions.
 * - VideoSuggestionInput - The input type for the getVideoSuggestions function.
 * - VideoSuggestionOutput - The return type for the getVideoSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VideoSuggestionInputSchema = z.object({
  viewingHistory: z
    .string()
    .describe("A comma separated list of video titles the user has watched.  For example: 'Funny Cat Videos, How to Cook Pasta, Best Action Movies'."),
});
export type VideoSuggestionInput = z.infer<typeof VideoSuggestionInputSchema>;

const VideoSuggestionOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A comma separated list of video titles that the user might like based on their viewing history.'),
});
export type VideoSuggestionOutput = z.infer<typeof VideoSuggestionOutputSchema>;

export async function getVideoSuggestions(input: VideoSuggestionInput): Promise<VideoSuggestionOutput> {
  return videoSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'videoSuggestionPrompt',
  input: {schema: VideoSuggestionInputSchema},
  output: {schema: VideoSuggestionOutputSchema},
  prompt: `You are a video recommendation expert. Given a user's viewing history, you will suggest other videos they might like. 

Here is the user's viewing history: {{{viewingHistory}}}

Based on this viewing history, what videos would you recommend?  Return the list as a comma separated list of video titles.`,
});

const videoSuggestionFlow = ai.defineFlow(
  {
    name: 'videoSuggestionFlow',
    inputSchema: VideoSuggestionInputSchema,
    outputSchema: VideoSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
