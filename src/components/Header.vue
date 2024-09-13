<template>
  <ion-header class="animated-header">
    <ion-toolbar>
      <div class="logo-container">
        <ion-buttons slot="start" v-if="!isHomePage">
          <ion-button @click="goBack" class="back-btn">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="animated-title">VAT</ion-title>
      </div>
      <ion-buttons slot="end">
        <ion-button @click="showLogoutModal" class="logout-btn">
          <ion-icon :icon="logOutOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-modal :is-open="isLogoutModalOpen" @did-dismiss="closeLogoutModal">
    <ion-content class="ion-padding">
      <h2>Confirm Logout</h2>
      <p>Are you sure you want to logout?</p>
      <div class="button-container">
        <ion-button  color="light" @click="closeLogoutModal" class="button-container1">Cancel</ion-button>
        <ion-button  @click="confirmLogout">Yes</ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>


<script>
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, IonContent } from '@ionic/vue';
import { logOutOutline, arrowBackOutline } from 'ionicons/icons';
import axios from 'axios';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'Header',
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonModal,
    IonContent,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isHomePage = computed(() => route.path === '/home');
    const isLogoutModalOpen = ref(false);

    const showLogoutModal = () => {
      isLogoutModalOpen.value = true;
    };

    const closeLogoutModal = () => {
      isLogoutModalOpen.value = false;
    };

    const confirmLogout = async () => {
      const auth = JSON.parse(localStorage.getItem('user'));
      console.log(auth);
      try {
        await axios({
          method: 'get',
          url: `${import.meta.env.VITE_API_BASE_URL}/user/log_out`,
          headers: {
            Authorization: 'Bearer ' + auth.access_token
          }
        });
        localStorage.clear();
        router.push('/login');
        closeLogoutModal();
      } catch (error) {
        console.error('Error logging out:', error);
        localStorage.clear();
        router.push('/login');
        closeLogoutModal();
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    return {
      logOutOutline,
      arrowBackOutline,
      goBack,
      isHomePage,
      isLogoutModalOpen,
      showLogoutModal,
      closeLogoutModal,
      confirmLogout,
    };
  },
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
.button-container{
  float: right;
}
.button-container1{
padding: 5px;
}
.logo-container {
  display: flex;
  align-items: center;
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

.back-btn {
  --background: rgba(255, 255, 255, 0.2);
  --background-hover: rgba(255, 255, 255, 0.3);
  --background-activated: rgba(255, 255, 255, 0.4);
  --color: #852525;
  --border-radius: 50%;
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.back-btn ion-icon {
  font-size: 24px;
}

.back-btn:hover {
  --background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.logout-btn {
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

.logout-btn ion-icon {
  font-size: 24px;
}

.logout-btn:hover {
  --background: rgba(255, 255, 255, 0.4);
  transform: rotate(360deg);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}
</style>