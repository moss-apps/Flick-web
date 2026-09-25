import flicklogo from "../assets/flick_logo.svg";
import type { AppRoute } from "../routes";
import {
  CONTACT_EMAIL,
  FEED_PATH,
  ISSUES_URL,
  PULLS_URL,
  REPO_URL,
  RELEASES_URL,
} from "../site";

export function initFooter(): void {
  const button = document.getElementById("back-to-top");
  button?.addEventListener("click", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
}

function footerLink(href: string, label: string, external = false): string {
  const attrs = external ? ' target="_blank" rel="noopener"' : "";
  return `<a href="${href}"${attrs} class="hover:text-white transition-colors">${label}</a>`;
}

export function Footer(currentRoute: AppRoute = "home"): string {
  const secondaryAction =
    currentRoute === "home"
      ? `
          <button id="back-to-top" type="button" class="inline-flex justify-center items-center space-x-3 bg-transparent text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/5 transition-all active:scale-95 cursor-pointer">
            <span>Back to Top</span>
          </button>`
      : `
          <a href="/" class="inline-flex justify-center items-center space-x-3 bg-transparent text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/5 transition-all active:scale-95">
            <span>Back Home</span>
          </a>`;

  return `
<section class="bg-[#101010] text-white pt-24 pb-12 relative z-20">
  <div class="max-w-7xl mx-auto px-6 lg:px-16">
    
    <div class="bg-gradient-to-br from-[#1A1A1A] to-[#111] rounded-[2.5rem] p-10 md:p-16 text-center border border-white/5 relative overflow-hidden shadow-2xl mb-24" data-animate="scale-in">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] md:w-[60%] h-32 bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div class="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="text-white mb-6 opacity-90">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>

        <h2 class="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
          Open Source, End to End. <br> No Ads. No Tracking.
        </h2>
        
        <p class="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed text-balance">
          Flick is MIT-licensed from the Rust audio engine to this website. Read the code, open an issue, or build the APK yourself.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <a href="${REPO_URL}" target="_blank" rel="noopener" class="inline-flex justify-center items-center space-x-3 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <span>View Source on GitHub</span>
          </a>
          
          ${secondaryAction}
        </div>
      </div>
    </div>

    <footer class="border-t border-white/10 pt-12" data-animate="fade-up" data-animate-delay="0.2">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-10">
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-3">
            <img src="${flicklogo}" alt="Flick Logo" class="h-6 w-6 opacity-60">
            <span class="text-white font-semibold tracking-wide">Flick</span>
          </div>
          <p class="text-gray-500 text-sm mt-4 max-w-xs leading-relaxed">
            Bit-perfect audiophile music player for Android. Built by Moss.
          </p>
        </div>

        <div>
          <h3 class="text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-4">Product</h3>
          <ul class="space-y-2 text-sm font-medium text-gray-500">
            <li>${footerLink("/downloads", "Downloads")}</li>
            <li>${footerLink("/release-notes", "Release Notes")}</li>
            <li>${footerLink("/supported-dacs", "Supported DACs")}</li>
            <li>${footerLink("/faq", "FAQ")}</li>
          </ul>
        </div>

        <div>
          <h3 class="text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-4">Project</h3>
          <ul class="space-y-2 text-sm font-medium text-gray-500">
            <li>${footerLink(REPO_URL, "GitHub", true)}</li>
            <li>${footerLink(RELEASES_URL, "Releases", true)}</li>
            <li>${footerLink(ISSUES_URL, "Issue Tracker", true)}</li>
            <li>${footerLink(PULLS_URL, "Contribute", true)}</li>
            <li>${footerLink(FEED_PATH, "Release Feed")}</li>
          </ul>
        </div>

        <div>
          <h3 class="text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-4">Legal</h3>
          <ul class="space-y-2 text-sm font-medium text-gray-500">
            <li>${footerLink("/privacy", "Privacy Policy")}</li>
            <li>${footerLink("/terms", "Terms of Use")}</li>
            <li>${footerLink("/licenses", "Licenses")}</li>
            <li>${footerLink(`mailto:${CONTACT_EMAIL}`, "Contact")}</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <span class="text-gray-500 text-sm tracking-wide">
          © <span id="footer-year">2026</span> Flick Player Contributors ·
          <a href="/licenses" class="hover:text-white transition-colors">MIT License</a>
        </span>
        <span class="text-gray-600 text-xs text-center md:text-right max-w-md">
          Flick is an independent project and is not affiliated with Google, Android, or any DAC manufacturer.
        </span>
      </div>
    </footer>

  </div>
</section>`;
}
