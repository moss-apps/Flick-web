export function NotFoundPage(): string {
  return `
<section class="bg-[#101010] text-white min-h-screen flex items-center justify-center px-6 relative z-20">
  <div class="max-w-xl text-center">
    <p class="text-[11px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-6">Error 404</p>
    <h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6">Track not found.</h1>
    <p class="text-gray-400 text-lg leading-relaxed mb-10">
      The page you requested doesn't exist, or it moved somewhere else in the library.
      Check the URL or head back to safety.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="/"
        class="inline-flex justify-center items-center bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
      >
        Back Home
      </a>
      <a
        href="/downloads"
        class="inline-flex justify-center items-center border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/5 transition-all active:scale-95"
      >
        Downloads
      </a>
    </div>
  </div>
</section>`;
}
