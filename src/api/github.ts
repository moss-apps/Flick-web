import { animate, stagger } from "motion";
import QRCode from "qrcode";

const REPO_OWNER = "ultraelectronica";
const REPO_NAME = "Flick";
const RELEASES_PER_PAGE = 100;
const MAX_RELEASE_PAGES = 10;
const QR_CODE_SIZE = 160;
const LEGACY_WEBSITE_DOWNLOAD_CLICK_STORAGE_KEY =
  "flick-website-download-clicks";
const WEBSITE_DOWNLOAD_CLICK_TIMESTAMPS_STORAGE_KEY =
  "flick-website-download-click-timestamps";
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const API_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CONTRIBUTOR_STATS_RETRY_MS = 700;
const DISCLOSURE_EASE = [0.22, 1, 0.36, 1] as const;
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.mossapps.flick";

async function githubApiFetch(path: string, qs?: string): Promise<Response> {
  const params = new URLSearchParams({ path });
  if (qs) params.set("qs", qs);
  return fetch(`/api/github-proxy?${params.toString()}`);
}

const PERIOD_DAYS = {
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
} as const;

const PERIOD_LABELS = {
  "30d": "30 days",
  "90d": "90 days",
  "180d": "180 days",
  "365d": "1 year",
  all: "all time",
} as const;

const numberFormatter = new Intl.NumberFormat("en-US");
const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const monthDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

type ChartPeriod = keyof typeof PERIOD_LABELS;
type BucketResolution = "day" | "week" | "month";
type TimelineChartMode = "desktop" | "mobile";

interface GitHubReleaseAsset {
  browser_download_url: string;
  download_count?: number;
  name: string;
  size?: number;
}

interface GitHubRelease {
  assets?: GitHubReleaseAsset[];
  body?: string;
  draft?: boolean;
  html_url?: string;
  name?: string;
  prerelease?: boolean;
  published_at?: string;
  tag_name: string;
}

interface GitHubRepositoryInfo {
  stargazers_count?: number;
}

interface GitHubContributor {
  avatar_url: string;
  contributions: number;
  html_url: string;
  login: string;
}

interface GitHubContributorWeek {
  c?: number;
  w?: number;
}

interface GitHubContributorStats {
  author?: {
    login?: string | null;
  } | null;
  total?: number;
  weeks?: GitHubContributorWeek[];
}

interface TimelineBarPoint {
  detail: string;
  shortLabel: string;
  value: number;
}

interface ReleaseBodyImage {
  alt: string;
  height?: number;
  src: string;
  width?: number;
}

interface ReleaseBodyImageParseResult {
  images: ReleaseBodyImage[];
  remainingText: string;
}

interface TimelineChartLayout {
  chartHeight: number;
  chartWidth: number;
  emptyMinHeightClass: string;
  labelFrequency: number;
  maxBarWidth: number;
  minBarWidth: number;
  mode: TimelineChartMode;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  showScrollHint: boolean;
  svgClassName: string;
  xAxisFontSize: number;
  yAxisFontSize: number;
}

const releaseCachePromises = new Map<string, Promise<GitHubRelease[]>>();
let repositoryInfoCachePromise: Promise<GitHubRepositoryInfo> | null = null;
let contributorCachePromise: Promise<GitHubContributor[]> | null = null;
let contributorStatsCachePromise: Promise<GitHubContributorStats[]> | null =
  null;
let activeReleasePeriod: ChartPeriod = "90d";
let releaseNotesResizeListenerBound = false;
let releaseNotesResizeTimer = 0;

function readApiCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: { ts: number; data: T } = JSON.parse(raw);
    if (Date.now() - entry.ts > API_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeApiCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // Storage full or unavailable — ignore
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function formatCount(value: number): string {
  return numberFormatter.format(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function isGitHubUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "github.com" ||
      parsed.hostname.endsWith(".github.com") ||
      parsed.hostname.endsWith(".githubusercontent.com")
    );
  } catch {
    return false;
  }
}

function setTextContent(id: string, value: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setInnerHtml(id: string, value: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = value;
  }
}

function renderRepositoryStars(starCount?: number): void {
  const formattedCount =
    typeof starCount === "number" ? formatCount(starCount) : "--";

  setTextContent("repo-star-count", formattedCount);
  setTextContent("release-repo-star-count", formattedCount);
}

function renderContributorCount(count?: number): void {
  const formattedCount = typeof count === "number" ? formatCount(count) : "--";
  setTextContent("contributor-count", formattedCount);
  setTextContent("release-contributor-total", formattedCount);
}

function getReleaseCacheKey(owner: string, repo: string): string {
  return `github-api-releases:${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

function getRepositoryReleasePageUrl(
  owner: string,
  repo: string,
  tagName?: string,
): string {
  if (!tagName) {
    return `https://github.com/${owner}/${repo}/releases`;
  }

  return `https://github.com/${owner}/${repo}/releases/tag/${encodeURIComponent(tagName)}`;
}

function getReleasePageUrl(tagName?: string): string {
  return getRepositoryReleasePageUrl(REPO_OWNER, REPO_NAME, tagName);
}

function getPreferredRelease(
  releases: GitHubRelease[],
  preferredTag?: string,
): GitHubRelease | null {
  if (preferredTag) {
    const taggedRelease = releases.find(
      (release) => release.tag_name === preferredTag,
    );
    if (taggedRelease) return taggedRelease;
  }

  return releases.find((release) => !release.prerelease) ?? releases[0] ?? null;
}

// ponytail: simple linear scan, releases list is small (<1000)
function getPreRelease(releases: GitHubRelease[]): GitHubRelease | null {
  return releases.find((release) => release.prerelease) ?? null;
}

function showPrereleaseCard(): void {
  const card = document.getElementById("prerelease-card-article");
  if (!card) return;
  card.removeAttribute("hidden");
  card.classList.remove("hidden");
}

function hidePrereleaseCard(): void {
  const card = document.getElementById("prerelease-card-article");
  if (!card) return;
  card.setAttribute("hidden", "");
  card.classList.add("hidden");
}

async function renderDownloadQrCode(
  elementId: string,
  downloadUrl: string,
  altText: string,
): Promise<void> {
  const qrContainer = document.getElementById(elementId);
  if (!qrContainer) return;

  try {
    const qrMarkup = await QRCode.toString(downloadUrl, {
      color: {
        dark: "#101010",
        light: "#FFFFFFFF",
      },
      errorCorrectionLevel: "M",
      margin: 1,
      type: "svg",
      width: QR_CODE_SIZE,
    });

    qrContainer.innerHTML = qrMarkup;
    const svg = qrContainer.querySelector("svg");
    if (svg) {
      svg.setAttribute("aria-label", altText);
      svg.setAttribute("focusable", "false");
      svg.setAttribute("role", "img");
      svg.setAttribute("class", "h-full w-full");
    }
  } catch {
    qrContainer.textContent = "QR unavailable";
  }
}

function getTrackedAssets(release: GitHubRelease): GitHubReleaseAsset[] {
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const apkAssets = assets.filter((asset) => asset.name.endsWith(".apk"));
  return apkAssets.length > 0 ? apkAssets : assets;
}

function getPrimaryReleaseAsset(release: GitHubRelease): GitHubReleaseAsset | null {
  return getTrackedAssets(release)[0] ?? null;
}

function formatReleaseAssetSize(size?: number): string {
  if (typeof size !== "number" || size <= 0) {
    return "Size pending";
  }

  const sizeInMb = size / (1024 * 1024);
  if (sizeInMb >= 1024) {
    return `${(sizeInMb / 1024).toFixed(2)} GB`;
  }

  return `${sizeInMb.toFixed(1)} MB`;
}

