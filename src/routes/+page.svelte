<script lang="ts">
	import { onMount } from "svelte";
	import { radioUrls } from "../constants";

	let isLoading = false;
	const VOLUME_KEY = "radio-volume";
	let audioElement: HTMLAudioElement | null = null;
	let selectedStation = radioUrls[0];
	let isPlaying = false;

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
			isPlaying = true;
			audioElement?.play().catch((error) => {
				console.error("Error while playing the stream: ", error);
			});
		};

		audioElement.onerror = () => {
			isLoading = false;
			console.error("Failed to load stream");
		};
	}

	function stopRadio() {
		if (audioElement) {
			audioElement.pause(); // Останавливаем воспроизведение
			audioElement.src = ""; // ❗ полностью обрывает стрим
			audioElement.load(); // ❗ сбрасывает состояние
		}
		isPlaying = false;
	}

	function updateVolume(event: Event) {
		const target = event.target as HTMLInputElement;

		if (!audioElement) return;

		const value = parseFloat(target.value);

		if (!isNaN(value)) {
			audioElement.volume = value;
			volume = value;

			localStorage.setItem(VOLUME_KEY, value.toString());
		}
	}

	let volume = 0.1;

	onMount(() => {
		const saved = localStorage.getItem(VOLUME_KEY);
		if (saved !== null) {
			const parsed = parseFloat(saved);
			if (!isNaN(parsed)) volume = parsed;
		}

		if (audioElement) audioElement.volume = volume;
	});

	function selectStation(radio: (typeof radioUrls)[number]) {
		selectedStation = radio;
		playRadio(radio.url);
	}

	function togglePlayback() {
		if (isPlaying) {
			stopRadio();
			isPlaying = false;
		} else {
			playRadio(selectedStation.url);
		}
	}

	function handleVolume(event: Event) {
		updateVolume(event);
	}
</script>

<svelte:head>
	<title>RAD-S — radio on demand</title>
	<meta name="description" content="A focused radio player for your favorite streams" />
</svelte:head>

