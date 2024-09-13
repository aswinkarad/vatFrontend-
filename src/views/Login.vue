<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-container">
        <h1 class="title">Welcome Back</h1>
        <div class="input-container">
          <ion-input v-model="name" placeholder="Username" type="text" class="custom-input" clear-input>
            <ion-icon :icon="personOutline" slot="start"></ion-icon>
          </ion-input>
        </div>
        <div class="input-container">
          <ion-input v-model="password" placeholder="Password" type="password" class="custom-input" clear-input>
            <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
          </ion-input>
        </div>
        <ion-button expand="block" @click="login" class="login-button" :disabled="isButtonDisabled">
          {{ loading ? 'Logging in...' : 'Login' }}
          <ion-icon :icon="logInOutline" slot="end"></ion-icon>
        </ion-button>
      </div>
    </ion-content>
    <ion-toast :is-open="!!error" :message="error" duration="3000" color="danger" @didDismiss="closeError"></ion-toast>
    <ion-toast :is-open="!!successMessage" :message="successMessage" duration="2000" color="success"></ion-toast>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonInput, IonButton, IonIcon, IonToast } from '@ionic/vue';
import { personOutline, lockClosedOutline, logInOutline } from 'ionicons/icons';

const store = useStore();
const router = useRouter();

const loading = ref(false);
const name = ref('');
const password = ref('');
const error = ref(null);
const successMessage = ref(null);

const isButtonDisabled = computed(() => {
  return loading.value || !name.value || !password.value;
});

const login = async () => {
  if (!name.value || !password.value) {
    error.value = 'Please enter both username and password.';
    return;
  }
  loading.value = true;
  const payload = {
    name: name.value,
    password: password.value,
  };
  try {
    await store.dispatch('user/USER_LOGIN', payload);
    successMessage.value = 'Login successful! Redirecting to home page...';
    localStorage.setItem('auth', 'true');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await router.push('/home');
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'An error occurred. Please try again.';
  } finally {
    loading.value = false;
  }
};

const closeError = () => {
  error.value = null;
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.input-container {
  width: 100%;
  margin-bottom: 15px;
}

.custom-input {
  --background: #fff;
  --border-radius: 8px;
  --padding-start: 15px;
  --padding-end: 15px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.login-button {
  --border-radius: 8px;
  --background: #007bff;
  --background-hover: #0056b3;
  --background-activated: #004085;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
}

.login-button[disabled] {
  --background: #ccc;
}

.ion-padding {
  padding-top: 0;
}

ion-toast {
  --border-radius: 10px;
}
</style>