function getReleaseDownloadTotal(release: GitHubRelease): number {
  return getTrackedAssets(release).reduce((total, asset) => {
    return (
      total +
      (typeof asset.download_count === "number" ? asset.download_count : 0)
    );
  }, 0);
}

function getReleaseDownloadUrl(release: GitHubRelease): string {
  const apkAsset = release.assets?.find((asset) => asset.name.endsWith(".apk"));
  const url = apkAsset?.browser_download_url;
  if (url && isGitHubUrl(url)) return url;
  return PLAY_STORE_URL;
}

function getReleasePublishedTimestamp(release: GitHubRelease): number {
  if (!release.published_at) return 0;

  const publishedAt = new Date(release.published_at).getTime();
  return Number.isFinite(publishedAt) ? publishedAt : 0;
}

function getReleaseTitle(release: GitHubRelease): string {
  return release.name?.trim() || release.tag_name;
}

function getChartPeriodStart(period: ChartPeriod, now = Date.now()): number {
  if (period === "all") return 0;
  return now - PERIOD_DAYS[period] * DAY_IN_MS;
}

function getPeriodRangeLabel(period: ChartPeriod): string {
  return period === "all" ? "all time" : `the last ${PERIOD_LABELS[period]}`;
}

function getChartMax(maxValue: number): number {
  if (maxValue <= 1) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(maxValue));
  const normalized = maxValue / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function getLegacyWebsiteDownloadClicks(): number {
  try {
    const rawCount = window.localStorage.getItem(
      LEGACY_WEBSITE_DOWNLOAD_CLICK_STORAGE_KEY,
    );
    const parsedCount = Number.parseInt(rawCount ?? "0", 10);
    return Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : 0;
  } catch {
    return 0;
  }
}

function getStoredWebsiteDownloadClickTimestamps(): number[] {
  try {
    const rawTimestamps = window.localStorage.getItem(
      WEBSITE_DOWNLOAD_CLICK_TIMESTAMPS_STORAGE_KEY,
    );
    const parsedTimestamps: unknown = JSON.parse(rawTimestamps ?? "[]");
    if (!Array.isArray(parsedTimestamps)) return [];

    return parsedTimestamps
      .map((timestamp) =>
        typeof timestamp === "number"
          ? timestamp
          : new Date(String(timestamp)).getTime(),
      )
      .filter((timestamp) => Number.isFinite(timestamp))
      .sort((left, right) => left - right);
  } catch {
    return [];
  }
}

function setStoredWebsiteDownloadClickTimestamps(timestamps: number[]): void {
  try {
    window.localStorage.setItem(
      WEBSITE_DOWNLOAD_CLICK_TIMESTAMPS_STORAGE_KEY,
      JSON.stringify(timestamps),
    );
  } catch {
    // Ignore storage issues and keep the current session responsive.
  }
}

function getWebsiteDownloadClickTotal(): number {
  return (
    getLegacyWebsiteDownloadClicks() +
    getStoredWebsiteDownloadClickTimestamps().length
  );
}

function renderWebsiteDownloadClicks(
  count = getWebsiteDownloadClickTotal(),
): void {
  setTextContent("release-website-total", formatCount(count));
}

function bindDownloadButton(
  buttonId: string,
  downloadUrl: string,
  shouldTrackWebsiteClicks = false,
): void {
  const downloadBtn = document.getElementById(buttonId) as HTMLButtonElement | null;
  if (!downloadBtn) return;

  downloadBtn.onclick = () => {
    if (shouldTrackWebsiteClicks) {
      incrementWebsiteDownloadClicks();
    }
    window.open(downloadUrl, "_blank", "noopener");
  };
}

function bindTrackedDownloadLinks(): void {
  const trackedLinks = document.querySelectorAll<HTMLAnchorElement>(
    "[data-track-download='true']",
  );

  trackedLinks.forEach((link) => {
    if (link.dataset.downloadBound === "true") return;

    link.dataset.downloadBound = "true";
    link.addEventListener("click", () => {
      incrementWebsiteDownloadClicks();
    });
  });
}

function getBucketResolution(period: ChartPeriod): BucketResolution {
  if (period === "30d" || period === "90d") return "day";
  if (period === "180d") return "week";
  return "month";
}

function getBucketStart(
  timestamp: number,
  resolution: BucketResolution,
): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);

  if (resolution === "week") {
    const day = date.getDay();
    const daysFromMonday = (day + 6) % 7;
    date.setDate(date.getDate() - daysFromMonday);
  }

  if (resolution === "month") {
    date.setDate(1);
  }

  return date.getTime();
}

function addBucketStep(
  timestamp: number,
  resolution: BucketResolution,
): number {
  const date = new Date(timestamp);

  if (resolution === "day") {
    date.setDate(date.getDate() + 1);
    return date.getTime();
  }

  if (resolution === "week") {
    date.setDate(date.getDate() + 7);
    return date.getTime();
  }

  date.setMonth(date.getMonth() + 1);
  return date.getTime();
}

function formatBucketShortLabel(
  timestamp: number,
  resolution: BucketResolution,
): string {
  if (resolution === "month") {
    return monthDateFormatter.format(timestamp);
  }

  return shortDateFormatter.format(timestamp);
}

function formatBucketDetail(
  timestamp: number,
  resolution: BucketResolution,
): string {
  if (resolution === "week") {
    return `Week of ${fullDateFormatter.format(timestamp)}`;
  }

  if (resolution === "month") {
    return monthDateFormatter.format(timestamp);
  }

  return fullDateFormatter.format(timestamp);
}

function getReleasesInPeriod(
  releases: GitHubRelease[],
  period: ChartPeriod,
): GitHubRelease[] {
  const periodStart = getChartPeriodStart(period);

  return releases.filter((release) => {
    if (period === "all") return true;
    return getReleasePublishedTimestamp(release) >= periodStart;
  });
}

function buildGitHubDownloadTimeline(
  releases: GitHubRelease[],
  period: ChartPeriod,
): TimelineBarPoint[] {
  return getReleasesInPeriod(releases, period)
    .filter((release) => getReleasePublishedTimestamp(release) > 0)
    .sort(
      (left, right) =>
        getReleasePublishedTimestamp(left) -
        getReleasePublishedTimestamp(right),
    )
    .map((release) => {
      const publishedTimestamp = getReleasePublishedTimestamp(release);
      return {
        detail: `${getReleaseTitle(release)} • ${fullDateFormatter.format(
          publishedTimestamp,
        )}`,
        shortLabel: shortDateFormatter.format(publishedTimestamp),
        value: getReleaseDownloadTotal(release),
      };
    });
}

function getContributorFirstContributionTimestamps(
  contributorStats: GitHubContributorStats[],
): number[] {
  return contributorStats
    .map((stat) => {
      const firstActiveWeek = stat.weeks?.find((week) => {
        return (
          typeof week.w === "number" &&
          typeof week.c === "number" &&
          week.c > 0
        );
      });

      if (!firstActiveWeek || typeof firstActiveWeek.w !== "number") {
        return 0;
      }

      return firstActiveWeek.w * 1000;
    })
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > 0)
    .sort((left, right) => left - right);
}

