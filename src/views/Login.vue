  <template>
    <ion-page class="login-container">
      <ion-content>
        <div class="login-container">
          <div class="logo-container">
            <img src="https://i.ibb.co/wFGJNYmH/Wadiahdigital.png" alt="Wadiah Digital Logo" class="logo" />
            <div class="logo-glow"></div>
          </div>

          <h1 class="title">Welcome Back!</h1>
          <p class="subtitle">Log in to continue to Wadiah Digital</p>

          <div class="input-container">
            <ion-input v-model="name" placeholder="Username" type="text" class="custom-input" clear-input>
              <ion-icon :icon="personOutline" slot="start" class="input-icon"></ion-icon>
            </ion-input>
            <div class="input-underline"></div>
          </div>

          <div class="input-container">
            <ion-input v-model="password" placeholder="Password" type="password" class="custom-input" clear-input>
              <ion-icon :icon="lockClosedOutline" slot="start" class="input-icon"></ion-icon>
            </ion-input>
            <div class="input-underline"></div>
          </div>

          <div class="forgot-password">
            <a @click="forgotPassword">Forgot Password?</a>
          </div>

          <ion-button expand="block" @click="login" class="login-button" :disabled="isButtonDisabled">
            {{ loading ? 'Logging in...' : 'Login' }}
            <ion-icon :icon="logInOutline" slot="end" class="button-icon"></ion-icon>
          </ion-button>

          <p class="signup-link">
            Don't have an account? <a @click="goToSignup">Sign up</a>
          </p>
        </div>

        <ion-toast
          :is-open="!!error"
          :message="error"
          duration="3000"
          color="danger"
          position="top"
          @didDismiss="closeError"
          class="custom-toast"
        >
        </ion-toast>

        <ion-toast
          :is-open="!!successMessage"
          :message="successMessage"
          duration="2000"
          color="success"
          position="top"
          class="custom-toast"
        >
        </ion-toast>
      </ion-content>
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

  const loading = ref(false); // Reactive state for showing loading indicator on button
  const name = ref('');       // Reactive state for username input
  const password = ref('');   // Reactive state for password input
  const error = ref(null);    // Reactive state for displaying error messages in a toast
  const successMessage = ref(null); // Reactive state for displaying success messages in a toast

  // Computed property to disable the login button when loading or inputs are empty
  const isButtonDisabled = computed(() => {
    return loading.value || !name.value || !password.value;
  });

  // Function to handle the login process
  const login = async () => {
    // Client-side validation: check if both fields are filled
    if (!name.value || !password.value) {
      error.value = 'Please enter both username and password.';
      return; // Stop execution if validation fails
    }

    loading.value = true; // Set loading to true to disable button and show indicator
    error.value = null; // Clear previous errors
    successMessage.value = null; // Clear previous success messages

    const payload = {
      name: name.value,
      password: password.value,
    };

    try {
      // Dispatch the USER_LOGIN action from the 'user' module in the Vuex store
      // This action handles the API call and storing user data in localStorage
      await store.dispatch('user/USER_LOGIN', payload);

      successMessage.value = 'Login successful! Redirecting to home page...';

      // IMPORTANT: As discussed, the `localStorage.setItem('auth', 'true')`
      // line can likely be removed if your authentication check in the router
      // relies solely on the presence of the `user` object in localStorage.
      // localStorage.setItem('auth', 'true');

      // Wait for a short duration to allow the success toast to be seen
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to the home page after successful login and toast display
      await router.push('/home');
    } catch (err) {
      // Log the full error object for debugging
      console.error('Login error:', err);
      // Display a user-friendly error message, prioritizing backend message
      error.value = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
    } finally {
      loading.value = false; // Set loading to false regardless of success or failure
    }
  };

  // Function to close the error toast
  const closeError = () => {
    error.value = null;
  };

  // Placeholder function for forgot password logic
  const forgotPassword = () => {
    console.log('Forgot password clicked');
    // You would typically navigate to a forgot password page here:
    // router.push('/forgot-password');
  };

  // Function to navigate to the signup page
  const goToSignup = () => {
    router.push('/signup'); // Assuming you have a '/signup' route defined
  };
  </script>

<style scoped>
/*
  The CSS styles provided here are exactly as you gave them.
  They are well-structured and provide a modern, visually appealing login page.
*/

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #c7f0bf 0%, #182848 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  z-index: 0;
}

.logo-container {
  position: relative;
  margin-bottom: 25px; /* Adjusted for better spacing */
  z-index: 1;
}

