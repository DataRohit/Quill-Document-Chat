import OpenAI from 'openai';

export const openai = new OpenAI({
	apiKey: "lm-studio",
	baseURL: process.env.LM_STUDIO_SERVER,
});
