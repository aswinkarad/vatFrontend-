<template>
  <ion-app>
    <router-view></router-view>
  </ion-app>
</template>

<script>
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();
    return { router };
  },
});
</script>
