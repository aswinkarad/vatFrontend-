<!-- src/components/Footer.vue -->
<template>
    <ion-footer>
      <ion-toolbar>
   
      </ion-toolbar>
    </ion-footer>
  </template>
  
  <script>
  import { IonFooter, IonToolbar, IonButtons, IonButton } from '@ionic/vue';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'Footer',
    components: {
      IonFooter,
      IonToolbar,
      IonButtons,
      IonButton
    },
    setup() {
      const router = useRouter();
  
      const goBack = () => {
        router.go(-1);
      };
  
      const goHome = () => {
        router.push('/');
      };
  
      const addNew = () => {
        console.log('Add new item');
      };
  
      return {
        goBack,
        goHome,
        addNew
      };
    }
  };
  </script>
  
 