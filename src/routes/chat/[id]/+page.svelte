<script lang="ts">
    export let data;

    $: ({ chatbot, supabase } = data);
    $: messages = chatbot.messages as {text: string}[];
    let value = "";
    let loading = false;

    const chat = async () => {
        if (!value) return;
        loading = true;

        const { data, error } = await supabase
            .functions
            .invoke<{response: string}>("chat", {
                body: {
                    id: chatbot.id,
                    message: value
                }
            })

        if (!data || error) return;
            
        messages.push({ text: value });
        messages.push({ text: data.response });
        messages = messages;
        
        value = "";
        loading = false;
    }

</script>


<div class="flex justify-center place-items-center h-100 p-20 w-full">
    <div class="card p-8 w-full">
        <div class="variant-ghost-primary p-6 rounded">
            
            {#if messages}
                {#each messages as msg, index}
                    <div class="flex justify-{index % 2 == 0 ? 'start' : 'end'}">
                        <p class="variant-filled-{index % 2 == 0 ? 'primary' : 'secondary'} p-3 rounded">{msg.text}</p>
                    </div>
                {/each}
            {/if}


        </div>
        <div class="flex py-3">
            <input disabled={loading} bind:value class="input" />
            <button disabled={loading} on:click={chat} class="btn variant-filled-primary" type="submit">Send</button>
        </div>
    </div>
</div>
