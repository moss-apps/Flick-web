export interface ContentPageOptions {
  eyebrow?: string;
  title: string;
  intro?: string;
  updated?: string;
  width?: "prose" | "wide";
  children: string;
}

export function ContentPage({
  eyebrow,
  title,
  intro,
  updated,
  width = "prose",
  children,
}: ContentPageOptions): string {
  const widthClass = width === "wide" ? "max-w-5xl" : "max-w-3xl";

  return `
<section class="bg-[#101010] text-white pt-32 md:pt-40 pb-24 relative z-20 min-h-screen">
  <div class="${widthClass} mx-auto px-6 lg:px-8">
    ${
      eyebrow
        ? `<p class="text-[11px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-4">${eyebrow}</p>`
        : ""
    }
    <h1 class="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">${title}</h1>
    ${
      intro
        ? `<p class="text-lg md:text-xl text-gray-300 leading-relaxed mb-4 text-balance">${intro}</p>`
        : ""
    }
    ${
      updated
        ? `<p class="text-sm text-gray-500 mb-10">Last updated: ${updated}</p>`
        : `<div class="mb-10"></div>`
    }
    <div class="content-prose">${children}</div>
  </div>
</section>`;
}

export function TableWrap(table: string): string {
  return `<div class="content-prose-table overflow-x-auto">${table}</div>`;
}
