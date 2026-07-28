import flicklogo from "../assets/flick_logo.svg";

let hasBoundNavbarScroll = false;

function getRouteLinkClasses(isActive: boolean): string {
  return isActive
    ? "bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.2)]"
    : "text-gray-400 hover:text-white hover:bg-white/8";
}

function getRouteLinks(
  currentRoute: "home" | "downloads" | "release-notes",
): string {
  return `
    <a
      href="/"
      class="inline-flex items-center justify-center rounded-full px-3 py-2 text-[11px] md:text-xs font-bold tracking-[0.18em] uppercase transition-all ${getRouteLinkClasses(currentRoute === "home")}"
    >
      Home
    </a>
    <a
      href="/release-notes"
      class="inline-flex items-center justify-center rounded-full px-3 py-2 text-[11px] md:text-xs font-bold tracking-[0.18em] uppercase transition-all ${getRouteLinkClasses(currentRoute === "release-notes")}"
    >
      Releases
    </a>
    <a
      href="/downloads"
      class="inline-flex items-center justify-center rounded-full px-3 py-2 text-[11px] md:text-xs font-bold tracking-[0.18em] uppercase transition-all ${getRouteLinkClasses(currentRoute === "downloads")}"
    >
      Downloads
    </a>
  `;
}

export function Navbar(
  currentRoute: "home" | "downloads" | "release-notes" = "home",
): string {
  return `
<nav id="main-nav" class="fixed top-0 left-0 w-full px-4 sm:px-6 md:px-8 lg:px-16 py-4 md:py-6 z-50 transition-all duration-300">
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center gap-3 md:gap-5">
      <a href="/" class="flex items-center gap-3">
        <img src="${flicklogo}" alt="Flick Logo" class="h-8 w-8 md:h-10 md:w-10 opacity-90">
        <span class="hidden sm:block text-white font-semibold tracking-wide">Flick</span>
      </a>

      <div class="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-[#171717]/85 p-1 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.25)]">
        ${getRouteLinks(currentRoute)}
      </div>
    </div>

    <div class="flex items-center gap-3">
      <a
        href="https://github.com/ultraelectronica/Flick"
        target="_blank"
        rel="noopener"
        class="hidden md:inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2 rounded-full bg-[#2A2A2A]/80 backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.45)] hover:bg-[#333333] transition-all cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-white">
          <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.775 2.774c.645-.215 1.383-.068 1.893.442.708.708.708 1.853 0 2.56-.708.708-1.853.708-2.56 0-.504-.504-.649-1.241-.448-1.89L12.8 8.78v5.535c.22.215.353.5.353.805 0 .708-.542 1.277-1.233 1.277-.692 0-1.233-.569-1.233-1.277 0-.304.133-.59.353-.805V8.718c-.22-.215-.353-.5-.353-.805 0-.336.142-.642.368-.85L8.436 4.442 1.452 11.426c-.603.604-.603 1.586 0 2.189l10.48 10.48c.603.605 1.585.605 2.188 0l9.426-9.425c.605-.604.605-1.585 0-2.19z"/>
        </svg>
        <span id="nav-version-tag" class="text-white font-medium text-[13px] md:text-[15px] tracking-wide mt-[1px]">
          ...
        </span>
      </a>

      <button
        id="mobile-nav-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="mobile-nav-panel"
        aria-label="Open navigation menu"
        class="relative inline-flex md:hidden h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#171717]/85 text-white backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/10"
      >
        <svg id="mobile-nav-open-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="absolute transition-all duration-300 ease-out opacity-100 scale-100 rotate-0">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg id="mobile-nav-close-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="absolute transition-all duration-300 ease-out opacity-0 scale-75 -rotate-90">
          <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
      </button>
    </div>
  </div>

  <div
    id="mobile-nav-panel"
    class="mt-3 md:hidden overflow-hidden rounded-[28px] border border-white/10 bg-[#111111]/96 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 ease-out opacity-0 -translate-y-3 scale-[0.98] max-h-0 pointer-events-none"
  >
    <div class="flex flex-col gap-2 rounded-[24px] border border-white/6 bg-white/[0.03] p-2">
      ${getRouteLinks(currentRoute)}
    </div>
    <a
      href="https://github.com/ultraelectronica/Flick"
      target="_blank"
      rel="noopener"
      class="mt-3 inline-flex w-full items-center justify-between rounded-[22px] border border-white/12 bg-[#2A2A2A]/80 px-4 py-3 text-white shadow-[0_0_15px_rgba(255,255,255,0.18)] transition hover:bg-[#333333]"
    >
      <span class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-white">
          <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.775 2.774c.645-.215 1.383-.068 1.893.442.708.708.708 1.853 0 2.56-.708.708-1.853.708-2.56 0-.504-.504-.649-1.241-.448-1.89L12.8 8.78v5.535c.22.215.353.5.353.805 0 .708-.542 1.277-1.233 1.277-.692 0-1.233-.569-1.233-1.277 0-.304.133-.59.353-.805V8.718c-.22-.215-.353-.5-.353-.805 0-.336.142-.642.368-.85L8.436 4.442 1.452 11.426c-.603.604-.603 1.586 0 2.189l10.48 10.48c.603.605 1.585.605 2.188 0l9.426-9.425c.605-.604.605-1.585 0-2.19z"/>
        </svg>
        <span class="font-medium tracking-wide">GitHub</span>
      </span>
      <span id="mobile-nav-version-tag" class="text-sm text-white/80">...</span>
    </a>
  </div>
</nav>`;
}

