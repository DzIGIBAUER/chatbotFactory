// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { HumanChatMessage, AIChatMessage } from "langchain/schema";

import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "../_shared/supabase-client.ts";

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { id, message } = await req.json()

  const client = createClient(req);

  const { data, error } = await client
    .from("chatbots")
    .select("*")
    .eq("id", id)
    .single();
  
  if (!data || error) {
    return new Response(
      JSON.stringify({
        "error": "Unexpected error"
      }),
      { headers: {...corsHeaders, "Content-Type": "application/json" } },
    )
  }

  const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo-0301", temperature: data.temperature })
  // @ts-ignore jbg
  Deno.env.LANGCHAIN_HANDLER = "langchain";

  const topic = data.topics.join(" and ");
  const template = `
  ${topic} assistant is a large language model trained by OpenAI.

  ${topic} assistant is designed to be able to assist with a wide range of ${topic} tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of ${topic} topics. As a language model, ${topic} assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.
  
  ${topic} assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of ${topic} questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of ${topic} topics.
  
  Overall, ${topic} assistant is a powerful system that can help with a wide range of ${topic} tasks and provide valuable insights and information on a wide range of ${topic} topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, ${topic} assistant is here to assist.
  Now, answer the following question: {input}.
  `;
  //const prompt = new PromptTemplate({ template, inputVariables: ["topics"] });

  //const formattedPrompt = await prompt.format({ topics: data.topics.join(" and ") });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate(template),
  ]);

  const pastMessages = data.messages ? data.messages.map((msg: {text: string}, i: number) => {
    return (i % 2 == 0 ? new HumanChatMessage(msg.text) : new AIChatMessage(msg.text));
  }) : [];

  console.log(pastMessages);

  const chain = new ConversationChain({
    memory: new BufferMemory({ returnMessages: true, memoryKey: "history", chatHistory: new ChatMessageHistory(pastMessages) }),
    prompt: chatPrompt,
    llm: model,
  });

  const response = await chain.call({
    input: message,
  });

  const { data: dta, error: der } = await client
    .from("chatbots")
    .update({
      messages: (chain.memory as BufferMemory).chatHistory.messages
    })
    .eq("id", id)
    .select("*");

  return new Response(
    JSON.stringify(response),
    { headers: {...corsHeaders, "Content-Type": "application/json" } },
  )
})
