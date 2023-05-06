<script lang="ts">
    import { Auth } from "@supabase/auth-ui-svelte";
    import { ThemeMinimal } from "@supabase/auth-ui-shared";
	import { goto } from "$app/navigation";

    export let data;

    $: ({ supabase, session } = data);
    
    $: if (session) {
        goto("/");
    }
</script>

<Auth
    supabaseClient={supabase}
    view="magic_link"
    appearance={{
        theme: ThemeMinimal
    }}
/>