export function initNavbarScroll() {
  const onScroll = () => {
    const nav = document.getElementById("main-nav");
    if (!nav) return;
    if (window.scrollY > 50) {
      nav.classList.add(
        "bg-[#101010]/70",
        "backdrop-blur-xl",
        "border-b",
        "border-white/5",
      );
    } else {
      nav.classList.remove(
        "bg-[#101010]/70",
        "backdrop-blur-xl",
        "border-b",
        "border-white/5",
      );
    }
  };

  if (!hasBoundNavbarScroll) {
    window.addEventListener("scroll", onScroll);
    hasBoundNavbarScroll = true;
  }

  onScroll();
}

export function initMobileNavbar() {
  const toggle = document.getElementById("mobile-nav-toggle");
  const panel = document.getElementById("mobile-nav-panel");
  const openIcon = document.getElementById("mobile-nav-open-icon");
  const closeIcon = document.getElementById("mobile-nav-close-icon");

  if (!toggle || !panel || !openIcon || !closeIcon) return;

  const setOpen = (isOpen: boolean) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
    panel.classList.toggle("opacity-0", !isOpen);
    panel.classList.toggle("-translate-y-3", !isOpen);
    panel.classList.toggle("scale-[0.98]", !isOpen);
    panel.classList.toggle("max-h-0", !isOpen);
    panel.classList.toggle("pointer-events-none", !isOpen);
    panel.classList.toggle("opacity-100", isOpen);
    panel.classList.toggle("translate-y-0", isOpen);
    panel.classList.toggle("scale-100", isOpen);
    panel.classList.toggle("max-h-[28rem]", isOpen);
    panel.classList.toggle("pointer-events-auto", isOpen);

    toggle.classList.toggle("rotate-90", isOpen);
    toggle.classList.toggle("bg-white/10", isOpen);

    openIcon.classList.toggle("opacity-100", !isOpen);
    openIcon.classList.toggle("scale-100", !isOpen);
    openIcon.classList.toggle("rotate-0", !isOpen);
    openIcon.classList.toggle("opacity-0", isOpen);
    openIcon.classList.toggle("scale-75", isOpen);
    openIcon.classList.toggle("rotate-90", isOpen);

    closeIcon.classList.toggle("opacity-0", !isOpen);
    closeIcon.classList.toggle("scale-75", !isOpen);
    closeIcon.classList.toggle("-rotate-90", !isOpen);
    closeIcon.classList.toggle("opacity-100", isOpen);
    closeIcon.classList.toggle("scale-100", isOpen);
    closeIcon.classList.toggle("rotate-0", isOpen);
  };

  setOpen(false);

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  panel.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("a")) {
      setOpen(false);
    }
  });
}
