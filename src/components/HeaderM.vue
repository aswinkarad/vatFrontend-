<!-- src/components/HeaderM.vue -->
<template>
  <ion-header class="animated-header">
    <ion-toolbar>
      <div class="logo-container">
        <!-- <ion-icon :icon="analyticsOutline" class="logo-icon"></ion-icon> -->
        <ion-title class="animated-title">Wadiah 
        Digital</ion-title>
      </div>
      <ion-buttons slot="end">
        <ion-button @click="closeModal" class="close-btn">
          <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script>
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { closeOutline, analyticsOutline } from 'ionicons/icons';

export default {
  name: 'HeaderM',
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon
  },
  setup() {
    return {
      closeOutline,
      analyticsOutline
    };
  },
  methods: {
    closeModal() {
      this.$emit('close-modal');
    }
  }
};
</script>

<style scoped>
.animated-header {
  --background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

ion-toolbar {
  --background: transparent;
  --color: rgb(95, 38, 38);
  padding: 0.5rem 1rem;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animated-title {
  font-size: 1.3rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn {
  --background: rgba(255, 255, 255, 0.2);
  --background-hover: rgba(255, 255, 255, 0.3);
  --background-activated: rgba(255, 255, 255, 0.4);
  --color: #852525;
  --border-radius: 50%;
  --padding-start: 10px;
  --padding-end: 10px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.close-btn::part(native) {
  padding: 0;
}

.close-btn ion-icon {
  font-size: 24px;
}

.close-btn:hover {
  --background: rgba(255, 255, 255, 0.4);
  transform: rotate(360deg);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}
</style>