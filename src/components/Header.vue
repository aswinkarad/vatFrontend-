<template>
  <ion-header class="animated-header">
    <ion-toolbar>
      <div class="logo-container">
        <ion-buttons slot="start" v-if="!isHomePage">
          <ion-button @click="goBack" class="back-btn">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="animated-title">Wadiah Digital</ion-title>
      </div>
      <ion-buttons slot="end">
        <ion-button @click="showLogoutModal" class="logout-btn">
          <ion-icon :icon="logOutOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <!-- Enhanced Mobile Responsive Logout Modal -->
  <ion-modal 
    :is-open="isLogoutModalOpen" 
    @did-dismiss="closeLogoutModal" 
    class="logout-modal"
    :breakpoints="[0, 0.25, 0.5, 0.75]"
    :initial-breakpoint="0.5"
  >
    <div class="modal-wrapper">
      <ion-content class="modal-content">
        <!-- Modal Handle for Mobile -->
        <div class="modal-handle"></div>
        
        <!-- Close Button -->
        <ion-button 
          fill="clear" 
          class="close-btn" 
          @click="closeLogoutModal"
        >
          <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
        </ion-button>

        <!-- Modal Header -->
        <div class="modal-header">
          <div class="icon-container">
            <ion-icon :icon="logOutOutline" class="modal-icon"></ion-icon>
          </div>
          <h2 class="modal-title">Sign Out</h2>
          <p class="modal-subtitle">Are you sure you want to sign out of your account?</p>
        </div>

        <!-- Modal Actions -->
        <div class="modal-actions">
          <ion-button 
            expand="block" 
            fill="outline" 
            color="medium"
            @click="closeLogoutModal" 
            class="cancel-btn"
          >
            <ion-icon :icon="closeOutline" slot="start"></ion-icon>
            Cancel
          </ion-button>
          
          <ion-button 
            expand="block" 
            color="danger" 
            @click="confirmLogout" 
            class="confirm-btn"
          >
            <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
            Sign Out
          </ion-button>
        </div>

        <!-- Additional Info -->
        <div class="modal-footer">
          <p class="footer-text">You'll need to sign in again to access your account</p>
        </div>
      </ion-content>
    </div>
  </ion-modal>
</template>

<script>
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonModal, 
  IonContent 
} from '@ionic/vue';
import { 
  logOutOutline, 
  arrowBackOutline, 
  closeOutline 
} from 'ionicons/icons';
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
      closeOutline,
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
/* Header Styles */
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

.back-btn, .logout-btn {
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

.back-btn ion-icon, .logout-btn ion-icon {
  font-size: 24px;
}

.back-btn:hover {
  --background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.logout-btn:hover {
  --background: rgba(255, 255, 255, 0.4);
  transform: rotate(360deg);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

/* Enhanced Modal Styles */
.logout-modal {
  --backdrop-opacity: 0.4;
}

.modal-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.modal-content {
  --background: #ffffff;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  border-radius: 20px 20px 0 0;
  position: relative;
  min-height: 100%;
}

/* Modal Handle for Mobile */
.modal-handle {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  margin: 12px auto 0;
  transition: all 0.3s ease;
}

.modal-handle:hover {
  background: #9ca3af;
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  --color: #6b7280;
  --background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  z-index: 10;
}

.close-btn ion-icon {
  font-size: 20px;
}

/* Modal Header */
.modal-header {
  text-align: center;
  padding: 32px 24px 24px;
}

.icon-container {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15);
}

.modal-icon {
  font-size: 36px;
  color: #ef4444;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.modal-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
}

/* Modal Actions */
.modal-actions {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cancel-btn, .confirm-btn {
  --border-radius: 14px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: -0.01em;
  transition: all 0.3s ease;
  text-transform: none;
}

.cancel-btn {
  --color: #374151;
  --border-color: #d1d5db;
  --background: transparent;
  margin-bottom: 8px;
}

.cancel-btn:hover {
  --background: #f9fafb;
  --border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.confirm-btn {
  --background: #ef4444;
  --color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.confirm-btn:hover {
  --background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

/* Modal Footer */
.modal-footer {
  padding: 0 24px 32px;
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.4;
}

/* Mobile Responsive Styles */
@media (max-width: 480px) {
  .modal-content {
    border-radius: 16px 16px 0 0;
  }
  
  .modal-header {
    padding: 24px 20px 20px;
  }
  
  .icon-container {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }
  
  .modal-icon {
    font-size: 32px;
  }
  
  .modal-title {
    font-size: 22px;
  }
  
  .modal-subtitle {
    font-size: 15px;
    max-width: 260px;
  }
  
  .modal-actions {
    padding: 0 20px 20px;
    gap: 10px;
  }
  
  .cancel-btn, .confirm-btn {
    --padding-top: 14px;
    --padding-bottom: 14px;
    font-size: 15px;
  }
  
  .modal-footer {
    padding: 0 20px 24px;
  }
  
  .footer-text {
    font-size: 13px;
  }
}

/* Tablet Styles */
@media (min-width: 481px) and (max-width: 768px) {
  .logout-modal {
    --width: 420px;
    --height: auto;
  }
  
  .modal-content {
    border-radius: 20px;
    max-width: 420px;
    margin: auto;
  }
  
  .modal-actions {
    flex-direction: row;
    gap: 16px;
  }
  
  .cancel-btn, .confirm-btn {
    flex: 1;
  }
}

/* Desktop Styles */
@media (min-width: 769px) {
  .logout-modal {
    --width: 440px;
    --height: auto;
  }
  
  .modal-content {
    border-radius: 24px;
    max-width: 440px;
    margin: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }
  
  .modal-handle {
    display: none;
  }
  
  .modal-actions {
    flex-direction: row;
    gap: 16px;
  }
  
  .cancel-btn, .confirm-btn {
    flex: 1;
  }
  
  .cancel-btn:hover, .confirm-btn:hover {
    transform: translateY(-2px);
  }
}

/* Animation */
.logout-modal {
  animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>