function buildContributorTimeline(
  contributorStats: GitHubContributorStats[],
  period: ChartPeriod,
): TimelineBarPoint[] {
  const timestamps = getContributorFirstContributionTimestamps(contributorStats);
  if (timestamps.length === 0) return [];

  const resolution = getBucketResolution(period);
  const now = Date.now();
  const rawStart =
    period === "all" ? timestamps[0] : getChartPeriodStart(period, now);
  const start = getBucketStart(rawStart, resolution);
  const end = getBucketStart(now, resolution);
  const countsByBucket = new Map<number, number>();

  timestamps
    .filter((timestamp) => timestamp <= now)
    .forEach((timestamp) => {
      const bucketStart = getBucketStart(timestamp, resolution);
      countsByBucket.set(
        bucketStart,
        (countsByBucket.get(bucketStart) ?? 0) + 1,
      );
    });

  let runningTotal = timestamps.filter((timestamp) => timestamp < start).length;
  const points: TimelineBarPoint[] = [];

  for (
    let cursor = start;
    cursor <= end;
    cursor = addBucketStep(cursor, resolution)
  ) {
    runningTotal += countsByBucket.get(cursor) ?? 0;
    points.push({
      detail: `${formatBucketDetail(cursor, resolution)} • ${formatCount(
        runningTotal,
      )} contributors total`,
      shortLabel: formatBucketShortLabel(cursor, resolution),
      value: runningTotal,
    });
  }

  return points;
}

function getTimelineFinalValue(points: TimelineBarPoint[]): number {
  return points.length > 0 ? points[points.length - 1].value : 0;
}

function isMobileChartViewport(): boolean {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getTimelineChartLayout(
  containerWidth: number,
  pointsLength: number,
): TimelineChartLayout {
  const safeContainerWidth = Math.max(containerWidth, 320);
  const safePointCount = Math.max(pointsLength, 1);

  if (isMobileChartViewport()) {
    const paddingLeft = 50;
    const paddingRight = 16;
    const slotWidth =
      safePointCount <= 5
        ? 70
        : safePointCount <= 10
          ? 58
          : safePointCount <= 18
            ? 50
            : 44;
    const chartWidth = Math.max(
      safeContainerWidth,
      paddingLeft + paddingRight + safePointCount * slotWidth,
    );
    const targetLabelCount = Math.min(safePointCount, 8);

    return {
      chartHeight: 300,
      chartWidth,
      emptyMinHeightClass: "min-h-[300px]",
      labelFrequency: Math.max(1, Math.ceil(safePointCount / targetLabelCount)),
      maxBarWidth: 30,
      minBarWidth: 18,
      mode: "mobile",
      paddingBottom: 68,
      paddingLeft,
      paddingRight,
      paddingTop: 18,
      showScrollHint: chartWidth > safeContainerWidth + 24,
      svgClassName: "block h-[300px] w-auto max-w-none",
      xAxisFontSize: 10,
      yAxisFontSize: 10,
    };
  }

  const targetLabelCount = Math.min(safePointCount, 7);

  return {
    chartHeight: 380,
    chartWidth: safeContainerWidth,
    emptyMinHeightClass: "min-h-[340px] md:min-h-[380px]",
    labelFrequency: Math.max(1, Math.ceil(safePointCount / targetLabelCount)),
    maxBarWidth: 52,
    minBarWidth: 14,
    mode: "desktop",
    paddingBottom: 60,
    paddingLeft: 60,
    paddingRight: 20,
    paddingTop: 24,
    showScrollHint: false,
    svgClassName: "block w-full h-auto",
    xAxisFontSize: 11,
    yAxisFontSize: 11,
  };
}

function getTimelineEmptyStateMarkup(
  containerWidth: number,
  emptyLabel: string,
): string {
  const layout = getTimelineChartLayout(containerWidth, 0);

  return `
    <div class="${layout.emptyMinHeightClass} rounded-[1.25rem] border border-dashed border-white/10 bg-black/15 flex items-center justify-center text-center px-6 text-sm text-gray-500">
      ${emptyLabel}
    </div>`;
}

function renderTimelineEmptyState(
  containerId: string,
  emptyLabel: string,
): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = getTimelineEmptyStateMarkup(
    container.clientWidth,
    emptyLabel,
  );
}

function renderTimelineChart(
  containerId: string,
  points: TimelineBarPoint[],
  options: {
    accentColor: string;
    chartType?: "bar" | "line";
    emptyLabel: string;
    unitLabel: string;
  },
): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const containerWidth = Math.max(container.clientWidth, 320);

  if (points.length === 0) {
    container.innerHTML = getTimelineEmptyStateMarkup(
      containerWidth,
      options.emptyLabel,
    );
    return;
  }

  const layout = getTimelineChartLayout(containerWidth, points.length);
  const chartWidth = layout.chartWidth;
  const chartHeight = layout.chartHeight;
  const paddingTop = layout.paddingTop;
  const paddingRight = layout.paddingRight;
  const paddingBottom = layout.paddingBottom;
  const paddingLeft = layout.paddingLeft;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const chartMax = getChartMax(maxValue);
  const slotWidth = innerWidth / points.length;
  const chartType = options.chartType ?? "bar";
  const preferredBarWidth = Math.max(
    2,
    Math.min(
      layout.maxBarWidth,
      slotWidth * (layout.mode === "mobile" ? 0.5 : 0.56),
    ),
  );
  const minGap = Math.min(
    layout.mode === "mobile" ? 8 : 10,
    Math.max(slotWidth * 0.32, 3),
  );
  const maxBarWidthForGap = Math.max(2, slotWidth - minGap);
  const barWidth = Math.min(
    Math.max(layout.minBarWidth, preferredBarWidth),
    maxBarWidthForGap,
  );
  const labelFrequency = layout.labelFrequency;

  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const value = (chartMax / 4) * index;
    const y = paddingTop + innerHeight - (value / chartMax) * innerHeight;

    return `
      <g>
        <line x1="${paddingLeft}" y1="${y}" x2="${chartWidth - paddingRight}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        <text x="${paddingLeft - 10}" y="${y + 4}" fill="rgba(156,163,175,0.8)" text-anchor="end" font-size="${layout.yAxisFontSize}">
          ${formatCount(Math.round(value))}
        </text>
      </g>`;
  }).join("");

  const bars = points
    .map((point, index) => {
      const scaledHeight =
        point.value > 0 ? (point.value / chartMax) * innerHeight : 0;
      const displayHeight = point.value > 0 ? scaledHeight : 2;
      const x = paddingLeft + index * slotWidth + (slotWidth - barWidth) / 2;
      const y = paddingTop + innerHeight - displayHeight;
      const shouldRenderLabel =
        index % labelFrequency === 0 || index === points.length - 1;

      return `
        <g>
          <title>${escapeHtml(
            `${point.detail}: ${formatCount(point.value)} ${options.unitLabel}`,
          )}</title>
          <rect
            x="${x}"
            y="${y}"
            width="${barWidth}"
            height="${displayHeight}"
            rx="${Math.min(8, barWidth / 2)}"
            fill="${options.accentColor}"
            fill-opacity="${point.value > 0 ? 1 : 0.18}"
          />
          ${
            shouldRenderLabel
              ? `
                <text
                  x="${x + barWidth / 2}"
                  y="${chartHeight - 18}"
                  fill="rgba(156,163,175,0.82)"
                  text-anchor="middle"
                  font-size="${layout.xAxisFontSize}"
                >
                  ${escapeHtml(point.shortLabel)}
                </text>`
              : ""
          }
        </g>`;
    })
    .join("");

  const linePoints = points.map((point, index) => {
    const x = paddingLeft + index * slotWidth + slotWidth / 2;
    const y =
      paddingTop + innerHeight - (point.value / chartMax) * innerHeight;
    return { ...point, x, y };
  });

  const lineAreaGradientId = `${containerId}-line-area`;
  const linePath =
    linePoints.length > 1
      ? linePoints
          .map((point, index) => {
            const command = index === 0 ? "M" : "L";
            return `${command} ${point.x} ${point.y}`;
          })
          .join(" ")
      : "";
  const areaBaselineY = paddingTop + innerHeight;
  const lineAreaPath =
    linePoints.length > 1
      ? `${linePath} L ${linePoints[linePoints.length - 1].x} ${areaBaselineY} L ${linePoints[0].x} ${areaBaselineY} Z`
      : "";
  const lineLabels = linePoints
    .map((point, index) => {
      const shouldRenderLabel =
        index % labelFrequency === 0 || index === linePoints.length - 1;
      if (!shouldRenderLabel) return "";

      return `
        <text
          x="${point.x}"
          y="${chartHeight - 18}"
          fill="rgba(156,163,175,0.82)"
          text-anchor="middle"
          font-size="${layout.xAxisFontSize}"
        >
          ${escapeHtml(point.shortLabel)}
        </text>`;
    })
    .join("");
  const lineMarkers = linePoints
    .map((point) => {
      const markerRadius = layout.mode === "mobile" ? 3 : 4;
      const hitRadius = layout.mode === "mobile" ? 10 : 12;

      return `
        <g>
          <title>${escapeHtml(
            `${point.detail}: ${formatCount(point.value)} ${options.unitLabel}`,
          )}</title>
          <circle
            cx="${point.x}"
            cy="${point.y}"
            r="${hitRadius}"
            fill="transparent"
          />
          <circle
            cx="${point.x}"
            cy="${point.y}"
            r="${markerRadius}"
            fill="${options.accentColor}"
            stroke="rgba(16,16,16,0.92)"
            stroke-width="2"
          />
        </g>`;
    })
    .join("");
  const lineMarkup = `
    <defs>
      <linearGradient id="${lineAreaGradientId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${options.accentColor}" stop-opacity="0.28" />
        <stop offset="100%" stop-color="${options.accentColor}" stop-opacity="0.02" />
      </linearGradient>
    </defs>
    ${
      lineAreaPath
        ? `<path d="${lineAreaPath}" fill="url(#${lineAreaGradientId})" />`
        : ""
    }
    ${
      linePath
        ? `<path d="${linePath}" fill="none" stroke="${options.accentColor}" stroke-width="${layout.mode === "mobile" ? 2.5 : 3}" stroke-linecap="round" stroke-linejoin="round" />`
        : ""
    }
    ${lineMarkers}
    ${lineLabels}`;

  const svgMarkup = `
    <svg
      viewBox="0 0 ${chartWidth} ${chartHeight}"
      width="${chartWidth}"
      height="${chartHeight}"
      class="${layout.svgClassName}"
      aria-label="Timeline chart"
      role="img"
    >
      ${gridLines}
      ${chartType === "line" ? lineMarkup : bars}
    </svg>`;

  container.innerHTML =
    layout.mode === "mobile"
      ? `
        <div class="w-full">
          <div class="w-full overflow-x-auto pb-2 [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]">
            ${svgMarkup}
          </div>
          ${
            layout.showScrollHint
              ? '<p class="mt-3 text-[10px] font-bold tracking-[0.18em] uppercase text-gray-500 md:hidden">Swipe horizontally to inspect the full timeline</p>'
              : ""
          }
        </div>`
      : svgMarkup;
}

