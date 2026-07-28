function PeriodButton(period: string, label: string): string {
  return `
  <button
    type="button"
    data-release-period="${period}"
    class="release-period-button inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold tracking-[0.24em] uppercase text-gray-400 transition-all hover:bg-white/10 hover:text-white"
  >
    ${label}
  </button>`;
}

export function ReleaseNotesPage(): string {
  return `
<section id="release-notes-view" class="min-h-screen bg-[#101010] text-white pt-28 md:pt-36 pb-16 md:pb-20 relative overflow-hidden">
  <div class="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_50%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none"></div>

  <div class="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
    <div class="max-w-4xl" data-animate="fade-up">
      <a
        href="/"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold tracking-[0.24em] uppercase text-gray-400 transition-colors hover:text-white hover:bg-white/10"
      >
        Releases
      </a>

      <p class="mt-6 text-[11px] font-bold tracking-[0.28em] uppercase text-gray-500">
        Flick Releases
      </p>
      <h1 class="mt-4 text-4xl md:text-6xl font-bold tracking-tight leading-tight text-balance">
        Release Notes and Download Trends
      </h1>
      <p class="mt-5 text-base md:text-xl text-gray-400 leading-relaxed max-w-3xl">
        Browse every published changelog, inspect release momentum by date, and compare GitHub release downloads with contributor growth over selectable time windows.
      </p>
    </div>

    <div
      class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      data-animate-stagger="[data-animate-child]"
      data-animate-stagger-delay="0.08"
    >
      <div data-animate-child class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <p class="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500">GitHub Downloads</p>
        <p id="release-total-downloads" class="mt-4 text-3xl font-bold tracking-tight text-white">--</p>
        <p class="mt-2 text-sm text-gray-400 leading-relaxed">Total APK downloads across all published GitHub releases.</p>
      </div>

      <div data-animate-child class="rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <p class="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500">Repo Stars</p>
        <p id="release-repo-star-count" class="mt-4 text-3xl font-bold tracking-tight text-white">--</p>
        <p class="mt-2 text-sm text-gray-400 leading-relaxed">Current stargazer count from the GitHub repository.</p>
      </div>

      <div data-animate-child class="rounded-[1.75rem] border border-white/10 bg-[#151515]/90 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <p class="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500">Selected Period</p>
        <p id="release-period-downloads" class="mt-4 text-3xl font-bold tracking-tight text-white">--</p>
        <p id="release-period-downloads-label" class="mt-2 text-sm text-gray-400 leading-relaxed">Loading release window...</p>
      </div>

      <div data-animate-child class="rounded-[1.75rem] border border-white/10 bg-[#141414]/95 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <p class="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500">Total Contributors</p>
        <p id="release-contributor-total" class="mt-4 text-3xl font-bold tracking-tight text-white">--</p>
        <p class="mt-2 text-sm text-gray-400 leading-relaxed">Current contributor total from the Flick repository.</p>
      </div>

      <div data-animate-child class="rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <p class="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500">Releases in Range</p>
        <p id="release-period-release-count" class="mt-4 text-3xl font-bold tracking-tight text-white">--</p>
        <p id="release-period-release-count-label" class="mt-2 text-sm text-gray-400 leading-relaxed">Waiting for release history...</p>
      </div>
    </div>

    <div class="mt-10 rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-[#181818] to-[#111111] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]" data-animate="fade-up" data-animate-delay="0.1">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-2xl">
          <p class="text-[11px] font-bold tracking-[0.24em] uppercase text-gray-500">Trend View</p>
          <h2 class="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-balance">
            Downloads and Contributors Across Time
          </h2>
          <p class="mt-3 text-sm md:text-base text-gray-400 leading-relaxed">
            Filter the timeline to inspect release download totals by publish date and cumulative contributor growth grouped into matching date buckets.
          </p>
        </div>

        <div id="release-period-controls" class="flex flex-wrap gap-2">
          ${PeriodButton("30d", "30D")}
          ${PeriodButton("90d", "90D")}
          ${PeriodButton("180d", "180D")}
          ${PeriodButton("365d", "1Y")}
          ${PeriodButton("all", "All")}
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 xl:gap-8">
        <article class="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 md:p-7">
          <div id="release-downloads-chart" class="min-h-[320px] md:min-h-[360px] rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-3 sm:p-4 md:p-5 text-sm text-gray-500 overflow-hidden">
            Preparing timeline...
          </div>

          <div class="mt-5 space-y-4">
            <div>
              <h3 class="text-xl font-bold tracking-tight text-white">GitHub Release Downloads</h3>
              <p id="release-downloads-caption" class="mt-2 text-sm text-gray-400">Loading published releases...</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p class="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">In View</p>
                <p id="release-downloads-total" class="mt-2 text-lg font-semibold tracking-tight text-white">--</p>
              </div>
              <div class="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p class="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">Range</p>
                <p id="release-downloads-range" class="mt-2 text-lg font-semibold tracking-tight text-white">--</p>
              </div>
            </div>
          </div>
        </article>

        <article class="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 md:p-7">
          <div id="contributors-chart" class="min-h-[320px] md:min-h-[360px] rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-3 sm:p-4 md:p-5 text-sm text-gray-500 overflow-hidden">
            Preparing timeline...
          </div>

          <div class="mt-5 space-y-4">
            <div>
              <h3 class="text-xl font-bold tracking-tight text-white">Contributor Growth</h3>
              <p id="contributors-caption" class="mt-2 text-sm text-gray-400">Loading contributor history...</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p class="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">In View</p>
                <p id="contributors-total" class="mt-2 text-lg font-semibold tracking-tight text-white">--</p>
              </div>
              <div class="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p class="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">Range</p>
                <p id="contributors-range" class="mt-2 text-lg font-semibold tracking-tight text-white">--</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <p class="mt-6 text-sm text-gray-500 leading-relaxed">
        GitHub exposes current asset download totals, release publish dates, and contributor history signals, so these charts compare release totals against contributor growth rather than local browser-specific click tracking.
      </p>
    </div>

    <div class="mt-14 md:mt-18">
      <div class="max-w-3xl" data-animate="fade-up">
        <p class="text-[11px] font-bold tracking-[0.28em] uppercase text-gray-500">Changelog</p>
        <h2 class="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-balance">All Release Notes</h2>
        <p class="mt-4 text-base md:text-lg text-gray-400 leading-relaxed">
          Each card is pulled from the public GitHub releases feed, including tags, publish dates, direct APK links, and the full release body.
        </p>
      </div>

      <div id="release-notes-list" class="mt-8 space-y-5">
        <div class="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 animate-pulse">
          <div class="h-3 w-32 bg-white/10 rounded-full"></div>
          <div class="mt-4 h-8 w-3/4 bg-white/10 rounded-2xl"></div>
          <div class="mt-6 h-24 bg-white/10 rounded-[1.5rem]"></div>
        </div>
      </div>
    </div>
  </div>

  <dialog id="image-modal" class="bg-transparent m-auto p-0 backdrop:bg-black/90 backdrop:backdrop-blur-md outline-none w-full max-w-7xl h-full max-h-screen fixed inset-0 z-50 overflow-hidden">
    <div class="w-full h-full flex flex-col items-center justify-center p-4 md:p-12 relative pointer-events-none">
      <img id="image-modal-img" src="" class="max-w-full max-h-full rounded-2xl object-contain shadow-2xl pointer-events-auto cursor-zoom-out" />
      <button id="image-modal-close" class="absolute top-6 right-6 md:top-8 md:right-8 text-white/70 hover:text-white p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-colors pointer-events-auto backdrop-blur-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  </dialog>
</section>`;
}
