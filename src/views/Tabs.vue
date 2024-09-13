<!-- src/views/Tabs.vue -->
<template>
    <ion-page>
      <ion-content>
        <ion-router-outlet></ion-router-outlet>
      </ion-content>
      <TabsFooter />
    </ion-page>
  </template>
  
  <script>
  import { IonPage, IonContent, IonRouterOutlet } from '@ionic/vue';
  import TabsFooter from '@/components/TabsFooter.vue';
  
  export default {
    name: 'Tabs',
    components: {
      IonPage,
      IonContent,
      IonRouterOutlet,
      TabsFooter
    }
  };
  </script>