function getTimelineRangeLabel(points: TimelineBarPoint[]): string {
  if (points.length === 0) return "No data";
  if (points.length === 1) return points[0].shortLabel;

  return `${points[0].shortLabel} to ${points[points.length - 1].shortLabel}`;
}

function renderGitHubDownloadCount(releases: GitHubRelease[]): void {
  const totalDownloads = releases.reduce((sum, release) => {
    return sum + getReleaseDownloadTotal(release);
  }, 0);

  setTextContent("github-download-count", formatCount(totalDownloads));
  setTextContent("release-total-downloads", formatCount(totalDownloads));
}

function getSafeExternalUrl(rawValue: string): string | null {
  try {
    const parsedUrl = new URL(rawValue.trim());
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function parsePositiveInteger(rawValue?: string): number | undefined {
  if (!rawValue) return undefined;

  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return undefined;
  }

  return parsedValue;
}

function parseHtmlTagAttributes(tagMarkup: string): Map<string, string> {
  const attributes = new Map<string, string>();
  const attributePattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

  for (const match of tagMarkup.matchAll(attributePattern)) {
    const attributeName = match[1]?.toLowerCase();
    const attributeValue = match[2] ?? match[3] ?? match[4] ?? "";
    if (!attributeName) continue;
    attributes.set(attributeName, attributeValue);
  }

  return attributes;
}

function parseHtmlImageTag(tagMarkup: string): ReleaseBodyImage | null {
  const attributes = parseHtmlTagAttributes(tagMarkup);
  const src = getSafeExternalUrl(attributes.get("src") ?? "");
  if (!src) return null;

  return {
    alt: attributes.get("alt")?.trim() || "Release image",
    height: parsePositiveInteger(attributes.get("height")),
    src,
    width: parsePositiveInteger(attributes.get("width")),
  };
}

function parseMarkdownImageToken(markup: string): ReleaseBodyImage | null {
  const match = markup.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+"([^"]*)")?\)$/);
  if (!match) return null;

  const src = getSafeExternalUrl(match[2]);
  if (!src) return null;

  return {
    alt: match[1]?.trim() || match[3]?.trim() || "Release image",
    src,
  };
}

function looksLikeImageUrl(rawUrl: string): boolean {
  try {
    const parsedUrl = new URL(rawUrl);
    const pathname = parsedUrl.pathname.toLowerCase();

    return (
      /\.(apng|avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(pathname) ||
      pathname.includes("/user-attachments/assets/") ||
      parsedUrl.hostname.endsWith("githubusercontent.com")
    );
  } catch {
    return false;
  }
}

function parseStandaloneImageUrl(rawToken: string): ReleaseBodyImage | null {
  const trimmedToken = rawToken.trim().replace(/^<|>$/g, "");
  const src = getSafeExternalUrl(trimmedToken);
  if (!src || !looksLikeImageUrl(src)) return null;

  return {
    alt: "Release image",
    src,
  };
}

function normalizeInlineText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractHtmlImagesFromLine(line: string): ReleaseBodyImageParseResult | null {
  const matches = [...line.matchAll(/<img\b[^>]*\/?>/gi)];
  if (matches.length === 0) return null;

  const images = matches
    .map((match) => parseHtmlImageTag(match[0]))
    .filter((image): image is ReleaseBodyImage => image !== null);

  if (images.length === 0) return null;

  return {
    images,
    remainingText: normalizeInlineText(line.replace(/<img\b[^>]*\/?>/gi, " ")),
  };
}

function extractMarkdownImagesFromLine(line: string): ReleaseBodyImageParseResult | null {
  const tokenPattern = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g;
  const matches = [...line.matchAll(tokenPattern)];
  if (matches.length === 0) return null;

  const images = matches
    .map((match) => parseMarkdownImageToken(match[0]))
    .filter((image): image is ReleaseBodyImage => image !== null);

  if (images.length === 0) return null;

  return {
    images,
    remainingText: normalizeInlineText(line.replace(tokenPattern, " ")),
  };
}

function extractStandaloneImageUrlsFromLine(line: string): ReleaseBodyImage[] | null {
  const tokens = line
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) return null;

  const images = tokens
    .map((token) => parseStandaloneImageUrl(token))
    .filter((image): image is ReleaseBodyImage => image !== null);

  return images.length === tokens.length ? images : null;
}

