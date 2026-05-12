<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { AvatarUpload, Badge, Card, FormField, Input, PasswordInput, Typography, createAvatarProvider } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";







import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import type { PropDoc, EmitDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import type { AvatarProvider, AvatarSavePayload } from "../../../interfaces/forms/AvatarUpload.interface";

// Suppress unused import warnings — available for code examples
void Badge; void createAvatarProvider;

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.forms.avatarUpload.title"),
  description: () => t("pages.forms.avatarUpload.description"),
  ogTitle: () => `${t("pages.forms.avatarUpload.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.avatarUpload.description"),
});
// ── OpenAI live playground ────────────────────────────────────────────────────
const openaiKey = ref("");
const liveAvatarUrl = ref("");

/**
 * We use a ref (not a computed) so the provider stays alive after the key is
 * cleared from the input — keeping the AI buttons visible for regeneration.
 * The key is captured in a closure at the moment the user finishes typing it,
 * and erased from the input field immediately after every request.
 */
const liveProvider = ref<AvatarProvider | undefined>(undefined);

watch(openaiKey, (key) => {
  if (!key.trim()) return; // don't null out the ref when the input is cleared
  const capturedKey = key.trim();

  liveProvider.value = async ({ prompt, variant, image }, signal) => {
    const styleHint = variant && variant !== "default" ? `. Style: ${variant}` : "";
    const fullPrompt =
      (prompt || "A professional portrait avatar, photorealistic") + styleHint;

    try {
      if (image) {
        const form = new FormData();
        form.append("model", "gpt-image-1");
        form.append("image", image);
        form.append(
          "prompt",
          `Create an avatar portrait inspired by the person in this photo. ${fullPrompt}`
        );
        form.append("n", "1");
        form.append("size", "1024x1024");

        const res = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          signal,
          headers: { Authorization: `Bearer ${capturedKey}` },
          body: form,
        });
        if (!res.ok)
          throw new Error(`OpenAI ${res.status}: ${await res.text().catch(() => "")}`);
        const data: any = await res.json();
        const item = data.data[0];
        if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
        if (item.url) return item.url;
        throw new Error("No image data in OpenAI response");
      }

      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        signal,
        headers: {
          Authorization: `Bearer ${capturedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: fullPrompt,
          n: 1,
          size: "1024x1024",
        }),
      });
      if (!res.ok)
        throw new Error(`OpenAI ${res.status}: ${await res.text().catch(() => "")}`);
      const data: any = await res.json();
      return data.data[0].url;
    } finally {
      // Clear the key from the visible input — the provider closure still holds
      // the captured key in memory for regeneration, but it's no longer visible
      // in the DOM or accessible via DevTools input inspection.
      openaiKey.value = "";
    }
  };
});

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Enter", "Space"], action: t("pages.forms.avatarUpload.a11y.kbActivate") },
  { keys: ["Tab"], action: t("pages.forms.avatarUpload.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.avatarUpload.a11y.kbShiftTab") },
  { keys: ["Escape"], action: t("pages.forms.avatarUpload.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "role", value: '"button"', desc: t("pages.forms.avatarUpload.a11y.ariaRole") },
  { attribute: "aria-label", value: "string", desc: t("pages.forms.avatarUpload.a11y.ariaLabel") },
  { attribute: "aria-disabled", value: "true", desc: t("pages.forms.avatarUpload.a11y.ariaDisabled") },
  { attribute: "alt", value: "name prop", desc: t("pages.forms.avatarUpload.a11y.alt") },
  { attribute: "aria-live", value: '"polite"', desc: t("pages.forms.avatarUpload.a11y.ariaLive") },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.avatarUpload.a11y.focusUpload"),
  t("pages.forms.avatarUpload.a11y.focusCrop"),
  t("pages.forms.avatarUpload.a11y.focusTrap"),
  t("pages.forms.avatarUpload.a11y.focusDisabled"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgCrop = ref(true);
const pgDisabled = ref(false);
const pgReadonly = ref(false);
const pgAvatarUrl = ref("");

function resetPlayground() {
  pgSize.value = "medium";
  pgCrop.value = true;
  pgDisabled.value = false;
  pgReadonly.value = false;
  pgAvatarUrl.value = "";
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="avatarUrl"'];
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (!pgCrop.value) parts.push(':crop="false"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgReadonly.value) parts.push(':readonly="true"');
  return `<AvatarUpload ${parts.join(" ")} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const basicUrl = ref("");
const noCropUrl = ref("");
const sizeSUrl = ref("");
const sizeMUrl = ref("");
const sizeLUrl = ref("");
const saveModeUrl = ref("");
const aiUrl = ref("");
const lightboxUrl = ref("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=512&q=80");
const profileCardUrl = ref("");
const settingsRowUrl = ref("");
const inFormName = ref("Alan Pacheco");
const inFormBio = ref("");
const inFormUrl = ref("");
const readonlyUrl = ref("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&q=80");

// Mock AI provider — random portrait after 1.5s delay
const mockProvider: AvatarProvider = (_opts, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const seed = Math.floor(Math.random() * 1000);
      resolve(`https://picsum.photos/seed/${seed}/512/512`);
    }, 1500);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

// Manual save handler — simulates upload delay and returns the blob URL
async function handleSave(payload: AvatarSavePayload): Promise<string> {
  await new Promise((r) => setTimeout(r, 800));
  return payload.url;
}

// ── Code strings ──────────────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AvatarUpload } from 'mood-ui';

const avatarUrl = ref('');
<\/script>

<template>
  <AvatarUpload v-model="avatarUrl" />
</template>`;

const noCropCode = `<AvatarUpload v-model="avatarUrl" :crop="false" />`;

const sizesCode = `<div class="flex items-end gap-6">
  <AvatarUpload v-model="urlS" size="small" />
  <AvatarUpload v-model="urlM" size="medium" />
  <AvatarUpload v-model="urlL" size="large" />
</div>`;

const saveModeCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AvatarUpload } from 'mood-ui';
import type { AvatarSavePayload } from 'mood-ui';

const avatarUrl = ref('');

async function handleSave(payload: AvatarSavePayload): Promise<string> {
  const form = new FormData();
  if (payload.blob) {
    form.append('avatar', payload.blob, 'avatar.webp');
  }
  const res = await fetch('/api/upload-avatar', { method: 'POST', body: form });
  const { url } = await res.json();
  return url;
}
<\/script>

<template>
  <AvatarUpload
    v-model="avatarUrl"
    save-mode="manual"
    :on-save="handleSave"
    @saved="console.log('Saved to:', $event)"
  />
</template>`;

const aiCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AvatarUpload, createAvatarProvider } from 'mood-ui';

const avatarUrl = ref('');
const provider = createAvatarProvider({ url: '/api/generate-avatar' });
<\/script>

<template>
  <AvatarUpload
    v-model="avatarUrl"
    :ai="true"
    :provider="provider"
    name="Alan Pacheco"
    :prompt-suggestions="['LinkedIn professional', 'Cartoon', 'Anime portrait', 'Pixel art']"
    prompt-placeholder="Or describe your own style…"
  />
</template>`;

const lightboxCode = `<AvatarUpload
  v-model="avatarUrl"
  :lightbox="true"
  :readonly="true"
  name="Alan Pacheco"
/>

<!-- Also works in edit mode: -->
<AvatarUpload
  v-model="avatarUrl"
  :lightbox="true"
  name="Alan Pacheco"
/>`;

const profileCardCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AvatarUpload, Card, Typography } from 'mood-ui';

const avatarUrl = ref('');
<\/script>

<template>
  <!-- Horizontal profile card: avatar left, info right -->
  <Card class="max-w-sm">
    <div class="flex items-center gap-5">
      <AvatarUpload v-model="avatarUrl" size="large" :lightbox="true" name="Alan Pacheco" />
      <div class="flex flex-col gap-0.5">
        <Typography variant="heading" size="small" weight="medium">Alan Pacheco</Typography>
        <Typography variant="body" size="small" class="text-muted-foreground">Product Designer</Typography>
      </div>
    </div>
  </Card>
</template>`;

const settingsRowCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AvatarUpload, Card, Typography } from 'mood-ui';

const avatarUrl = ref('');
<\/script>

<template>
  <!-- Settings row: avatar + description, common in account settings -->
  <Card class="max-w-md">
    <div class="flex items-center gap-4">
      <AvatarUpload v-model="avatarUrl" :lightbox="true" name="Alan Pacheco" />
      <div class="flex-1">
        <Typography variant="heading" size="small" weight="medium">Profile photo</Typography>
        <Typography variant="body" size="small" class="text-muted-foreground mt-0.5">
          JPG, PNG or WebP. Max 5 MB.
        </Typography>
      </div>
    </div>
  </Card>
</template>`;

const inFormCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AvatarUpload, FormField, Input, Card } from 'mood-ui';

const avatarUrl = ref('');
const name = ref('Alan Pacheco');
const bio = ref('');
<\/script>

<template>
  <!-- Inside a profile form — centered avatar above the fields -->
  <Card class="max-w-sm">
    <div class="flex flex-col gap-5">
      <div class="flex justify-center">
        <AvatarUpload v-model="avatarUrl" :lightbox="true" name="Alan Pacheco" />
      </div>
      <FormField label="Display name">
        <Input v-model="name" placeholder="Alan Pacheco" full-width />
      </FormField>
      <FormField label="Bio">
        <Input v-model="bio" placeholder="Product Designer at…" full-width />
      </FormField>
    </div>
  </Card>
</template>`;

const readonlyCode = `<AvatarUpload
  v-model="avatarUrl"
  :readonly="true"
  :lightbox="true"
  name="Alan Pacheco"
/>`;

const typesCode = `export type AvatarVariant =
  | 'default' | 'realistic' | 'illustration' | 'watercolor' | 'oilpainting'
  | 'anime' | 'cartoon' | 'chibi' | 'minimal' | 'cyberpunk' | 'sketch'
  | 'pixel' | '3d' | 'retro' | 'fantasy' | 'gaming' | 'nft';

export interface AvatarUpload {
  modelValue?: string;
  ai?: boolean;
  provider?: AvatarProvider;
  variant?: AvatarVariant;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  readonly?: boolean;
  crop?: boolean;
  maxSize?: number;
  accept?: string[];
  regenerate?: boolean;
  lightbox?: boolean;
  promptPlaceholder?: string;
  promptSuggestions?: string[];
  saveMode?: 'auto' | 'manual' | 'none';
  onSave?: (payload: AvatarSavePayload) => Promise<string>;
}

export type AvatarProvider = (
  options: { prompt?: string; image?: File; variant?: string },
  signal?: AbortSignal,
) => Promise<string>;

export interface AvatarSavePayload {
  blob: Blob | null;   // null when AI URL was CORS-blocked; use remoteUrl instead
  url: string;
  remoteUrl?: string;  // original AI provider URL (when blob is null)
  source: 'upload' | 'generated' | 'transformed';
  mimeType: string;
  size: number;        // 0 when blob is null
}`;

// ── Integration code strings ─────────────────────────────────────────────────
const providerHelperCode = `import { createAvatarProvider } from 'mood-ui';

// Points at your backend endpoint
const provider = createAvatarProvider({ url: '/api/generate-avatar' });

// createAvatarProvider auto-routes:
//   • No image  → POST JSON  { prompt, variant }          → text-to-image
//   • With image → POST multipart { image, prompt, variant } → img2img`;

const openaiDirectCode = `// ⚠️  Dev / testing only — never expose API keys in production
//
// Routes automatically:
//   • User uploaded a photo → gpt-image-1 /v1/images/edits  (img2img)
//   • Text-only prompt      → dall-e-3    /v1/images/generations
import type { AvatarProvider } from 'mood-ui';

const key = import.meta.env.VITE_OPENAI_KEY;

const provider: AvatarProvider = async ({ prompt, variant, image }, signal) => {
  const styleHint = variant && variant !== 'default' ? \`. Style: \${variant}\` : '';
  const fullPrompt = (prompt || 'A professional portrait avatar') + styleHint;

  if (image) {
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('image', image);
    form.append('prompt', \`Avatar inspired by this photo. \${fullPrompt}\`);
    form.append('n', '1');
    form.append('size', '1024x1024');

    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST', signal,
      headers: { Authorization: \`Bearer \${key}\` },
      body: form,
    });
    const data = await res.json();
    const item = data.data[0];
    if (item.b64_json) return \`data:image/png;base64,\${item.b64_json}\`;
    return item.url;
  }

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', signal,
    headers: { Authorization: \`Bearer \${key}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'dall-e-3', prompt: fullPrompt, n: 1, size: '1024x1024' }),
  });
  return (await res.json()).data[0].url;
};`;

const replicateDirectCode = `// ⚠️  Dev / testing only
import { createAvatarProvider } from 'mood-ui';

const provider = createAvatarProvider({
  url: 'https://api.replicate.com/v1/models/stability-ai/stable-diffusion/predictions',
  headers: {
    Authorization: \`Bearer \${import.meta.env.VITE_REPLICATE_KEY}\`,
    Prefer: 'wait',
  },
  body: ({ prompt }) => ({ input: { prompt: prompt ?? 'portrait avatar' } }),
  extractUrl: (d: any) => d.output[0],
});`;

const backendNodeCode = `// Node.js / Express  (Hono, Fastify — same idea)
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer({ dest: '/tmp' });

// Text-to-image (no photo uploaded)
app.post('/api/generate-avatar', express.json(), async (req, res) => {
  const { prompt, variant } = req.body;
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: \`\${prompt ?? 'portrait avatar'}, style: \${variant ?? 'realistic'}\`,
    n: 1, size: '1024x1024',
  });
  res.json({ url: response.data[0].url });
});

// Image-to-image (photo uploaded by the component as multipart)
app.post('/api/generate-avatar-from-photo', upload.single('image'), async (req, res) => {
  const { prompt, variant } = req.body;
  const response = await openai.images.edit({
    model: 'gpt-image-1',
    image: fs.createReadStream(req.file.path),
    prompt: \`Avatar inspired by this photo. \${prompt ?? ''}, style: \${variant ?? 'realistic'}\`,
    n: 1, size: '1024x1024',
  });
  const item = response.data[0];
  res.json({ url: item.url, b64_json: item.b64_json });
});`;

const backendVercelCode = `// Vercel / Next.js — app/api/generate-avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    // img2img: component sent an image file
    const form = await req.formData();
    const image = form.get('image') as File;
    const prompt = form.get('prompt') as string;

    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image,
      prompt: \`Avatar inspired by this photo. \${prompt}\`,
      n: 1, size: '1024x1024',
    });
    const item = response.data[0];
    return NextResponse.json({ url: item.url, b64_json: item.b64_json });
  }

  // text-to-image
  const { prompt, variant } = await req.json();
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: \`\${prompt ?? 'portrait avatar'}, style: \${variant ?? 'realistic'}\`,
    n: 1, size: '1024x1024',
  });
  return NextResponse.json({ url: response.data[0].url });
}`;

const uploadBackendCode = `// Backend: receive the WebP blob and store it (S3 / Cloudinary / Supabase…)
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload-avatar', upload.single('avatar'), async (req, res) => {
  const url = await uploadToS3(req.file.buffer, \`avatars/\${userId}.webp\`);
  res.json({ url });
});

// Frontend:
import type { AvatarSavePayload } from 'mood-ui';

async function onSave(payload: AvatarSavePayload): Promise<string> {
  // blob is null when AI returned a CORS-restricted URL — use remoteUrl instead
  if (payload.blob) {
    const form = new FormData();
    form.append('avatar', payload.blob, 'avatar.webp');
    const res = await fetch('/api/upload-avatar', { method: 'POST', body: form });
    return (await res.json()).url;
  }
  // Fallback: ask your backend to proxy-download the remote URL
  const res = await fetch('/api/proxy-avatar', {
    method: 'POST',
    body: JSON.stringify({ url: payload.remoteUrl }),
    headers: { 'Content-Type': 'application/json' },
  });
  return (await res.json()).url;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  { name: "modelValue", type: "string", description: t("pages.forms.avatarUpload.props.modelValue") },
  { name: "ai", type: "boolean", default: "false", description: t("pages.forms.avatarUpload.props.ai") },
  { name: "provider", type: "AvatarProvider", description: t("pages.forms.avatarUpload.props.provider") },
  { name: "variant", type: "AvatarVariant", default: "'default'", description: t("pages.forms.avatarUpload.props.variant") },
  { name: "name", type: "string", description: t("pages.forms.avatarUpload.props.name") },
  { name: "size", type: "'small' | 'medium' | 'large'", default: "'medium'", description: t("pages.forms.avatarUpload.props.size") },
  { name: "disabled", type: "boolean", default: "false", description: t("pages.forms.avatarUpload.props.disabled") },
  { name: "readonly", type: "boolean", default: "false", description: t("pages.forms.avatarUpload.props.readonly") },
  { name: "crop", type: "boolean", default: "true", description: t("pages.forms.avatarUpload.props.crop") },
  { name: "lightbox", type: "boolean", default: "false", description: t("pages.forms.avatarUpload.props.lightbox") },
  { name: "maxSize", type: "number", default: "5242880", description: t("pages.forms.avatarUpload.props.maxSize") },
  { name: "accept", type: "string[]", default: "['image/png','image/jpeg','image/webp']", description: t("pages.forms.avatarUpload.props.accept") },
  { name: "regenerate", type: "boolean", default: "true", description: t("pages.forms.avatarUpload.props.regenerate") },
  { name: "promptPlaceholder", type: "string", description: t("pages.forms.avatarUpload.props.promptPlaceholder") },
  { name: "promptSuggestions", type: "string[]", description: t("pages.forms.avatarUpload.props.promptSuggestions") },
  { name: "saveMode", type: "'auto' | 'manual' | 'none'", default: "'none'", description: t("pages.forms.avatarUpload.props.saveMode") },
  { name: "onSave", type: "(payload: AvatarSavePayload) => Promise<string>", description: t("pages.forms.avatarUpload.props.onSave") },
]);

const emitsList = computed<EmitDoc[]>(() => [
  { name: "update:modelValue", payload: "string", description: t("pages.forms.avatarUpload.emits.updateModelValue") },
  { name: "generated", payload: "string", description: t("pages.forms.avatarUpload.emits.generated") },
  { name: "uploaded", payload: "File", description: t("pages.forms.avatarUpload.emits.uploaded") },
  { name: "error", payload: "Error", description: t("pages.forms.avatarUpload.emits.error") },
  { name: "loading", payload: "boolean", description: t("pages.forms.avatarUpload.emits.loading") },
  { name: "change", payload: "string | null", description: t("pages.forms.avatarUpload.emits.change") },
  { name: "remove", payload: "—", description: t("pages.forms.avatarUpload.emits.remove") },
  { name: "save", payload: "AvatarSavePayload", description: t("pages.forms.avatarUpload.emits.save") },
  { name: "saved", payload: "string", description: t("pages.forms.avatarUpload.emits.saved") },
  { name: "save-error", payload: "Error", description: t("pages.forms.avatarUpload.emits.saveError") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.avatarUpload.title')"
    :category="t('pages.forms.avatarUpload.category')"
    import-path="import { AvatarUpload } from 'mood-ui'"
    :description="t('pages.forms.avatarUpload.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="200px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.forms.avatarUpload.controls.size')"
            :options="[{ value: 'small' }, { value: 'medium' }, { value: 'large' }]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle :label="t('pages.forms.avatarUpload.controls.crop')" v-model="pgCrop" />
          <TbToggle :label="t('pages.forms.avatarUpload.controls.disabled')" v-model="pgDisabled" />
          <TbToggle :label="t('pages.forms.avatarUpload.controls.readonly')" v-model="pgReadonly" />
        </template>

        <AvatarUpload
          v-model="pgAvatarUrl"
          :size="pgSize"
          :crop="pgCrop"
          :disabled="pgDisabled"
          :readonly="pgReadonly"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>

      <!-- Basic -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.basic.title')"
        :description="t('pages.forms.avatarUpload.examples.basic.desc')"
        :code="basicCode"
      >
        <AvatarUpload v-model="basicUrl" />
      </ComponentPreview>

      <!-- No crop -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.noCrop.title')"
        :description="t('pages.forms.avatarUpload.examples.noCrop.desc')"
        :code="noCropCode"
      >
        <AvatarUpload v-model="noCropUrl" :crop="false" />
      </ComponentPreview>

      <!-- Sizes -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.sizes.title')"
        :description="t('pages.forms.avatarUpload.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex items-end gap-6">
          <AvatarUpload v-model="sizeSUrl" size="small" />
          <AvatarUpload v-model="sizeMUrl" size="medium" />
          <AvatarUpload v-model="sizeLUrl" size="large" />
        </div>
      </ComponentPreview>

      <!-- Save mode: manual -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.saveMode.title')"
        :description="t('pages.forms.avatarUpload.examples.saveMode.desc')"
        :code="saveModeCode"
      >
        <AvatarUpload
          v-model="saveModeUrl"
          save-mode="manual"
          :on-save="handleSave"
        />
      </ComponentPreview>

      <!-- AI generation (mock) -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.withAi.title')"
        :description="t('pages.forms.avatarUpload.examples.withAi.desc')"
        :code="aiCode"
      >
        <AvatarUpload
          v-model="aiUrl"
          :ai="true"
          :provider="mockProvider"
          name="Alan Pacheco"
          prompt-placeholder="e.g. cyberpunk hacker with glowing eyes"
        />
      </ComponentPreview>

      <!-- Lightbox -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.lightbox.title')"
        :description="t('pages.forms.avatarUpload.examples.lightbox.desc')"
        :code="lightboxCode"
      >
        <div class="flex items-center gap-6">
          <AvatarUpload v-model="lightboxUrl" :lightbox="true" name="Alan Pacheco" />
          <AvatarUpload v-model="lightboxUrl" :lightbox="true" :readonly="true" name="Alan Pacheco" />
        </div>
      </ComponentPreview>

      <!-- Profile card layout -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.profileCard.title')"
        :description="t('pages.forms.avatarUpload.examples.profileCard.desc')"
        :code="profileCardCode"
      >
        <Card class="max-w-sm w-full">
          <div class="flex items-center gap-5">
            <AvatarUpload v-model="profileCardUrl" size="large" :lightbox="true" name="Alan Pacheco" />
            <div class="flex flex-col gap-0.5">
              <Typography variant="heading" size="small" weight="medium">Alan Pacheco</Typography>
              <Typography variant="body" size="small" class="text-muted-foreground">Product Designer</Typography>
            </div>
          </div>
        </Card>
      </ComponentPreview>

      <!-- Settings row layout -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.settingsRow.title')"
        :description="t('pages.forms.avatarUpload.examples.settingsRow.desc')"
        :code="settingsRowCode"
      >
        <Card class="max-w-md w-full">
          <div class="flex items-center gap-4">
            <AvatarUpload v-model="settingsRowUrl" :lightbox="true" name="Alan Pacheco" />
            <div class="flex-1">
              <Typography variant="heading" size="small" weight="medium">Profile photo</Typography>
              <Typography variant="body" size="small" class="text-muted-foreground mt-0.5">
                JPG, PNG or WebP. Max 5 MB.
              </Typography>
            </div>
          </div>
        </Card>
      </ComponentPreview>

      <!-- Inside a form -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.inForm.title')"
        :description="t('pages.forms.avatarUpload.examples.inForm.desc')"
        :code="inFormCode"
      >
        <Card class="max-w-sm w-full">
          <div class="flex flex-col gap-5">
            <div class="flex justify-center">
              <AvatarUpload v-model="inFormUrl" :lightbox="true" name="Alan Pacheco" />
            </div>
            <FormField label="Display name">
              <Input v-model="inFormName" placeholder="Alan Pacheco" full-width />
            </FormField>
            <FormField label="Bio">
              <Input v-model="inFormBio" placeholder="Product Designer at…" full-width />
            </FormField>
          </div>
        </Card>
      </ComponentPreview>

      <!-- Read-only -->
      <ComponentPreview
        :title="t('pages.forms.avatarUpload.examples.readonly.title')"
        :description="t('pages.forms.avatarUpload.examples.readonly.desc')"
        :code="readonlyCode"
      >
        <AvatarUpload v-model="readonlyUrl" :readonly="true" :lightbox="true" name="Alan Pacheco" />
      </ComponentPreview>

      <!-- OpenAI live test -->
      <ComponentPreview
        title="🧪 OpenAI live test"
        description="Test real AI generation directly from your browser — no backend needed."
        :code="openaiDirectCode"
        min-height="340px"
      >
        <div class="flex flex-col items-center gap-3 w-full max-w-sm">

          <!-- Key input — always visible so the user can enter a new key after each generation -->
          <PasswordInput
            v-model="openaiKey"
            placeholder="sk-..."
            label="OpenAI API key"
            autocomplete="off"
            full-width
          />

          <!-- Trust note -->
          <Badge color="success" variant="subtle" size="small" class="text-center">
            🔒 Your key is only used for this request. It is never stored in
            cookies, localStorage, or sent to any server other than api.openai.com.
            It is erased from memory automatically after each generation.
          </Badge>

          <AvatarUpload
            v-model="liveAvatarUrl"
            :ai="true"
            :provider="liveProvider"
            :lightbox="true"
            size="large"
            name="Test user"
            save-mode="none"
            :prompt-suggestions="[
              'LinkedIn professional',
              'Realistic',
              'Watercolor',
              'Anime portrait',
              'Pixel art',
              'Cyberpunk',
              'Fantasy',
              'NFT',
            ]"
          />

          <Typography v-if="!openaiKey && !liveProvider" variant="body" size="small" class="text-muted-foreground text-center">
            Enter your key above to enable the generate button.
          </Typography>
        </div>
      </ComponentPreview>

    </template>

    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <template #extra>
      <!-- AI provider integration guide -->
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.forms.avatarUpload.integration.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground mb-2">
        {{ t("pages.forms.avatarUpload.integration.desc") }}
      </Typography>

      <!-- createAvatarProvider helper -->
      <Typography variant="heading" size="medium" weight="medium" as="h3" class="mt-6">
        {{ t("pages.forms.avatarUpload.integration.helperTitle") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground mb-2">
        {{ t("pages.forms.avatarUpload.integration.helperDesc") }}
      </Typography>
      <CodePreview :code="providerHelperCode" lang="ts" code-only />

      <!-- Backend: Node.js / Express -->
      <Typography variant="heading" size="medium" weight="medium" as="h3" class="mt-6">
        {{ t("pages.forms.avatarUpload.integration.backendNodeTitle") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground mb-2">
        {{ t("pages.forms.avatarUpload.integration.backendNodeDesc") }}
      </Typography>
      <CodePreview :code="backendNodeCode" lang="ts" code-only />

      <!-- Backend: Vercel / Next.js -->
      <Typography variant="heading" size="medium" weight="medium" as="h3" class="mt-6">
        {{ t("pages.forms.avatarUpload.integration.backendVercelTitle") }}
      </Typography>
      <CodePreview :code="backendVercelCode" lang="ts" code-only />

      <!-- Backend: file upload / CORS fallback -->
      <Typography variant="heading" size="medium" weight="medium" as="h3" class="mt-6">
        {{ t("pages.forms.avatarUpload.integration.uploadTitle") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground mb-2">
        {{ t("pages.forms.avatarUpload.integration.uploadDesc") }}
      </Typography>
      <CodePreview :code="uploadBackendCode" lang="ts" code-only />

      <!-- Direct API (dev only) -->
      <Typography variant="heading" size="medium" weight="medium" as="h3" class="mt-6">
        {{ t("pages.forms.avatarUpload.integration.directTitle") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground mb-2">
        {{ t("pages.forms.avatarUpload.integration.directDesc") }}
      </Typography>
      <CodePreview :code="openaiDirectCode" lang="ts" code-only />
      <CodePreview :code="replicateDirectCode" lang="ts" code-only />

      <!-- Types -->
      <Typography variant="heading" size="large" weight="medium" as="h2" class="mt-8">
        {{ t("pages.forms.avatarUpload.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground mb-2">
        {{ t("pages.forms.avatarUpload.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
