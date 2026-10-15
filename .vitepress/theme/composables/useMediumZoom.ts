import { onMounted, onUnmounted } from "vue";
import { onContentUpdated } from "vitepress";
import mediumZoom from "medium-zoom";

const selector = ".vp-doc :not(a) > img:not(.visitor, .avatar-img, .vp-sponsor-grid-image)";

export function useMediumZoom() {
  if (import.meta.env.SSR) return;

  const zoom = mediumZoom();
  const refresh = () => {
    zoom.detach();
    zoom.attach(selector);
  };

  onMounted(refresh);
  onContentUpdated(refresh);
  onUnmounted(() => zoom.detach());
}