function renderReleaseImageGallery(images: ReleaseBodyImage[]): string {
  const galleryGridClass =
    images.length === 1
      ? "grid-cols-1 max-w-md"
      : images.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return `
    <div class="grid ${galleryGridClass} gap-3">
      ${images
        .map((image) => {
          const dimensionAttributes = [
            image.width ? `width="${image.width}"` : "",
            image.height ? `height="${image.height}"` : "",
          ]
            .filter(Boolean)
            .join(" ");

          return `
            <a
              href="${escapeHtml(image.src)}"
              target="_blank"
              rel="noopener"
              class="group block rounded-[1.35rem] border border-white/10 bg-black/25 p-2 transition-colors hover:border-white/20"
            >
              <img
                src="${escapeHtml(image.src)}"
                alt="${escapeHtml(image.alt)}"
                ${dimensionAttributes}
                loading="lazy"
                decoding="async"
                class="w-full h-auto rounded-[1rem] bg-[#0d0d0d]"
              />
            </a>`;
        })
        .join("")}
    </div>`;
}

function formatInlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(
      /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
      (_m, alt: string, url: string) =>
        isHttpsUrl(url)
          ? `<img src="${url}" alt="${alt}" data-release-img class="rounded-2xl h-48 w-auto object-cover cursor-zoom-in hover:brightness-75 transition-all inline-block mr-4 mt-4 shadow-lg border border-white/10" loading="eager" />`
          : "",
    )
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      (_m, text: string, url: string) =>
        isHttpsUrl(url)
          ? `<a href="${url}" target="_blank" rel="noopener" class="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">${text}</a>`
          : text,
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.92em] text-white">$1</code>',
    )
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-semibold text-white">$1</strong>',
    );
}

function renderReleaseBody(markdown?: string): string {
  const trimmedMarkdown = markdown?.trim();
  if (!trimmedMarkdown) {
    return `
      <p class="text-gray-500 leading-relaxed">
        No release notes were attached to this release.
      </p>`;
  }

  const lines = trimmedMarkdown.split(/\r?\n/);
  const blocks: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let galleryImages: ReleaseBodyImage[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;

    blocks.push(`
      <p class="text-gray-300 leading-relaxed">
        ${formatInlineMarkdown(paragraphLines.join(" "))}
      </p>`);
    paragraphLines = [];
  };

  const flushGallery = () => {
    if (galleryImages.length === 0) return;

    blocks.push(renderReleaseImageGallery(galleryImages));
    galleryImages = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;

    blocks.push(`
      <ul class="list-disc list-inside space-y-2 text-gray-300 leading-relaxed">
        ${listItems.join("")}
      </ul>`);
    listItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      flushGallery();
      return;
    }

    const htmlImages = extractHtmlImagesFromLine(line);
    if (htmlImages) {
      flushParagraph();
      flushList();
      if (htmlImages.remainingText) {
        flushGallery();
        blocks.push(`
          <p class="text-gray-300 leading-relaxed">
            ${formatInlineMarkdown(htmlImages.remainingText)}
          </p>`);
      }
      galleryImages.push(...htmlImages.images);
      return;
    }

    const markdownImages = extractMarkdownImagesFromLine(line);
    if (markdownImages) {
      flushParagraph();
      flushList();
      if (markdownImages.remainingText) {
        flushGallery();
        blocks.push(`
          <p class="text-gray-300 leading-relaxed">
            ${formatInlineMarkdown(markdownImages.remainingText)}
          </p>`);
      }
      galleryImages.push(...markdownImages.images);
      return;
    }

    const standaloneImageUrls = extractStandaloneImageUrlsFromLine(line);
    if (standaloneImageUrls) {
      flushParagraph();
      flushList();
      galleryImages.push(...standaloneImageUrls);
      return;
    }

    flushGallery();

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();

      const headingClasses =
        headingMatch[1].length === 1
          ? "text-2xl"
          : headingMatch[1].length === 2
            ? "text-xl"
            : "text-lg";

      blocks.push(`
        <h4 class="${headingClasses} font-semibold tracking-tight text-white">
          ${formatInlineMarkdown(headingMatch[2])}
        </h4>`);
      return;
    }

    const imgTagMatch = line.match(
      /^<img\s+[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*\/?>/i,
    );
    if (imgTagMatch) {
      flushParagraph();
      flushList();

      const srcMatch = line.match(/src=["'](https?:\/\/[^"']+)["']/i);
      const altMatch = line.match(/alt=["']([^"']*)["']/i);
      const src = srcMatch ? srcMatch[1] : "";
      const alt = altMatch ? escapeHtml(altMatch[1]) : "";

      if (!isHttpsUrl(src)) return;

      blocks.push(`
        <img src="${src}" alt="${alt}" data-release-img class="rounded-2xl h-48 w-auto object-cover cursor-zoom-in hover:brightness-75 transition-all inline-block mr-4 mt-4 shadow-lg border border-white/10" loading="eager" />`);
      return;
    }

    const listItemMatch =
      line.match(/^[-*]\s+(.+)$/) ?? line.match(/^\d+\.\s+(.+)$/);
    if (listItemMatch) {
      flushParagraph();
      listItems.push(`<li>${formatInlineMarkdown(listItemMatch[1])}</li>`);
      return;
    }

    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();
  flushGallery();

  return `<div class="space-y-4">${blocks.join("")}</div>`;
}

function renderReleaseNotesList(releases: GitHubRelease[]): void {
  const list = document.getElementById("release-notes-list");
  if (!list) return;

  const sortedReleases = [...releases].sort(
    (left, right) =>
      getReleasePublishedTimestamp(right) - getReleasePublishedTimestamp(left),
  );

  list.innerHTML = sortedReleases
    .map((release, index) => {
      const publishedTimestamp = getReleasePublishedTimestamp(release);
      const publishedLabel =
        publishedTimestamp > 0
          ? fullDateFormatter.format(publishedTimestamp)
          : "Unpublished";
      const downloadCount = formatCount(getReleaseDownloadTotal(release));
      const assetCount = formatCount(getTrackedAssets(release).length);
      const releaseType = release.prerelease ? "Prerelease" : "Release";
      const releaseHtmlUrl =
        release.html_url && isGitHubUrl(release.html_url)
          ? release.html_url
          : getReleasePageUrl(release.tag_name);
      const notesPanelId = `release-notes-panel-${index}`;
      const notesSummaryId = `release-notes-summary-${index}`;

      return `
        <article class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#191919] to-[#111111] p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div class="max-w-3xl">
              <p class="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500">
                ${releaseType} • ${publishedLabel}
              </p>
              <h3 class="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-white text-balance">
                ${escapeHtml(getReleaseTitle(release))}
              </h3>

              <div class="mt-4 flex flex-wrap gap-2">
                <span class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-gray-300">
                  ${escapeHtml(release.tag_name)}
                </span>
                <span class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-gray-300">
                  ${downloadCount} downloads
                </span>
                <span class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-gray-300">
                  ${assetCount} assets
                </span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 xl:shrink-0">
              <a
                href="${getReleaseDownloadUrl(release)}"
                target="_blank"
                rel="noopener"
                data-track-download="true"
                class="inline-flex justify-center items-center rounded-xl bg-white text-black px-5 py-3 font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                Download Build
              </a>
              <a
                href="${releaseHtmlUrl}"
                target="_blank"
                rel="noopener"
                class="inline-flex justify-center items-center rounded-xl border border-white/15 bg-transparent text-white px-5 py-3 font-bold hover:bg-white/5 transition-all active:scale-95"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <details class="release-notes-disclosure group mt-6 border-t border-white/10 pt-6">
            <summary
              id="${notesSummaryId}"
              aria-controls="${notesPanelId}"
              aria-expanded="false"
              class="release-notes-summary flex cursor-pointer items-center justify-between font-semibold text-gray-300 hover:text-white transition-colors list-none select-none [&::-webkit-details-marker]:hidden"
            >
              <span class="text-[13px] tracking-[0.1em] uppercase">Release Notes</span>
              <span class="release-notes-summary-icon transition-transform duration-300 group-open:rotate-180 bg-white/5 border border-white/10 p-1.5 rounded-full">
                <svg fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="18"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div
              id="${notesPanelId}"
              role="region"
              aria-labelledby="${notesSummaryId}"
              class="release-notes-panel overflow-hidden"
            >
              <div class="release-notes-panel-inner mt-6">
                ${renderReleaseBody(release.body)}
              </div>
            </div>
          </details>
        </article>`;
    })
    .join("");

  bindTrackedDownloadLinks();
  bindReleaseNotesDropdowns();
}

