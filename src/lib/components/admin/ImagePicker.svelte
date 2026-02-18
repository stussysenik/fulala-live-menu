<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Tabs } from "bits-ui";

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  type UploadedImage = {
    storageId?: string;
    url: string;
  };

  type SelectPayload = {
    imageUrl: string;
    imageStorageId?: string;
    clearImage?: boolean;
    clearImageStorage?: boolean;
  };

  export let selected: string = "";
  export let selectedStorageId: string | null = null;
  export let uploadImage: ((file: File) => Promise<UploadedImage>) | null = null;

  const dispatch = createEventDispatcher<{ select: SelectPayload }>();

  const images = [
    { file: "0560_MQ.webp", label: "Steamed dumplings" },
    { file: "0579_MQ.webp", label: "Dumplings + sauces" },
    { file: "0622_MQ.webp", label: "Beef noodle soup" },
    { file: "0625_MQ.webp", label: "Beef noodle alt" },
    { file: "0642_MQ.webp", label: "Minced pork noodles" },
    { file: "0659_MQ.webp", label: "Rice noodles pork" },
    { file: "0684_MQ.webp", label: "Pan-fried gyoza" },
    { file: "0697_MQ.webp", label: "White buns" },
    { file: "0704_MQ.webp", label: "Noodles toppings" },
    { file: "0723_MQ.webp", label: "Noodle pull shot" },
    { file: "0759_MQ.webp", label: "Shrimp dumplings" },
    { file: "0779_MQ.webp", label: "Shumai style" },
    { file: "0795_MQ.webp", label: "Peach buns" },
  ];

  let customUrl = "";
  let uploadError = "";
  let uploadFeedback = "";
  let uploading = false;
  let activeTab = "library";

  function isPreset(url: string): boolean {
    return images.some((img) => url === `/images/menu/${img.file}`);
  }

  $: if (selectedStorageId) {
    activeTab = "upload";
  } else if (selected && !isPreset(selected)) {
    customUrl = selected;
    activeTab = "url";
  }

  function selectImage(file: string) {
    const url = `/images/menu/${file}`;
    selected = url;
    selectedStorageId = null;
    customUrl = "";
    uploadError = "";
    uploadFeedback = "";
    dispatch("select", {
      imageUrl: url,
      clearImageStorage: true,
    });
  }

  function useCustomUrl() {
    if (!customUrl.trim()) return;
    const url = customUrl.trim();
    selected = url;
    selectedStorageId = null;
    uploadError = "";
    uploadFeedback = "";
    dispatch("select", {
      imageUrl: url,
      clearImageStorage: true,
    });
  }

  function clearImage() {
    selected = "";
    selectedStorageId = null;
    customUrl = "";
    uploadError = "";
    uploadFeedback = "";
    dispatch("select", {
      imageUrl: "",
      clearImage: true,
      clearImageStorage: true,
    });
  }

  async function handleUpload(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !uploadImage) return;

    uploadError = "";
    uploadFeedback = "";

    if (!file.type.startsWith("image/")) {
      uploadError = "Select an image file.";
      input.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      uploadError = "Image must be 5MB or smaller.";
      input.value = "";
      return;
    }

    uploading = true;
    try {
      const uploaded = await uploadImage(file);
      selected = uploaded.url;
      selectedStorageId = uploaded.storageId ?? null;
      customUrl = "";
      activeTab = "upload";
      uploadFeedback = uploaded.storageId
        ? "Uploaded to Convex storage."
        : "Uploaded image attached.";
      const payload: SelectPayload = {
        imageUrl: uploaded.url,
      };
      if (uploaded.storageId) {
        payload.imageStorageId = uploaded.storageId;
      }
      dispatch("select", payload);
    } catch (error) {
      uploadError = error instanceof Error ? error.message : "Upload failed.";
    } finally {
      uploading = false;
      input.value = "";
    }
  }
</script>

