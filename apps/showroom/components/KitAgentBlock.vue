<script setup lang="ts">
/**
 * "Let an agent do it": the prompt to paste, what the agent does alone and
 * what only a person can do. Heading id `let-an-agent-do-it` is registered in
 * the page's table of contents by the Kit page.
 */
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ClipboardIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { agentPrompt, type AgentBlock } from "~/utils/kit-agents";

const props = defineProps<{ block: AgentBlock }>();
const { t } = useI18n();
const prompt = computed(() => agentPrompt(props.block));
const copied = ref(false);

function copy() {
  navigator.clipboard.writeText(prompt.value).then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  });
}
</script>

<template>
  <section class="kit-agent" aria-labelledby="let-an-agent-do-it">
    <h2 id="let-an-agent-do-it" class="kit-agent__title">{{ t("kit.agent.title") }}</h2>
    <p class="kit-agent__intro">{{ t("kit.agent.intro") }}</p>

    <div class="kit-agent__prompt">
      <div class="kit-agent__prompt-head">
        <span>{{ t("kit.agent.promptLabel") }}</span>
        <button type="button" class="kit-agent__copy" @click="copy">
          <CheckIcon v-if="copied" class="size-3.5" />
          <ClipboardIcon v-else class="size-3.5" />
          {{ copied ? t("kit.agent.copied") : t("kit.agent.copy") }}
        </button>
      </div>
      <pre class="kit-agent__pre"><code>{{ prompt }}</code></pre>
    </div>

    <div class="kit-agent__cols">
      <div>
        <h3>{{ t("kit.agent.canTitle") }}</h3>
        <ul>
          <li v-for="item in block.agentCan" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div>
        <h3>{{ t("kit.agent.mustTitle") }}</h3>
        <ul>
          <li v-for="item in block.humanMust" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
    <p class="kit-agent__note">{{ t("kit.agent.secretsNote") }}</p>
  </section>
</template>
