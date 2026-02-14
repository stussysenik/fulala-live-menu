<script lang="ts">
  let theme: 'portrait' | 'valentine' = 'valentine';
  let scale = 25;

  const routes = {
    portrait: {
      dumplings: '/tv-dumplings',
      noodles: '/tv-noodles',
      info: '/tv-info',
    },
    valentine: {
      dumplings: '/tv-dumplings-valentine',
      noodles: '/tv-noodles-valentine',
      info: '/tv-info-valentine',
    },
  };

  $: currentRoutes = routes[theme];
</script>

<div class="preview-page">
  <header class="page-header">
    <div>
      <h1>Live Preview</h1>
      <p class="subtitle">All TV displays in one view — changes update in real-time</p>
    </div>
    <div class="controls">
      <div class="theme-toggle">
        <button
          type="button"
          class="toggle-btn"
          class:active={theme === 'portrait'}
          on:click={() => theme = 'portrait'}
        >
          Standard
        </button>
        <button
          type="button"
          class="toggle-btn"
          class:active={theme === 'valentine'}
          on:click={() => theme = 'valentine'}
        >
          Valentine
        </button>
      </div>
      <div class="scale-control">
        <label for="scale-slider">Scale: {scale}%</label>
        <input
          id="scale-slider"
          type="range"
          min="15"
          max="50"
          bind:value={scale}
        />
      </div>
    </div>
  </header>

  <div class="panels" style="--scale: {scale / 100}">
    <div class="panel">
      <div class="panel-header">
        <h3>Dumplings</h3>
        <a href={currentRoutes.dumplings} target="_blank" rel="noopener" class="open-link" title="Open full screen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>
      <div class="iframe-wrap">
        <iframe
          src={currentRoutes.dumplings}
          title="Dumplings TV"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h3>Noodles</h3>
        <a href={currentRoutes.noodles} target="_blank" rel="noopener" class="open-link" title="Open full screen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>
      <div class="iframe-wrap">
        <iframe
          src={currentRoutes.noodles}
          title="Noodles TV"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h3>Info</h3>
        <a href={currentRoutes.info} target="_blank" rel="noopener" class="open-link" title="Open full screen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>
      <div class="iframe-wrap">
        <iframe
          src={currentRoutes.info}
          title="Info TV"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>
  </div>
</div>

<style>
  .preview-page {
    max-width: 1400px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2C2C2C;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #6B6B6B;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .theme-toggle {
    display: flex;
    border: 1px solid #E8E8E4;
    border-radius: 0.375rem;
    overflow: hidden;
  }

  .toggle-btn {
    padding: 0.375rem 0.75rem;
    border: none;
    background: white;
    font-size: 0.8125rem;
    cursor: pointer;
    color: #6B6B6B;
    transition: all 0.15s ease;
  }

  .toggle-btn.active {
    background: #2C2C2C;
    color: white;
  }

  .toggle-btn:not(.active):hover {
    background: #FAFAF8;
  }

  .scale-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .scale-control label {
    font-size: 0.75rem;
    color: #6B6B6B;
    white-space: nowrap;
  }

  .scale-control input[type="range"] {
    width: 100px;
    accent-color: #C41E3A;
  }

  .panels {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  @media (max-width: 1200px) {
    .panels {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 768px) {
    .panels {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: white;
    border: 1px solid #E8E8E4;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #E8E8E4;
    background: #FAFAF8;
  }

  .panel-header h3 {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #2C2C2C;
    margin: 0;
  }

  .open-link {
    color: #6B6B6B;
    text-decoration: none;
    display: flex;
    align-items: center;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: color 0.15s ease;
  }

  .open-link:hover {
    color: #C41E3A;
  }

  .iframe-wrap {
    width: 100%;
    height: 0;
    padding-bottom: 178%; /* 1920/1080 portrait aspect ratio */
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
  }

  .iframe-wrap iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% / var(--scale));
    height: calc(100% / var(--scale));
    transform: scale(var(--scale));
    transform-origin: top left;
    border: none;
  }
</style>
