import { REPO_URL } from "../site";

const BENCHMARK_URL = `${REPO_URL}/blob/main/docs/scanning_benchmark05092026.md`;

export function Specs(): string {
  return `
<section class="bg-[#101010] text-white py-24 relative z-20 border-t border-white/5">
  <div class="max-w-7xl mx-auto px-6 lg:px-16">
    
    <div class="mb-16" data-animate="fade-up">
      <h2 class="text-2xl md:text-3xl font-bold tracking-tight mb-4">Under the Hood</h2>
      <p class="text-gray-400 text-lg max-w-2xl">
        The granular details and architectural decisions that make Flick Player an audiophile-grade powerhouse.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16" data-animate-stagger="[data-animate-child]" data-animate-stagger-delay="0.15" data-animate-duration="0.6">
      
      <div data-animate-child>
        <h3 class="text-lg font-bold mb-6 tracking-wide text-white border-b border-white/10 pb-3">Audio Pipeline &amp; DSP</h3>
        <ul class="space-y-4">
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Rust Audio Engine:</strong> Custom UAC&nbsp;2.0 implementation for bit-perfect PCM and native DSD via isochronous USB transfers.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>DAP Bit-Perfect:</strong> Oboe/AAudio exclusive mode with device qualification for confirmed high-resolution internal DACs.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>31-Band EQ &amp; FX:</strong> Full 1/3-octave ISO equalizer with dynamics, spatial/time effects, and parametric band support.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Gapless &amp; Crossfade:</strong> Configurable crossfade and gapless transitions. DSD DoP/DSD transport via I32 integer streams.</span>
          </li>
        </ul>
      </div>

      <div data-animate-child>
        <h3 class="text-lg font-bold mb-6 tracking-wide text-white border-b border-white/10 pb-3">Library &amp; Metadata</h3>
        <ul class="space-y-4">
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>MediaStore Sync:</strong> Differential database sync <a href="${BENCHMARK_URL}" target="_blank" rel="noopener" class="text-gray-300 underline decoration-gray-500 underline-offset-4 hover:text-white hover:decoration-white">~34× faster</a> than filesystem walk, with background change observer.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Deep Metadata:</strong> ID3, Vorbis, and DSD tag extraction via <code class="bg-white/10 px-1 py-0.5 rounded text-[11px]">lofty</code>, <code class="bg-white/10 px-1 py-0.5 rounded text-[11px]">dsf-meta</code>, and <code class="bg-white/10 px-1 py-0.5 rounded text-[11px]">dff-meta</code>.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Album Art Import:</strong> Search and import from MusicBrainz, iTunes, and Deezer. Rip log metadata and CUE sheet support.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Metadata Editor:</strong> Full tag editing (title, artist, album, year, genre, track) via Rust backend with SAF file writing.</span>
          </li>
        </ul>
      </div>

      <div data-animate-child>
        <h3 class="text-lg font-bold mb-6 tracking-wide text-white border-b border-white/10 pb-3">Interface &amp; Interaction</h3>
        <ul class="space-y-4">
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Adaptive Theming:</strong> Dynamic color extraction from album art with glassmorphism design and 120&nbsp;Hz responsiveness.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Queue &amp; Multi-Select:</strong> Drag-to-reorder queue, batch actions for queue/favorite, and swipe-to-dismiss.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Immersive Full View:</strong> Full-bleed album art with auto-hiding controls and vinyl disc morph animation.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Customizable Layout:</strong> Reorderable bottom nav, configurable player action buttons, and fast-index scroll overlay.</span>
          </li>
        </ul>
      </div>

      <div data-animate-child>
        <h3 class="text-lg font-bold mb-6 tracking-wide text-white border-b border-white/10 pb-3">Ecosystem &amp; Extras</h3>
        <ul class="space-y-4">
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Moss Ecosystem:</strong> Cross-app playback handoff with Locker. Shared Last.fm scrobbling, theming, and library scanning infrastructure.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Flick Replay:</strong> Listening recaps with hero cards, ranked posters, and gallery export across daily to yearly ranges.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Home Widgets:</strong> Mini player and flagship Android widgets with theme support, working even when the app is killed.</span>
          </li>
          <li class="flex items-start text-sm text-gray-400 leading-relaxed">
            <svg class="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>Milestone Tracking:</strong> Achievement milestones for songs played and listening time, with celebration cards and trophy case.</span>
          </li>
        </ul>
      </div>

    </div>
  </div>
</section>`;
}
