<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { useMutation } from "$lib/convex";
  import { api } from "../../../convex/_generated/api";

  export let displayType: "mobile" | "tv" = "mobile";

  // Only initialize mutations on browser
  const startSession = browser ? useMutation(api.analytics.startSession) : null;
  const endSession = browser ? useMutation(api.analytics.endSession) : null;

  let sessionId: string | null = null;

  // Generate unique session ID
  function generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get viewport size
  function getViewportSize() {
    if (!browser) return undefined;
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  onMount(() => {
    if (!browser) return;

    // Generate and store session ID
    sessionId = generateSessionId();

    // Start session (fire and forget)
    startSession?.({
      sessionId,
      displayType,
      viewportSize: getViewportSize(),
    }).catch((error) => {
      console.error("Failed to start analytics session:", error);
    });

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden && sessionId) {
        endSession?.({ sessionId }).catch((error) => {
          console.error("Failed to end analytics session:", error);
        });
      } else if (!document.hidden) {
        // Start a new session when page becomes visible again
        sessionId = generateSessionId();
        startSession?.({
          sessionId,
          displayType,
          viewportSize: getViewportSize(),
        }).catch((error) => {
          console.error("Failed to start analytics session:", error);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle page unload
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Use sendBeacon for reliable delivery on unload
        const url = `${import.meta.env.VITE_CONVEX_URL?.replace(
          ".convex.cloud",
          ".convex.site"
        )}/endSession`;
        navigator.sendBeacon?.(url, JSON.stringify({ sessionId }));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  });

  onDestroy(async () => {
    // End session when component is destroyed
    if (sessionId && browser) {
      try {
        await endSession?.({ sessionId });
      } catch (error) {
        console.error("Failed to end analytics session:", error);
      }
    }
  });
</script>

<!-- Invisible component - no rendering needed -->