<div class="radio-shell">
	<section class="player-panel">
		<div class="eyebrow"><span class="live-dot"></span> live broadcast</div>
		<div class="hero-copy">
			<p class="kicker">RAD-S / 001</p>
			<h1>Find your<br /><em>frequency.</em></h1>
			<p class="intro">A handpicked radio dial for long nights, slow mornings and everything in between.</p>
		</div>

		<div class="now-playing">
			<div class="station-mark">{selectedStation.name.slice(0, 1).toUpperCase()}</div>
			<div class="track-info">
				<span>{isLoading ? 'Connecting...' : isPlaying ? 'Now playing' : 'Ready to play'}</span>
				<strong>{selectedStation.name}</strong>
				<small>{selectedStation.language?.toUpperCase() ?? 'RADIO'} · live stream</small>
			</div>
			<div class:playing={isPlaying} class="equalizer" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
		</div>

		<div class="controls">
			<button class="play-button" aria-label={isPlaying ? 'Stop station' : 'Play station'} onclick={togglePlayback}>
				{#if isPlaying}<span class="stop-icon"></span>{:else}<span class="play-icon"></span>{/if}
			</button>
			<div class="volume-control">
				<span class="volume-label">VOL {Math.round(volume * 100)}</span>
				<input aria-label="Volume" type="range" min="0" max="1" step="0.01" bind:value={volume} oninput={handleVolume} />
			</div>
		</div>
		<audio id="radio" bind:this={audioElement}></audio>
	</section>

	<section class="station-panel">
		<div class="panel-heading">
			<div><span class="section-label">The dial</span><h2>Stations</h2></div>
			<span class="station-count">{radioUrls.length} channels</span>
		</div>
		<div class="station-list">
			{#each radioUrls as radio, index}
				<button class:active={selectedStation.url === radio.url} class="station-row" onclick={() => selectStation(radio)}>
					<span class="station-index">{String(index + 1).padStart(2, '0')}</span>
					<span class="station-name">{radio.name}</span>
					<span class="station-language">{radio.language?.toUpperCase() ?? 'FM'}</span>
					<span class="arrow">↗</span>
				</button>
			{/each}
		</div>
	</section>
</div>

<style>
	.radio-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, 0.78fr); min-height: calc(100vh - 92px); overflow: hidden; border: 1px solid rgba(255,255,255,.11); background: #121318; }
	.player-panel { position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 620px; padding: clamp(2rem, 5vw, 5rem); color: #f4f0e8; background: radial-gradient(circle at 75% 30%, rgba(230, 82, 47, .24), transparent 28%), linear-gradient(140deg, #171920, #101115 70%); }
	.player-panel::after { content: ''; position: absolute; right: -20%; bottom: -18%; width: 65%; aspect-ratio: 1; border: 1px solid rgba(239, 103, 65, .28); border-radius: 50%; box-shadow: 0 0 0 34px rgba(239, 103, 65, .04), 0 0 0 70px rgba(239, 103, 65, .035); pointer-events: none; }
	.eyebrow, .kicker, .section-label, .volume-label, .station-language, .station-count { font: 500 .68rem/1.2 'Fira Mono', monospace; letter-spacing: .12em; text-transform: uppercase; }
	.eyebrow { display: flex; align-items: center; gap: .6rem; color: #ef6748; }
	.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #ef6748; box-shadow: 0 0 0 5px rgba(239, 103, 72, .16); }
	.hero-copy { position: relative; z-index: 1; margin: auto 0; padding: 5rem 0 4rem; }
	.kicker { margin: 0 0 1.8rem; color: #8d909b; }
	h1 { max-width: 680px; margin: 0; font: 500 clamp(3.5rem, 7vw, 7.5rem)/.87 Georgia, serif; letter-spacing: -.04em; text-align: left; }
	h1 em { color: #ef6748; font-style: italic; }
	.intro { max-width: 350px; margin: 2rem 0 0; color: #a8a9b0; font-size: .95rem; line-height: 1.65; }
	.now-playing { position: relative; z-index: 1; display: flex; align-items: center; gap: 1rem; max-width: 520px; padding: 1rem 0; border-top: 1px solid rgba(255,255,255,.15); border-bottom: 1px solid rgba(255,255,255,.15); }
	.station-mark { display: grid; width: 52px; height: 52px; flex: 0 0 52px; place-items: center; color: #18191e; background: #ef6748; font: 600 1.5rem Georgia, serif; }
	.track-info { display: grid; gap: .26rem; min-width: 0; }
	.track-info span, .track-info small { color: #8d909b; font: .65rem 'Fira Mono', monospace; text-transform: uppercase; letter-spacing: .08em; }
	.track-info strong { overflow: hidden; color: #f4f0e8; font: 500 1.18rem Georgia, serif; text-overflow: ellipsis; white-space: nowrap; }
	.equalizer { display: flex; align-items: end; gap: 3px; height: 24px; margin-left: auto; }
	.equalizer i { display: block; width: 3px; height: 7px; background: #ef6748; }
	.equalizer.playing i { animation: equalize .8s ease-in-out infinite alternate; }
	.equalizer i:nth-child(2) { height: 15px; animation-delay: .2s; }.equalizer i:nth-child(3) { height: 11px; animation-delay: .4s; }.equalizer i:nth-child(4) { height: 19px; animation-delay: .1s; }
	@keyframes equalize { to { height: 22px; } }
	.controls { position: relative; z-index: 1; display: flex; align-items: center; gap: 1.6rem; padding-top: 1.5rem; }
	.play-button { display: grid; width: 54px; height: 54px; flex: 0 0 54px; place-items: center; border: 0; border-radius: 50%; color: #18191e; background: #f4f0e8; cursor: pointer; transition: transform .2s, background .2s; }
	.play-button:hover { transform: scale(1.06); background: #ef6748; }.play-icon { width: 0; height: 0; margin-left: 3px; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 11px solid currentColor; }.stop-icon { width: 12px; height: 12px; background: currentColor; }
	.volume-control { display: flex; align-items: center; gap: 1rem; width: min(220px, 55vw); }.volume-label { color: #8d909b; white-space: nowrap; } input[type='range'] { width: 100%; accent-color: #ef6748; cursor: pointer; }
	.station-panel { min-height: 0; padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 4vw, 4rem); color: #202126; background: #e9e4d8; }
	.panel-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.2rem; border-bottom: 1px solid rgba(32,33,38,.2); }.section-label { color: #ef6748; }.panel-heading h2 { margin: .35rem 0 0; font: 500 2.7rem/.9 Georgia, serif; }.station-count { color: #77756e; }
	.station-list { max-height: calc(100vh - 210px); overflow-y: auto; }.station-row { display: grid; grid-template-columns: 2.4rem 1fr auto 1.4rem; align-items: center; width: 100%; padding: 1rem 0; border: 0; border-bottom: 1px solid rgba(32,33,38,.13); color: #202126; background: transparent; text-align: left; cursor: pointer; transition: padding .2s, color .2s; }.station-row:hover, .station-row.active { padding-left: .5rem; color: #ef6748; }.station-index { color: #96938a; font: .65rem 'Fira Mono', monospace; }.station-name { font: 1rem Georgia, serif; }.station-language { color: #96938a; font-size: .58rem; }.arrow { font-size: 1.2rem; opacity: .4; }.station-row.active .arrow { opacity: 1; }
	@media (max-width: 820px) { .radio-shell { grid-template-columns: 1fr; }.player-panel { min-height: 590px; }.station-list { max-height: 420px; } }
	@media (max-width: 480px) { .player-panel { min-height: 560px; padding: 1.5rem; }.hero-copy { padding: 4rem 0 3rem; } h1 { font-size: 3.7rem; }.station-panel { padding: 2rem 1.5rem; }.station-row { grid-template-columns: 2rem 1fr auto 1rem; } }
</style>
