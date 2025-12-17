<script lang="ts">
	import { resolve } from "$app/paths";
	import { onMount } from "svelte";
    import { radioUrls } from "../../constants"; 

	let isLoading = false;
	const VOLUME_KEY = "radio-volume";
	let audioElement: HTMLAudioElement | null = null;
	let sliderVisible = false;
	let slider: HTMLInputElement;


	// Функция для установки потока
	function playRadio(url: string) {
		if (!audioElement) return;
		// URL потока
		

		// Показать лоадер
		isLoading = true;

		// Назначаем источник
		audioElement.src = url;

		// Ждём, пока поток будет готов
		audioElement.load();
		audioElement.oncanplay = () => {
			isLoading = false;
			audioElement?.play().catch((error) => {
				console.error("Error while playing the stream: ", error);
			});
		};

		audioElement.onerror = () => {
			isLoading = false;
			console.error("Failed to load stream");
		};
	}

	// Вызываем функцию для старта радио

	function stopRadio() {
		if (audioElement) {
			audioElement.pause(); // Останавливаем воспроизведение
			audioElement.src = ""; // ❗ полностью обрывает стрим
			audioElement.load(); // ❗ сбрасывает состояние
		}
	}


	function updateVolume(event: Event) {
		const target = event.target as HTMLInputElement;

		if (!audioElement) return; // защита если элемента нет
		if (!target) return; // защита от несуществующей цели

		const value = parseFloat(target.value); // input → number

		if (!isNaN(value)) {
			audioElement.volume = value; // присваиваем громкость
			volume = value; // если volume — это Svelte переменная

			localStorage.setItem(VOLUME_KEY, value.toString());
		}
	}

	let volume = 0.1;

	onMount(() => {
		console.log("mounted")
		const saved = localStorage.getItem(VOLUME_KEY);
		if (saved !== null) {
			const parsed = parseFloat(saved);
			if (!isNaN(parsed)) volume = parsed;
		}

		if (slider) {
			sliderVisible = true; // делаем ползунок видимым
		}

		// После установки volume применяем к аудио
		if (audioElement) audioElement.volume = volume;
	});
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<h1>About this app</h1>

	<p>
		This is a <a href="https://svelte.dev/docs/kit">SvelteKit</a> app. You can
		make your own by typing the following into your command line and following
		the prompts:
	</p>
	{#each radioUrls as radio}
		<button
			on:click={() => playRadio(radio.url)}
			class="bg-red-200 p-2 my-2 rounded-xl cursor-pointer"
			>{radio.name}</button
		>
	{/each}
	<button
		on:click={stopRadio}
		class="bg-gray-300 p-2 my-2 rounded-xl cursor-pointer"
	>
		Stop
	</button>
	{#if isLoading}
		<div class="loader">Loading...</div>
	{/if}

	<audio id="radio" controls class="hidden" bind:this={audioElement}>
		Your browser does not support the audio element.
	</audio>
	<input
		type="range"
		min="0"
		max="1"
		step="0.01"
		bind:value={volume}
		on:input={updateVolume}
		class="
    w-64 h-2
    rounded-lg appearance-none cursor-pointer
    bg-gray-300 dark:bg-gray-700
    accent-blue-500

    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:h-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-blue-400
    [&::-webkit-slider-thumb]:hover:bg-blue-600
    [&::-webkit-slider-thumb]:active:bg-blue-700

    [&::-moz-range-thumb]:w-4
    [&::-moz-range-thumb]:h-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-blue-500
	slider {sliderVisible ? '' : 'slider-hidden'}"
	bind:this={slider}

	/>

	<pre>npx sv create</pre>

	<p>
		The page you're looking at is purely static HTML, with no client-side
		interactivity needed. Because of that, we don't need to load any
		JavaScript. Try viewing the page's source, or opening the devtools
		network panel and reloading.
	</p>

	<p>
		The <a href={resolve("/sverdle")}>Sverdle</a> page illustrates SvelteKit's
		data loading and form handling. Try using it with JavaScript disabled!
	</p>
</div>


<style>
	/* Скрываем ползунок */
	.slider-hidden::-webkit-slider-thumb {
		display: none;
	}
	.slider-hidden::-moz-range-thumb {
		display: none;
	}
</style>