function bindReleaseNotesDropdowns(): void {
  const disclosures = document.querySelectorAll<HTMLDetailsElement>(
    ".release-notes-disclosure",
  );

  disclosures.forEach((disclosure) => {
    if (disclosure.dataset.bound === "true") return;

    const summary = disclosure.querySelector<HTMLElement>(
      ".release-notes-summary",
    );
    const panel = disclosure.querySelector<HTMLElement>(".release-notes-panel");
    const panelInner = disclosure.querySelector<HTMLElement>(
      ".release-notes-panel-inner",
    );
    if (!summary || !panel || !panelInner) return;

    disclosure.dataset.bound = "true";

    summary.addEventListener("click", (event) => {
      event.preventDefault();

      if (disclosure.dataset.animating === "true") return;

      if (disclosure.open) {
        void collapseReleaseNotesDropdown(disclosure, summary, panel, panelInner);
        return;
      }

      void expandReleaseNotesDropdown(disclosure, summary, panel, panelInner);
    });
  });
}

async function expandReleaseNotesDropdown(
  disclosure: HTMLDetailsElement,
  summary: HTMLElement,
  panel: HTMLElement,
  panelInner: HTMLElement,
): Promise<void> {
  disclosure.dataset.animating = "true";
  summary.setAttribute("aria-expanded", "true");
  disclosure.open = true;

  panel.style.overflow = "hidden";
  panel.style.height = "0px";
  panelInner.style.opacity = "0";
  panelInner.style.transform = "translateY(-12px)";

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  const targetHeight = `${panel.scrollHeight}px`;

  await Promise.allSettled([
    animate(
      panel,
      { height: ["0px", targetHeight] },
      { duration: 0.32, ease: DISCLOSURE_EASE },
    ).finished,
    animate(
      panelInner,
      { opacity: [0, 1], y: [-12, 0] },
      { duration: 0.28, delay: 0.04, ease: DISCLOSURE_EASE },
    ).finished,
    animate(
      summary,
      { scale: [1, 0.985, 1] },
      { duration: 0.22, ease: DISCLOSURE_EASE },
    ).finished,
  ]);

  panel.style.height = "";
  panel.style.overflow = "";
  panelInner.style.opacity = "";
  panelInner.style.transform = "";
  delete disclosure.dataset.animating;
}

async function collapseReleaseNotesDropdown(
  disclosure: HTMLDetailsElement,
  summary: HTMLElement,
  panel: HTMLElement,
  panelInner: HTMLElement,
): Promise<void> {
  disclosure.dataset.animating = "true";
  summary.setAttribute("aria-expanded", "false");

  panel.style.overflow = "hidden";
  panel.style.height = `${panel.getBoundingClientRect().height}px`;

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  const startHeight = `${panel.getBoundingClientRect().height}px`;

  await Promise.allSettled([
    animate(
      panel,
      { height: [startHeight, "0px"] },
      { duration: 0.28, ease: DISCLOSURE_EASE },
    ).finished,
    animate(
      panelInner,
      { opacity: [1, 0], y: [0, -12] },
      { duration: 0.2, ease: DISCLOSURE_EASE },
    ).finished,
    animate(
      summary,
      { scale: [1, 0.99, 1] },
      { duration: 0.18, ease: DISCLOSURE_EASE },
    ).finished,
  ]);

  disclosure.open = false;
  panel.style.height = "";
  panel.style.overflow = "";
  panelInner.style.opacity = "";
  panelInner.style.transform = "";
  delete disclosure.dataset.animating;
}

function updateReleasePeriodButtons(period: ChartPeriod): void {
  const periodButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-release-period]",
  );

  periodButtons.forEach((button) => {
    const isActive = button.dataset.releasePeriod === period;
    button.classList.toggle("bg-white", isActive);
    button.classList.toggle("text-black", isActive);
    button.classList.toggle("border-white/30", isActive);
    button.classList.toggle(
      "shadow-[0_0_24px_rgba(255,255,255,0.16)]",
      isActive,
    );
    button.classList.toggle("bg-white/5", !isActive);
    button.classList.toggle("text-gray-400", !isActive);
    button.classList.toggle("border-white/10", !isActive);
  });
}

function renderReleaseNotesAnalytics(
  releases: GitHubRelease[],
  period: ChartPeriod,
  contributorCount?: number,
  contributorStats?: GitHubContributorStats[] | null,
): void {
  activeReleasePeriod = period;

  const releasesInPeriod = getReleasesInPeriod(releases, period);
  const releaseDownloadsInPeriod = releasesInPeriod.reduce((sum, release) => {
    return sum + getReleaseDownloadTotal(release);
  }, 0);
  const releaseTimeline = buildGitHubDownloadTimeline(releases, period);
  const contributorTimeline =
    contributorStats && contributorStats.length > 0
      ? buildContributorTimeline(contributorStats, period)
      : [];
  const contributorChartPoints =
    contributorTimeline.length > 0
      ? contributorTimeline
      : typeof contributorCount === "number"
        ? [
            {
              detail: `Current total contributors: ${formatCount(
                contributorCount,
              )}`,
              shortLabel: "Now",
              value: contributorCount,
            },
          ]
        : [];
  const contributorTimelineTotal = getTimelineFinalValue(contributorChartPoints);
  const contributorResolution = getBucketResolution(period);

  renderGitHubDownloadCount(releases);
  renderContributorCount(
    typeof contributorCount === "number"
      ? contributorCount
      : contributorTimeline.length > 0
        ? contributorTimelineTotal
        : undefined,
  );

  setTextContent(
    "release-period-downloads",
    formatCount(releaseDownloadsInPeriod),
  );
  setTextContent(
    "release-period-downloads-label",
    `Downloads from releases published across ${getPeriodRangeLabel(period)}.`,
  );
  setTextContent(
    "release-period-release-count",
    formatCount(releasesInPeriod.length),
  );
  setTextContent(
    "release-period-release-count-label",
    period === "all"
      ? "Published releases currently included in the feed."
      : `Published releases inside ${getPeriodRangeLabel(period)}.`,
  );

  setTextContent(
    "release-downloads-caption",
    releaseTimeline.length > 0
      ? `${formatCount(releaseDownloadsInPeriod)} downloads across ${formatCount(
          releasesInPeriod.length,
        )} release dates in ${getPeriodRangeLabel(period)}.`
      : `No published releases fall inside ${getPeriodRangeLabel(period)}.`,
  );

  setTextContent(
    "contributors-caption",
    contributorTimeline.length > 0
      ? `${formatCount(
          contributorTimelineTotal,
        )} cumulative contributors grouped by ${contributorResolution} in ${getPeriodRangeLabel(period)}.`
      : typeof contributorCount === "number"
        ? "Showing the current repository total because detailed contributor history is unavailable right now."
        : "Contributor history could not be loaded from GitHub.",
  );

  renderTimelineChart("release-downloads-chart", releaseTimeline, {
    accentColor: "#F8FAFC",
    emptyLabel: `No GitHub release download data is available for ${getPeriodRangeLabel(period)}.`,
    unitLabel: "downloads",
  });
  setTextContent(
    "release-downloads-total",
    `${formatCount(releaseDownloadsInPeriod)} downloads`,
  );
  setTextContent(
    "release-downloads-range",
    getTimelineRangeLabel(releaseTimeline),
  );

  renderTimelineChart("contributors-chart", contributorChartPoints, {
    accentColor: "#34D399",
    chartType: "line",
    emptyLabel: "Contributor history could not be loaded from GitHub.",
    unitLabel: "contributors",
  });
  setTextContent(
    "contributors-total",
    contributorChartPoints.length > 0
      ? `${formatCount(contributorTimelineTotal)} contributors`
      : "--",
  );
  setTextContent(
    "contributors-range",
    contributorTimeline.length > 0
      ? getTimelineRangeLabel(contributorTimeline)
      : contributorChartPoints.length > 0
        ? "Current total"
        : "No data",
  );

  updateReleasePeriodButtons(period);
}

