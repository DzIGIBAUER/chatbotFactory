<script lang="ts">
    export let data;

    $: ({ chatbots } = data)

</script>

<div class="flex justify-center place-items-center h-100 p-20 w-full">
    <div class="card p-8 w-full">
        <ul class="list">
            <h2>Chatbots</h2>
            {#if chatbots}
                {#each chatbots as chatbot}
                    <li>
                        <a href="/chat/{chatbot.id}" class="variant-glass-primary w-full rounded p-4">
                            <div >
                                <span class="flex-auto">
                                    <dt>{chatbot.name}</dt>
                                    <dd>Topics: {chatbot.topics.join(",")}</dd>
                                </span>
                            </div>
                        </a>
                    </li>
                {/each}
            {:else}
                <p>You have no chatbots. You can <a href="/create">create</a> one now.</p>
            {/if}
        </ul>
    </div>
</div>