.logo {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 15px;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.2));
  animation: logoFloat 4s ease-in-out infinite;
  position: relative;
  z-index: 2;
  border-radius: 50%;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 170px;
  height: 170px;
  background: radial-gradient(circle, rgba(75, 108, 183, 0.7) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  text-align: center;
}

.subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  text-align: center;
}

.input-container {
  width: 100%;
  max-width: 350px;
  margin-bottom: 25px;
  position: relative;
  z-index: 1;
}

.custom-input {
  --background: rgba(255, 255, 255, 0.95);
  --border-radius: 10px;
  --padding-start: 50px;
  --padding-end: 15px;
  --padding-top: 15px;
  --padding-bottom: 15px;
  --color: #333333;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  position: relative;
}

.custom-input:focus-within {
  --background: #ffffff;
  box-shadow: 0 0 0 2px rgba(75, 108, 183, 0.5);
  transform: translateY(-2px);
}

.input-icon {
  color: #4b6cb7;
  font-size: 1.4rem;
  margin-right: 10px;
}

.input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #4b6cb7, #3a56a8);
  transition: width 0.3s ease;
}

.custom-input:focus-within + .input-underline {
  width: 100%;
}

.login-button {
  --border-radius: 10px;
  --background: linear-gradient(90deg, #42b887 0%, #048f3e 100%);
  --background-hover: linear-gradient(90deg, #11976a 0%, #2d4680 100%); /* Note: Hover background seems inconsistent with original primary colors, might want to align */
  --background-activated: #2d4680;
  --box-shadow: 0 6px 20px rgba(75, 108, 183, 0.4);
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  transition: all 0.3s ease;
  max-width: 350px;
  width: 100%;
  height: 50px;
  margin-top: 25px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  color: #ffffff;
}

.login-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s ease;
  z-index: -1;
}

.login-button:hover::after {
  left: 100%;
}

.login-button[disabled] {
  --background: #08a772; /* Darker green for disabled state */
  --box-shadow: none;
  opacity: 0.7;
}

.button-icon {
  font-size: 1.3rem;
  margin-left: 8px;
}

.forgot-password {
  width: 100%;
  max-width: 350px;
  text-align: right;
  margin-top: -8px;
  margin-bottom: 20px;
}

.forgot-password a {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password a:hover {
  color: #ffffff;
  text-decoration: underline;
}

.signup-link {
  margin-top: 30px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  position: relative;
  z-index: 1;
}

.signup-link a {
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.signup-link a:hover {
  text-decoration: underline;
  color: #e0e9ff;
}

.custom-toast {
  --border-radius: 10px;
  --box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  --max-width: 90%;
  font-weight: 500;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments for mobile */
@media (max-width: 480px) {
  .login-container {
    padding: 15px;
  }

  .logo {
    width: 120px;
    height: 120px;
  }

  .logo-glow {
    width: 140px;
    height: 140px;
  }

  .title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
    margin-bottom: 30px;
  }

  .input-container {
    max-width: 100%;
    margin-bottom: 20px;
  }

  .custom-input {
    --padding-start: 45px;
    --padding-top: 12px;
    --padding-bottom: 12px;
    --border-radius: 8px;
    font-size: 0.95rem;
  }

  .input-icon {
    font-size: 1.2rem;
  }

  .input-underline {
    height: 1.5px;
  }

  .login-button {
    --border-radius: 8px;
    font-size: 1rem;
    height: 45px;
    margin-top: 20px;
  }

  .button-icon {
    font-size: 1.2rem;
  }

  .forgot-password {
    margin-bottom: 15px;
  }

  .forgot-password a {
    font-size: 0.9rem;
  }

  .signup-link {
    margin-top: 25px;
    font-size: 0.9rem;
  }
}

/* Adjustments for very small screens (e.g., iPhone SE) */
@media (max-width: 375px) {
  .login-container {
    padding: 10px;
  }

  .logo {
    width: 100px;
    height: 100px;
  }

  .logo-glow {
    width: 120px;
    height: 120px;
  }

  .title {
    font-size: 1.6rem;
  }

  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 25px;
  }

  .custom-input {
    --padding-start: 40px;
    --padding-top: 10px;
    --padding-bottom: 10px;
    font-size: 0.9rem;
  }

  .input-icon {
    font-size: 1.1rem;
  }

  .input-underline {
    height: 1px;
  }

  .login-button {
    font-size: 0.95rem;
    height: 40px;
    margin-top: 15px;
  }

  .button-icon {
    font-size: 1.1rem;
  }

  .forgot-password a, .signup-link {
    font-size: 0.85rem;
  }
}
</style>