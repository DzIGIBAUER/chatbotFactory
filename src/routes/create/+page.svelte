<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
    import { InputChip, ProgressRadial, RangeSlider } from '@skeletonlabs/skeleton';
    

    let inputChip = '';
    let inputChipList: string[] = ['Programming'];
    let loading = false;

    let temperature: number;
    let max = 1;

    export let data;

    $: ({ supabase, session } = data);

    $: if (!data.session && browser) goto("/");


    const createChatbot = async () => {
        loading = true;
        
        const { data: vData, error: vError } = await supabase
            .functions
            .invoke<{valid: boolean[]}>("validateTopics", {
                body: {
                    topics: inputChipList
                }
            });
        
        if (!vData || vError) return;

        vData.valid.map((valid, i) => {
            if (valid) return;
            const topic = inputChipList[i];
            console.log(`Topic ${topic} is not valid.`);
        })

        if (vData.valid.some(valid => !valid)) {
            alert("cant proceed");
        }
        
        const { data: cData, error: cError } = await supabase
            .functions
            .invoke("createChatbot", {
                body: {
                    name: "test",
                    topics: inputChipList,
                    temperature
                }
            })
        
        console.log(cData);
        
        loading = false;
    }

</script>

<div class="flex justify-center place-items-center h-100 p-20">
    <div class="card p-8 mx-20 max-w-md">
        <h2 class="pb-5">Create a chatbot</h2>
        <InputChip
            bind:input={inputChip}
            bind:value={inputChipList}
            required
            allowDuplicates={false}
            max={5}
            maxlength={20}
            name="chips"
        />
        <RangeSlider
            bind:max
            bind:value={temperature}
            name="temperature"
            step={0.1}
            ticked
        >
            <div class="flex justify-between items-center">
                <div class="font-bold">Model temperature</div>
                <div class="text-xs">{temperature} / {max}</div>
            </div>
        </RangeSlider>
        <div class="flex justify-end py-3">
            {#if loading}
                <ProgressRadial width="w-10" />
            {/if}
            <button
                on:click={createChatbot}
                class="btn variant-filled-primary mx-2"
                type="submit"
                disabled={loading}
            >
                Create
            </button>
        </div>
    </div>
</div>