async function refreshReleaseNotesAnalyticsIfVisible(): Promise<void> {
  if (!document.getElementById("release-notes-view")) return;

  try {
    const [releases, contributors, contributorStats] = await Promise.all([
      fetchPublishedReleases(),
      fetchContributorList().catch(() => null),
      fetchContributorStats().catch(() => null),
    ]);
    renderReleaseNotesAnalytics(
      releases,
      activeReleasePeriod,
      contributors?.length,
      contributorStats,
    );
  } catch {
    // Leave the existing UI intact if release history cannot be refreshed.
  }
}

function ensureReleaseNotesResizeListener(): void {
  if (releaseNotesResizeListenerBound) return;

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(releaseNotesResizeTimer);
      releaseNotesResizeTimer = window.setTimeout(() => {
        void refreshReleaseNotesAnalyticsIfVisible();
      }, 120);
    },
    { passive: true },
  );

  releaseNotesResizeListenerBound = true;
}

async function fetchPublishedReleasesForRepo(
  owner: string,
  repo: string,
): Promise<GitHubRelease[]> {
  const cacheKey = getReleaseCacheKey(owner, repo);
  const cachedPromise = releaseCachePromises.get(cacheKey);
  if (cachedPromise) {
    return cachedPromise;
  }

  const requestPromise = (async () => {
    const cached = readApiCache<GitHubRelease[]>(cacheKey);
    if (cached) return cached;

    const releases: GitHubRelease[] = [];

    for (let page = 1; page <= MAX_RELEASE_PAGES; page += 1) {
      const res = await githubApiFetch(
        `/repos/${owner}/${repo}/releases`,
        `per_page=${RELEASES_PER_PAGE}&page=${page}`,
      );
      if (!res.ok) {
        throw new Error(
          `GitHub releases request failed with status ${res.status}`,
        );
      }

      const pageReleases: unknown = await res.json();
      if (!Array.isArray(pageReleases) || pageReleases.length === 0) break;

      releases.push(...(pageReleases as GitHubRelease[]));
      if (pageReleases.length < RELEASES_PER_PAGE) break;
    }

    const sorted = releases
      .filter((release) => !release.draft)
      .sort(
        (left, right) =>
          getReleasePublishedTimestamp(right) -
          getReleasePublishedTimestamp(left),
      );

    writeApiCache(cacheKey, sorted);
    return sorted;
  })().catch((error) => {
    releaseCachePromises.delete(cacheKey);
    throw error;
  });

  releaseCachePromises.set(cacheKey, requestPromise);
  return requestPromise;
}

async function fetchPublishedReleases(): Promise<GitHubRelease[]> {
  return fetchPublishedReleasesForRepo(REPO_OWNER, REPO_NAME);
}

async function fetchRepositoryInfo(): Promise<GitHubRepositoryInfo> {
  if (!repositoryInfoCachePromise) {
    repositoryInfoCachePromise = (async () => {
      const cached = readApiCache<GitHubRepositoryInfo>("flick-api-repo");
      if (cached) return cached;

      const res = await githubApiFetch(`/repos/${REPO_OWNER}/${REPO_NAME}`);
      if (!res.ok) {
        throw new Error(
          `GitHub repository request failed with status ${res.status}`,
        );
      }

      const repositoryInfo: unknown = await res.json();
      const info = repositoryInfo as GitHubRepositoryInfo;
      writeApiCache("flick-api-repo", info);
      return info;
    })();
  }

  try {
    return await repositoryInfoCachePromise;
  } catch (error) {
    repositoryInfoCachePromise = null;
    throw error;
  }
}

function incrementWebsiteDownloadClicks(): number {
  const timestamps = getStoredWebsiteDownloadClickTimestamps();
  timestamps.push(Date.now());
  setStoredWebsiteDownloadClickTimestamps(timestamps);

  const nextTotal = getLegacyWebsiteDownloadClicks() + timestamps.length;
  renderWebsiteDownloadClicks(nextTotal);

  return nextTotal;
}

export async function fetchLatestRelease() {
  renderContributorCount();
  renderRepositoryStars();

  const renderFlickDownloadState = (
    versionLabel: string,
    downloadUrl: string,
    sizeLabel: string,
  ): void => {
    setTextContent("version-tag", versionLabel);
    setTextContent("flick-card-version-tag", versionLabel);
    setTextContent("flick-card-size-tag", sizeLabel);
    bindDownloadButton("download-btn", downloadUrl, true);
    bindDownloadButton("flick-card-download-btn", downloadUrl, true);
    void renderDownloadQrCode(
      "flick-qr-code",
      downloadUrl,
      `Scan to download Flick (${versionLabel})`,
    );
  };

  bindDownloadButton("playstore-download-btn", PLAY_STORE_URL);
  void renderDownloadQrCode(
    "playstore-qr-code",
    PLAY_STORE_URL,
    "Scan to open Flick on the Play Store",
  );

  renderFlickDownloadState(
    "Latest release on GitHub",
    PLAY_STORE_URL,
    "Size pending",
  );
  hidePrereleaseCard();

  try {
    const [releases, repositoryInfo] = await Promise.all([
      fetchPublishedReleases().catch(() => null),
      fetchRepositoryInfo().catch(() => null),
    ]);

    renderRepositoryStars(repositoryInfo?.stargazers_count);

    const latestRelease = releases ? getPreferredRelease(releases) : null;
    if (releases) {
      renderGitHubDownloadCount(releases);
    }
    if (latestRelease) {
      renderFlickDownloadState(
        `v${latestRelease.tag_name} • Android APK`,
        getReleaseDownloadUrl(latestRelease),
        formatReleaseAssetSize(getPrimaryReleaseAsset(latestRelease)?.size),
      );
    }

    renderPrereleaseDownloadState(releases);
  } catch {
    // Silently fail — fallback release links and QR codes stay active.
  }
}