<div class="image-picker rounded-xl border border-stone-200 bg-stone-50 p-3 shadow-sm">
  <div class="mb-3 flex items-center justify-between gap-2">
    <p class="picker-label text-xs font-semibold uppercase tracking-wide text-stone-500">
      Item Image
    </p>
    {#if selected}
      <button
        type="button"
        class="clear-btn rounded-md px-2 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
        on:click={clearImage}
      >
        Clear image
      </button>
    {/if}
  </div>

  <Tabs.Root bind:value={activeTab} class="space-y-3" data-testid="image-picker-tabs">
    <Tabs.List class="grid grid-cols-3 gap-1 rounded-lg border border-stone-200 bg-white p-1">
      <Tabs.Trigger
        value="library"
        class="rounded-md px-2 py-1.5 text-xs font-medium text-stone-600 transition data-[state=active]:bg-stone-900 data-[state=active]:text-white"
      >
        Library
      </Tabs.Trigger>
      <Tabs.Trigger
        value="upload"
        class="rounded-md px-2 py-1.5 text-xs font-medium text-stone-600 transition data-[state=active]:bg-stone-900 data-[state=active]:text-white"
      >
        Upload
      </Tabs.Trigger>
      <Tabs.Trigger
        value="url"
        class="rounded-md px-2 py-1.5 text-xs font-medium text-stone-600 transition data-[state=active]:bg-stone-900 data-[state=active]:text-white"
      >
        URL
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="library" class="space-y-2">
      <div class="image-grid">
        {#each images as img}
          <button
            class="image-option"
            class:selected={selected === `/images/menu/${img.file}`}
            on:click={() => selectImage(img.file)}
            title={img.label}
            type="button"
          >
            <img
              src="/images/menu/{img.file}"
              alt={img.label}
              loading="lazy"
              width="80"
              height="80"
            />
          </button>
        {/each}
      </div>
      <p class="help-text text-[11px] text-stone-500">
        Choose from packaged photos.
      </p>
    </Tabs.Content>

    <Tabs.Content value="upload" class="space-y-2">
      <label
        class="upload-dropzone flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-stone-300 bg-white px-3 py-2 text-xs text-stone-600 transition hover:border-stone-900"
        for="image-upload-input"
      >
        <span>{uploading ? "Uploading..." : "Upload from device (max 5MB)"}</span>
        <span class="rounded bg-stone-100 px-2 py-1 text-[10px] font-semibold uppercase text-stone-500">
          Browse
        </span>
      </label>
      <input
        id="image-upload-input"
        data-testid="image-upload-input"
        type="file"
        accept="image/*"
        on:change={handleUpload}
        disabled={uploading}
      />
      {#if selectedStorageId}
        <p class="status-success text-[11px] text-emerald-700">
          Stored in Convex: {selectedStorageId}
        </p>
      {/if}
    </Tabs.Content>

    <Tabs.Content value="url" class="space-y-2">
      <div class="custom-url-row">
        <input
          type="text"
          bind:value={customUrl}
          placeholder="https://example.com/image.webp"
          class="custom-url-input"
        />
        <button
          type="button"
          class="use-url-btn rounded-md bg-stone-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
          on:click={useCustomUrl}
          disabled={!customUrl.trim()}
        >
          Use
        </button>
      </div>
    </Tabs.Content>
  </Tabs.Root>

  {#if uploadError}
    <p class="status-error mt-2 rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700">
      {uploadError}
    </p>
  {/if}
  {#if uploadFeedback}
    <p class="status-success mt-2 rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
      {uploadFeedback}
    </p>
  {/if}

  {#if selected}
    <div class="mt-2 flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-2">
      <img src={selected} alt="Selected preview" class="h-10 w-10 rounded object-cover" />
      <div class="min-w-0">
        <p class="truncate text-xs font-medium text-stone-700">Current image ready</p>
        <p class="truncate text-[11px] text-stone-500">{selected}</p>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .image-picker {
    input[type="file"] {
      position: absolute;
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      pointer-events: none;
    }
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.5rem;
  }

  .image-option {
    border: 2px solid #e7e5e4;
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    padding: 0;
    background: white;
    transition: border-color 0.15s ease, transform 0.15s ease;
    aspect-ratio: 1;
  }

  .image-option:hover {
    border-color: #E8E8E4;
    transform: scale(1.05);
  }

  .image-option.selected {
    border-color: #C41E3A;
    box-shadow: 0 0 0 2px rgba(196, 30, 58, 0.2);
  }

  .image-option img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .custom-url-row {
    display: flex;
    gap: 0.375rem;
  }

  .custom-url-input {
    flex: 1;
    padding: 0.375rem 0.5rem;
    border: 1px solid #E8E8E4;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-family: inherit;
    color: #2C2C2C;
  }

  .custom-url-input:focus {
    outline: none;
    border-color: #C41E3A;
    box-shadow: 0 0 0 2px rgba(196, 30, 58, 0.1);
  }

  .upload-dropzone {
    min-height: 42px;
  }
</style>
