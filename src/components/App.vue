<template>
    <paino-roll />
</template>

<script lang="ts">
import type { AppContext } from "@netless/window-manager";
import { inject } from "vue";
import paino_roll from "./paino_roll.vue";

export default {
  components: {
    "paino-roll": paino_roll,
  },
  setup() {
    const context = inject<AppContext>("context");
    if (!context)
      throw new Error("must call provide('context') before mount App");

    const midiEditor = inject<any>("midiEditor");
    if (!midiEditor) throw new Error("must call provide('midiEditor')");

    return {
      context,
      midiEditor,
    };
  },
  methods: {
  },
  mounted() {
  },
};
</script>
