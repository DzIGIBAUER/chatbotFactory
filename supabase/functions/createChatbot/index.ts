// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "../_shared/supabase-client.ts";


serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { name, topics, temperature } = await req.json()

  const client = createClient(req);

  const { data, error } = await client
    .from("chatbots")
    .insert({
      user_id: (await client.auth.getUser()).data.user?.id,
      name,
      topics,
      temperature
    })
    .select("*")

  console.log(data, error);

  if (error) {
    return new Response(
      JSON.stringify({
        error: "Couldn't create the chatbot. An error occured."
      }),
      { headers: {...corsHeaders, "Content-Type": "application/json" } },
    )
  }

  return new Response(
    JSON.stringify(data),
    { headers: {...corsHeaders, "Content-Type": "application/json" } },
  )
})