import { onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vitepress";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function findTabButton(labelSlug: string): HTMLButtonElement | null {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".plugin-tabs--tab"
  );
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    if (slugify(btn.textContent?.trim() ?? "") === labelSlug) {
      return btn;
    }
  }
  return null;
}

function activateTabFromHash(): boolean {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (!hash) return false;

  const btn = findTabButton(hash);
  if (!btn) return false;
  if (btn.getAttribute("aria-selected") !== "true") {
    btn.click();
  }
  // Defer scroll to after Vue re-renders the tab content
  setTimeout(() => {
    btn.closest(".plugin-tabs")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 0);
  return true;
}

function activateTabFromHashWhenReady() {
  if (!location.hash || activateTabFromHash()) return;

  const observer = new MutationObserver(() => {
    if (activateTabFromHash()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 5000);
}

export function useTabAnchors() {
  const route = useRoute();

  function onTabClick(e: Event) {
    const target = e.target as HTMLElement;
    const btn = target.closest(".plugin-tabs--tab") as HTMLButtonElement | null;
    if (!btn) return;
    const label = btn.textContent?.trim();
    if (!label) return;
    history.replaceState(null, "", `#${slugify(label)}`);
  }

  onMounted(() => {
    document.addEventListener("click", onTabClick);
    activateTabFromHashWhenReady();
  });

  watch(
    () => route.path,
    () => activateTabFromHashWhenReady()
  );

  onUnmounted(() => {
    document.removeEventListener("click", onTabClick);
  });
}
