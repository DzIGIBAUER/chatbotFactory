import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent, params }) => {
    
    const { supabase } = await parent();

    const { data: cData, error: sError } = await supabase
        .from("chatbots")
        .select("*")
        .eq("id", params.id)
        .single();

    if (!cData)
        throw error(404, "not found");

    return {
        chatbot: cData
    };
}) satisfies PageLoad;

