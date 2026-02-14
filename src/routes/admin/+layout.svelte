<script lang="ts">
  import { page } from "$app/stores";

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "home" },
    { href: "/admin/menu", label: "Menu Items", icon: "grid" },
    { href: "/admin/preview", label: "Live Preview", icon: "monitor" },
    { href: "/admin/schedule", label: "Schedule", icon: "calendar" },
    { href: "/admin/theme", label: "Theme", icon: "palette" },
    { href: "/admin/events", label: "Events", icon: "star" },
    { href: "/admin/print", label: "Print Menu", icon: "print" },
    { href: "/admin/analytics", label: "Analytics", icon: "chart" },
  ];

  $: currentPath = $page.url.pathname;
</script>

<div class="admin-layout">
  <aside class="sidebar">
    <div class="sidebar-header">
      <a href="/" class="logo">Fulala</a>
      <span class="admin-badge">Admin</span>
    </div>

    <nav class="nav">
      {#each navItems as item}
        <a
          href={item.href}
          class="nav-item"
          class:active={currentPath === item.href}
        >
          <span class="nav-icon" data-icon={item.icon}>
            {#if item.icon === "home"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            {:else if item.icon === "grid"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            {:else if item.icon === "palette"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="13.5" cy="6.5" r="2.5" />
                <circle cx="6.5" cy="13.5" r="2.5" />
                <circle cx="17.5" cy="17.5" r="2.5" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.563-2.485 5.563-5.537C22 6.408 17.5 2 12 2z" />
              </svg>
            {:else if item.icon === "chart"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            {:else if item.icon === "calendar"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            {:else if item.icon === "monitor"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            {:else if item.icon === "star"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            {:else if item.icon === "print"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            {/if}
          </span>
          <span class="nav-label">{item.label}</span>
        </a>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <a href="/" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Menu
      </a>
      <a href="/admin/logout" class="back-link" data-sveltekit-preload-data="off">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </a>
    </div>
  </aside>

  <main class="main-content">
    <slot />
  </main>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: var(--color-bg, var(--bg));
  }

  .sidebar {
    width: 240px;
    background: var(--color-surface, var(--surface));
    border-right: 1px solid var(--color-border, var(--border));
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .sidebar-header {
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border, var(--border));
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .logo {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text, var(--text));
    text-decoration: none;
  }

  .admin-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-accent, var(--accent));
    background: rgba(37, 99, 235, 0.1);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .nav {
    flex: 1;
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--color-text-muted, var(--text-muted));
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .nav-item:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text, var(--text));
  }

  .nav-item.active {
    background: var(--color-accent, var(--accent));
    color: white;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-icon svg {
    width: 100%;
    height: 100%;
  }

  .nav-label {
    font-size: var(--text-sm);
    font-weight: 500;
  }

  .sidebar-footer {
    padding: var(--space-3);
    border-top: 1px solid var(--color-border, var(--border));
  }

  .back-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--color-text-muted, var(--text-muted));
    text-decoration: none;
    font-size: var(--text-sm);
    transition: all var(--transition-fast);
  }

  .back-link:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text, var(--text));
  }

  .back-link svg {
    width: 16px;
    height: 16px;
  }

  .main-content {
    flex: 1;
    padding: var(--space-5);
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .admin-layout {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      height: auto;
      position: relative;
    }

    .nav {
      flex-direction: row;
      overflow-x: auto;
      padding: var(--space-2);
    }

    .nav-item {
      flex-shrink: 0;
    }

    .sidebar-footer {
      display: none;
    }
  }
</style>