function renderPrereleaseDownloadState(
  releases: GitHubRelease[] | null,
): void {
  if (!releases) return;

  const preRelease = getPreRelease(releases);
  if (!preRelease) {
    hidePrereleaseCard();
    return;
  }

  const downloadUrl = getReleaseDownloadUrl(preRelease);
  showPrereleaseCard();

  setTextContent(
    "prerelease-version-tag",
    `v${preRelease.tag_name} • Android APK`,
  );
  setTextContent(
    "prerelease-size-tag",
    formatReleaseAssetSize(getPrimaryReleaseAsset(preRelease)?.size),
  );

  bindDownloadButton("prerelease-download-btn", downloadUrl, true);

  const releaseLink = document.getElementById("prerelease-release-link");
  if (releaseLink) {
    releaseLink.setAttribute(
      "href",
      getReleasePageUrl(preRelease.tag_name),
    );
  }

  void renderDownloadQrCode(
    "prerelease-qr-code",
    downloadUrl,
    `Scan to download Flick pre-release (v${preRelease.tag_name})`,
  );
}

export async function initReleaseNotesPage() {
  renderContributorCount();
  renderRepositoryStars();
  updateReleasePeriodButtons(activeReleasePeriod);
  ensureReleaseNotesResizeListener();

  try {
    const [releases, repositoryInfo, contributors, contributorStats] =
      await Promise.all([
        fetchPublishedReleases(),
        fetchRepositoryInfo().catch(() => null),
        fetchContributorList().catch(() => null),
        fetchContributorStats().catch(() => null),
      ]);

    renderContributorCount(contributors?.length);

    // Defer chart rendering so container dimensions are fully resolved after layout.
    requestAnimationFrame(() => {
      renderReleaseNotesAnalytics(
        releases,
        activeReleasePeriod,
        contributors?.length,
        contributorStats,
      );
    });

    renderRepositoryStars(repositoryInfo?.stargazers_count);
    renderReleaseNotesList(releases);

    const periodButtons = document.querySelectorAll<HTMLButtonElement>(
      "[data-release-period]",
    );
    periodButtons.forEach((button) => {
      button.onclick = () => {
        const nextPeriod = button.dataset.releasePeriod as
          | ChartPeriod
          | undefined;
        if (!nextPeriod) return;
        renderReleaseNotesAnalytics(
          releases,
          nextPeriod,
          contributors?.length,
          contributorStats,
        );
      };
    });
  } catch {
    renderTimelineEmptyState(
      "release-downloads-chart",
      "Release history could not be loaded from GitHub.",
    );
    renderTimelineEmptyState(
      "contributors-chart",
      "Contributor history could not be loaded from GitHub.",
    );
    setTextContent("contributors-caption", "Contributor history is unavailable.");
    setTextContent("contributors-total", "--");
    setTextContent("contributors-range", "No data");
    setInnerHtml(
      "release-notes-list",
      `
        <div class="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 text-gray-400">
          GitHub release notes could not be loaded right now.
        </div>`,
    );
  }
}

async function fetchContributorList(): Promise<GitHubContributor[]> {
  if (!contributorCachePromise) {
    contributorCachePromise = (async () => {
      const cached = readApiCache<GitHubContributor[]>("flick-api-contributors");
      if (cached) return cached;

      const res = await githubApiFetch(
        `/repos/${REPO_OWNER}/${REPO_NAME}/contributors`,
      );
      if (!res.ok) {
        throw new Error(
          `GitHub contributors request failed with status ${res.status}`,
        );
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("GitHub contributors response was not an array");
      }

      const contributors = data as GitHubContributor[];
      writeApiCache("flick-api-contributors", contributors);
      return contributors;
    })().catch((error) => {
      contributorCachePromise = null;
      throw error;
    });
  }

  return contributorCachePromise;
}

async function fetchContributorStats(): Promise<GitHubContributorStats[]> {
  if (!contributorStatsCachePromise) {
    contributorStatsCachePromise = (async () => {
      const cached = readApiCache<GitHubContributorStats[]>(
        "flick-api-contributor-stats",
      );
      if (cached) return cached;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const res = await githubApiFetch(
          `/repos/${REPO_OWNER}/${REPO_NAME}/stats/contributors`,
        );

        if (res.status === 202) {
          await delay(CONTRIBUTOR_STATS_RETRY_MS * (attempt + 1));
          continue;
        }

        if (!res.ok) {
          throw new Error(
            `GitHub contributor stats request failed with status ${res.status}`,
          );
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("GitHub contributor stats response was not an array");
        }

        const contributorStats = data as GitHubContributorStats[];
        writeApiCache("flick-api-contributor-stats", contributorStats);
        return contributorStats;
      }

      throw new Error("GitHub contributor stats are still being generated");
    })().catch((error) => {
      contributorStatsCachePromise = null;
      throw error;
    });
  }

  return contributorStatsCachePromise;
}

export async function fetchContributors() {
  try {
    const contributors = await fetchContributorList();

    renderContributorCount(contributors.length);

    const grid = document.getElementById("contributors-grid");
    if (!grid) return;

    grid.innerHTML = contributors
      .map((c: GitHubContributor) => {
        const safeLogin = escapeHtml(c.login);
        const safeAvatarUrl =
          isGitHubUrl(c.avatar_url) ? escapeHtml(`${c.avatar_url}&s=80`) : "";
        const safeHtmlUrl =
          isGitHubUrl(c.html_url) ? escapeHtml(c.html_url) : "#";

        return `
        <a
          href="${safeHtmlUrl}"
          target="_blank"
          rel="noopener"
          class="group flex flex-col items-center p-4 rounded-2xl border border-transparent hover:bg-[#1A1A1A] hover:border-white/5 transition-all duration-300 hover:-translate-y-1 w-28 sm:w-32 shrink-0"
        >
          <div class="relative mb-3">
            <img
              src="${safeAvatarUrl}"
              alt="${safeLogin}"
              class="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-white/30 transition-all duration-300 relative z-10"
            />
            <div class="absolute inset-0 rounded-full bg-white/0 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 z-0"></div>
          </div>

          <span class="text-xs sm:text-sm font-medium text-gray-400 group-hover:text-white transition-colors truncate w-full text-center tracking-tight">
            ${safeLogin}
          </span>

          <span class="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1 group-hover:text-gray-500 transition-colors">
            ${c.contributions} commits
          </span>
        </a>`;
      })
      .join("");

    const cards = Array.from(grid.children) as HTMLElement[];
    cards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px) scale(0.9)";
    });
    animate(
      cards,
      { opacity: 1, y: 0, scale: 1 },
      {
        duration: 0.5,
        delay: stagger(0.05, { startDelay: 0.1 }),
        ease: [0.22, 1, 0.36, 1],
      },
    );
  } catch {
    // Silently fail
  }
}

export async function fetchLatestCommit() {
  try {
    let shortSha = readApiCache<string>("flick-api-commit");

    if (!shortSha) {
      const res = await githubApiFetch(
        `/repos/${REPO_OWNER}/${REPO_NAME}/commits`,
        `per_page=1`,
      );
      if (!res.ok) return;
      const commits = await res.json();
      if (!Array.isArray(commits) || commits.length === 0) return;

      shortSha = commits[0].sha.substring(0, 7);
      writeApiCache("flick-api-commit", shortSha);
    }

    const navVersionTags = document.querySelectorAll(
      "#nav-version-tag, #mobile-nav-version-tag",
    );
    navVersionTags.forEach((tag) => {
      tag.textContent = shortSha;
    });
  } catch {
    // Silently fail — keep the placeholder
  }
}
