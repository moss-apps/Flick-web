export function DownloadsPage(): string {
  return `
<section id="downloads-view" class="min-h-screen bg-[#101010] text-white pt-28 md:pt-36 pb-16 md:pb-20 relative overflow-hidden">
  <div class="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_50%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none"></div>

  <div class="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
    <div class="max-w-4xl" data-animate="fade-up">
      <p class="text-[11px] font-bold tracking-[0.28em] uppercase text-gray-500">
        Flick Downloads
      </p>
      <h1 class="mt-4 text-4xl md:text-6xl font-bold tracking-tight leading-tight text-balance">
        Get the latest Flick APK.
      </h1>
      <p class="mt-5 text-base md:text-xl text-gray-400 leading-relaxed max-w-3xl">
        Grab the APK straight from GitHub, or install through the Play Store. Scan a QR code or tap a button either way.
      </p>
    </div>

    <div class="mt-12 space-y-6">
      <section class="rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-[#181818] to-[#111111] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]" data-animate="fade-up" data-animate-delay="0.08">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[11px] font-bold tracking-[0.24em] uppercase text-gray-500">Android APK</p>
            <h2 class="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-balance">
              Direct download via QR or button
            </h2>
          </div>
          <p class="max-w-xl text-sm text-gray-400 leading-relaxed">
            Always points to the current GitHub release so you get the latest build straight from the source.
          </p>
        </div>

        <div class="mt-8 space-y-4">
          <article class="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 md:p-6">
            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-center">
              <div class="min-w-0">
                <div class="flex flex-col gap-3 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Hi-Fi Player</p>
                    <h3 class="mt-2 text-xl md:text-2xl font-semibold tracking-tight text-white">Flick</h3>
                    <p class="mt-2 max-w-2xl text-sm text-gray-400 leading-relaxed">Bit-perfect playback, fast scanning, and DAC-aware audio built for the main listening experience.</p>
                  </div>

                  <div class="flex flex-wrap gap-2 lg:justify-end">
                    <span id="flick-card-version-tag" class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-300">
                      Loading...
                    </span>
                    <span id="flick-card-size-tag" class="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Size pending
                    </span>
                  </div>
                </div>

                <div class="mt-5 grid gap-3 md:grid-cols-3">
                  <div class="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Role</p>
                    <p class="mt-2 text-sm font-medium text-white">Primary player</p>
                  </div>
                  <div class="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Source</p>
                    <p class="mt-2 text-sm font-medium text-white">GitHub releases</p>
                  </div>
                  <div class="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Install</p>
                    <p class="mt-2 text-sm font-medium text-white">Scan or tap</p>
                  </div>
                </div>

                <p class="mt-5 text-sm text-gray-300 leading-relaxed">
                  Scan for the direct Android APK, or use the download button if you are already browsing on your phone.
                </p>

                <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button id="flick-card-download-btn" class="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold tracking-tight text-black transition-all hover:bg-gray-200 active:scale-95 cursor-pointer sm:w-auto">
                    Download Flick APK
                  </button>
                  <a href="https://github.com/ultraelectronica/Flick/releases" target="_blank" rel="noopener" class="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold tracking-tight text-white transition-all hover:bg-white/10 sm:w-auto">
                    View release feed
                  </a>
                </div>
              </div>

              <div class="mx-auto w-full max-w-[15rem] rounded-[1.45rem] border border-white/8 bg-white p-4 shadow-[0_0_24px_rgba(255,255,255,0.08)]">
                <div id="flick-qr-code" class="aspect-square w-full overflow-hidden rounded-[1.1rem] bg-[#F5F5F5] text-center text-[11px] font-medium text-gray-500">
                  Generating QR...
                </div>
                <p class="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  Scan on Android
                </p>
              </div>
            </div>
          </article>

          <article id="prerelease-card-article" class="hidden rounded-[1.6rem] border border-amber-500/15 bg-amber-500/[0.03] p-5 md:p-6">
            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-center">
              <div class="min-w-0">
                <div class="flex flex-col gap-3 border-b border-amber-500/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400/80">Pre-release</p>
                    <h3 class="mt-2 text-xl md:text-2xl font-semibold tracking-tight text-white">Flick (Pre-release)</h3>
                    <p class="mt-2 max-w-2xl text-sm text-gray-400 leading-relaxed">Bleeding-edge build for testers. Help us find errors and improvements before the next stable release. Stability not guaranteed.</p>
                  </div>

                  <div class="flex flex-wrap gap-2 lg:justify-end">
                    <span id="prerelease-version-tag" class="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                      Loading...
                    </span>
                    <span id="prerelease-size-tag" class="rounded-full border border-amber-500/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100/70">
                      Size pending
                    </span>
                  </div>
                </div>

                <p class="mt-5 text-sm text-gray-300 leading-relaxed">
                  Scan to install the latest pre-release build, or tap the download button if you are already on your phone.
                </p>

                <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button id="prerelease-download-btn" class="inline-flex w-full items-center justify-center rounded-xl border border-amber-500/20 bg-amber-400 px-4 py-3 text-sm font-semibold tracking-tight text-black transition-all hover:bg-amber-300 active:scale-95 cursor-pointer sm:w-auto">
                    Download Pre-release APK
                  </button>
                  <a id="prerelease-release-link" href="https://github.com/ultraelectronica/Flick/releases" target="_blank" rel="noopener" class="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold tracking-tight text-white transition-all hover:bg-white/10 sm:w-auto">
                    View pre-release notes
                  </a>
                </div>
              </div>

              <div class="mx-auto w-full max-w-[15rem] rounded-[1.45rem] border border-amber-500/10 bg-white p-4 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
                <div id="prerelease-qr-code" class="aspect-square w-full overflow-hidden rounded-[1.1rem] bg-[#F5F5F5] text-center text-[11px] font-medium text-gray-500">
                  Generating QR...
                </div>
                <p class="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  Scan on Android
                </p>
              </div>
            </div>
          </article>

          <article class="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 md:p-6">
            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-center">
              <div class="min-w-0">
                <div class="flex flex-col gap-3 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Play Store</p>
                    <h3 class="mt-2 text-xl md:text-2xl font-semibold tracking-tight text-white">Flick on Google Play</h3>
                    <p class="mt-2 max-w-2xl text-sm text-gray-400 leading-relaxed">Install or update through the Play Store for automatic updates and a familiar experience.</p>
                  </div>

                  <div class="flex flex-wrap gap-2 lg:justify-end">
                    <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-300">
                      Play Store
                    </span>
                    <span class="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Android
                    </span>
                  </div>
                </div>

                <div class="mt-5 grid gap-3 md:grid-cols-3">
                  <div class="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Role</p>
                    <p class="mt-2 text-sm font-medium text-white">Official listing</p>
                  </div>
                  <div class="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Source</p>
                    <p class="mt-2 text-sm font-medium text-white">Google Play Store</p>
                  </div>
                  <div class="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Install</p>
                    <p class="mt-2 text-sm font-medium text-white">Scan or tap</p>
                  </div>
                </div>

                <p class="mt-5 text-sm text-gray-300 leading-relaxed">
                  Scan the QR code to open Flick on the Play Store, or tap the button if you are already on your Android device.
                </p>

                <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button id="playstore-download-btn" class="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold tracking-tight text-black transition-all hover:bg-gray-200 active:scale-95 cursor-pointer sm:w-auto">
                    Open in Play Store
                  </button>
                </div>
              </div>

              <div class="mx-auto w-full max-w-[15rem] rounded-[1.45rem] border border-white/8 bg-white p-4 shadow-[0_0_24px_rgba(255,255,255,0.08)]">
                <div id="playstore-qr-code" class="aspect-square w-full overflow-hidden rounded-[1.1rem] bg-[#F5F5F5] text-center text-[11px] font-medium text-gray-500">
                  Generating QR...
                </div>
                <p class="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  Scan on Android
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div class="grid gap-4 xl:grid-cols-2" data-animate="fade-up" data-animate-delay="0.14">
        <article class="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <p class="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500">Release feed</p>
          <h3 class="mt-3 text-xl font-bold tracking-tight text-white">Always up to date</h3>
          <p class="mt-3 text-sm text-gray-400 leading-relaxed">
            Every download button and QR code on this page resolves to the latest published Flick release on GitHub, so you never have to check manually.
          </p>
        </article>

        <article class="rounded-[1.75rem] border border-white/10 bg-[#151515]/90 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <p class="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500">Direct Sources</p>
          <div class="mt-4 flex flex-col gap-3">
            <a href="https://github.com/ultraelectronica/Flick/releases" target="_blank" rel="noopener" class="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition-colors hover:text-white hover:bg-white/[0.06]">
              <span>Flick releases</span>
              <span class="text-gray-500">GitHub</span>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.mossapps.flick" target="_blank" rel="noopener" class="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition-colors hover:text-white hover:bg-white/[0.06]">
              <span>Flick on Play Store</span>
              <span class="text-gray-500">Google Play</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  </div>
</section>`;
}
