import { REPO_URL } from "../site";

const BENCHMARK_URL = `${REPO_URL}/blob/main/docs/scanning_benchmark05092026.md`;

export function Features(): string {
  return `
<section class="bg-[#101010] text-white py-24 md:py-32 relative z-20 border-t border-white/5">
  <div class="max-w-7xl mx-auto px-6 lg:px-16">
    
    <div class="mb-16 md:mb-20" data-animate="fade-up">
      <h2 class="text-3xl md:text-5xl font-bold tracking-tight mb-5 text-balance">
        Engineered for the Ear. <br>Coded for the DAC.
      </h2>
      <p class="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">
        We stripped away the bloat and built a custom Rust audio engine from the ground up, delivering bit-perfect PCM and native DSD straight to your DAC.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-animate-stagger="[data-animate-child]" data-animate-stagger-delay="0.12">
      
      <div data-animate-child class="lg:col-span-2 bg-[#1A1A1A] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col h-full min-h-[300px]">
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
        <div class="relative z-10 h-full flex flex-col justify-between">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 flex-shrink-0 text-gray-400 mb-6"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
          <div>
            <h3 class="text-2xl font-bold mb-3 tracking-tight">Custom Rust Audio Engine &amp; UAC&nbsp;2.0</h3>
            <p class="text-gray-400 leading-relaxed max-w-md">
              Bit-perfect PCM and native DSD playback through external USB DACs via a custom Rust UAC&nbsp;2.0 implementation. DAP bit-perfect through Oboe/AAudio exclusive mode with device qualification.
            </p>
            <div class="flex gap-2 mt-5 flex-wrap">
              <span class="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-white/10 rounded text-white border border-white/10">Bit-Perfect PCM</span>
              <span class="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-white/10 rounded text-white border border-white/10">Native DSD</span>
              <span class="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-white/10 rounded text-white border border-white/10">DAP Optimized</span>
            </div>
          </div>
        </div>
      </div>

      <div data-animate-child class="bg-[#1A1A1A] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-between h-full min-h-[300px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 flex-shrink-0 text-gray-400 mb-6"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 12h6"/></svg>
        <div>
          <h3 class="text-xl font-bold mb-3 tracking-tight">31-Band Parametric EQ</h3>
          <p class="text-gray-400 leading-relaxed text-sm">
            Full 1/3-octave ISO frequency equalizer (20&nbsp;Hz–20&nbsp;kHz) with horizontal band editors, preamp control, and preset import/export in JSON and TXT formats.
          </p>
        </div>
      </div>

      <div data-animate-child class="bg-[#1A1A1A] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-between h-full min-h-[300px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 flex-shrink-0 text-gray-400 mb-6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        <div>
          <h3 class="text-xl font-bold mb-3 tracking-tight">DSD Playback</h3>
          <p class="text-gray-400 leading-relaxed text-sm">
            Native DSD, DoP, and PCM decimation output for DSF, DFF, and WavPack DSD files. Quirk-based byte ordering and multi-byte interleaved payload packing for DAC compatibility.
          </p>
        </div>
      </div>

      <div data-animate-child class="bg-[#1A1A1A] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-between h-full min-h-[300px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 flex-shrink-0 text-gray-400 mb-6"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        <div>
          <h3 class="text-xl font-bold mb-3 tracking-tight">Smart Library</h3>
          <p class="text-gray-400 leading-relaxed text-sm">
            MediaStore-based scanning with differential database sync (<a href="${BENCHMARK_URL}" target="_blank" rel="noopener" class="text-gray-300 underline decoration-gray-500 underline-offset-4 hover:text-white hover:decoration-white">~34× faster</a> than a filesystem walk, per the project's HiBy R4 benchmark). Deep metadata extraction, duplicate cleaner, CUE sheet support, and Isar-powered queries.
          </p>
        </div>
      </div>

      <div data-animate-child class="bg-[#1A1A1A] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-between h-full min-h-[300px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 flex-shrink-0 text-gray-400 mb-6"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
        <div>
          <h3 class="text-xl font-bold mb-3 tracking-tight">Adaptive UI &amp; Visualizer</h3>
          <p class="text-gray-400 leading-relaxed text-sm">
            Glassmorphism design with adaptive theming from album art, 120&nbsp;Hz support, real-time FFT visualizer with five animation styles, and tap-to-morph vinyl disc animation.
          </p>
        </div>
      </div>

      <div data-animate-child class="lg:col-span-2 bg-[#1A1A1A] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col h-full min-h-[300px]">
        <div class="absolute -bottom-10 -right-10 w-[70%] h-[120%] bg-gradient-to-tl from-white/5 to-transparent rounded-tl-[4rem] pointer-events-none"></div>
        <div class="relative z-10 h-full flex flex-col justify-between">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 flex-shrink-0 text-gray-400 mb-6"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
          <div>
            <h3 class="text-2xl font-bold mb-3 tracking-tight">Flick Replay &amp; Home Widget</h3>
            <p class="text-gray-400 leading-relaxed max-w-md">
              Daily, weekly, monthly, and yearly listening recaps with hero cards, ranked top songs and artists posters, and gallery export. Native Android home screen widgets — mini player and flagship — work even when the app is killed.
            </p>
            <div class="flex gap-2 mt-5 flex-wrap">
              <span class="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-white/10 rounded text-white border border-white/10">Listening Recaps</span>
              <span class="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-white/10 rounded text-white border border-white/10">Home Widget</span>
            </div>
          </div>
        </div>
      </div>

      <div data-animate-child class="bg-[#1A1A1A] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-between h-full min-h-[300px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 flex-shrink-0 text-gray-400 mb-6"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
        <div>
          <h3 class="text-xl font-bold mb-3 tracking-tight">Lyrics &amp; More</h3>
          <p class="text-gray-400 leading-relaxed text-sm">
            Search synced lyrics from LRCLib, edit timestamps in the built-in Lyrics Sync Studio, share songs as custom cards, rate with stars, scrobble to Last.fm, and crossfade between tracks.
          </p>
        </div>
      </div>

    </div>
  </div>
</section>`;
}
