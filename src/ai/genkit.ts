import {genkit} from 'genkit';
import {firebase} from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [firebase()],
  model: 'googleai/gemini-2.5-flash',
});
