import prodsample2 from "../assets/Product-Sample2.png";
import prodsample2Webp from "../assets/Product-Sample2.webp";
import prodsample2Avif from "../assets/Product-Sample2.avif";
import { DownloadStats } from "./download-stats";

export function Hero(): string {
  return `
<div id="hero-section" class="relative w-full min-h-[100dvh] overflow-hidden bg-[#101010] font-sans lg:h-[100dvh]">

  <picture class="absolute bottom-0 right-0 block w-full h-[65dvh] lg:top-0 lg:h-full lg:w-[60%] z-0">
    <source srcset="${prodsample2Avif}" type="image/avif" />
    <source srcset="${prodsample2Webp}" type="image/webp" />
    <img
      src="${prodsample2}"
      alt="Flick Player Interface"
      width="1280"
      height="1440"
      fetchpriority="high"
      decoding="async"
      class="w-full h-full object-cover object-top lg:object-left-top"
    />
  </picture>

  <div class="absolute inset-x-0 top-0 h-[100dvh] bg-gradient-to-b from-[#101010] from-[35%] via-[#101010]/80 via-[50%] to-transparent lg:hidden z-[5]"></div>

  <div class="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#101010] from-[40%] via-[#101010]/90 via-[55%] to-transparent z-[5]"></div>

  <div class="relative z-10 flex min-h-[100dvh] w-full flex-col justify-start px-6 pt-[15vh] pb-12 md:px-12 lg:absolute lg:top-0 lg:left-0 lg:h-full lg:justify-center lg:px-16 lg:pt-24 lg:pb-0">
    
    <div class="w-full lg:w-[50%] max-w-2xl lg:pr-8 xl:pr-12 relative z-10">
      
      <h1 class="text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl font-bold text-white mb-4 tracking-tight text-balance leading-tight drop-shadow-xl lg:drop-shadow-none">
        Bit-Perfect Audio. <br>Custom Rust Engine.
      </h1>
      
      <p class="text-base md:text-lg text-gray-300 mb-6 lg:mb-8 text-left lg:text-justify hyphens-auto leading-relaxed drop-shadow-md lg:drop-shadow-none max-w-xl lg:max-w-none">
        A high-performance audiophile music player built with Flutter and Rust. Custom UAC&nbsp;2.0 support delivers bit-perfect PCM and native DSD playback through external DACs — with DAP bit-perfect via Oboe/AAudio exclusive mode.
      </p>

      <button id="download-btn" class="inline-flex items-center space-x-3 lg:space-x-4 bg-white text-black px-5 py-3 lg:px-6 lg:py-4 rounded-xl hover:bg-gray-200 transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] relative z-10">
        <div class="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lg:w-[28px] lg:h-[28px]">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </div>

        <div class="flex flex-col items-start leading-none">
          <span class="text-[15px] lg:text-[17px] font-bold tracking-tight">Download Flick</span>
          <span id="version-tag" class="text-[10px] lg:text-[11px] font-medium opacity-50 mt-1 lg:mt-1.5 uppercase tracking-wider">Loading...</span>
        </div>
      </button>

      ${DownloadStats()}
    </div>
  </div>

</div>`;
}
