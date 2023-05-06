// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";

import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { topics }: { topics: string[] } = await req.json()

  const model = new OpenAI( {modelName: "gpt-3.5-turbo-0301", temperature: 0} );

  const template = `
    Given a JSON list of topics, tell me if topics are valid by outputting a JSON list of same length but with Boolean values of whether topic at that index is valid or not. NO DOT reply with anything else.
    Example of output: {{"valid": [false, true, true, false]}}.
    Topics: {topics}
  `;
  const prompt = new PromptTemplate({ template, inputVariables: ["topics"] });

  const formattedPrompt = await prompt.format({ topics: JSON.stringify(topics) });

  const resA = await model.call(formattedPrompt);
  console.log(resA);
  return new Response(
    resA,
    { headers: {...corsHeaders, "Content-Type": "application/json" } },
  )
})
