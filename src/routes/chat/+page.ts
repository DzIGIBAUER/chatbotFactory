import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
    
    const { supabase } = await parent();

    const { data, error } = await supabase
        .from("chatbots")
        .select("*")

    return {
        chatbots: data
    };
}) satisfies PageLoad;

