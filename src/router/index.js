import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/Home.vue';
import Months from '../views/Months.vue';
import DaysView from '../views/DaysView.vue';
import DayDetails from '../views/DayDetails.vue';
import PurchasePage from '../views/Purchase.vue';
import SalesPage from '../views/Sales.vue';
import Login from '../views/Login.vue';
// import Signup from '../views/Signup.vue'; // Assuming you might have a signup page
import axios from 'axios';
// import store from '../store'; // Store is not directly used in router, but actions/mutations are dispatched from components.

const routes = [
  {
    // This is your root path, which acts as the initial entry point.
    // It redirects based on authentication status.
    path: '/',
    redirect: '/home', // Redirect authenticated users to home by default
    beforeEnter: async (to, from, next) => {
      const auth = JSON.parse(localStorage.getItem('user')); // Get stored user data

      // Check if user data exists and has an access_token
      if (auth && auth.access_token) {
        try {
          // Attempt to validate the access_token with the backend
          await axios({
            method: 'get',
            url: `${import.meta.env.VITE_API_BASE_URL}client/authCheck`,
            headers: {
              Authorization: 'Bearer ' + auth.access_token
            }
          });
          // If authCheck succeeds, proceed to the intended route.
          // If the user lands on '/', redirect them to '/home'.
          if (to.path === '/') {
            next('/home');
          } else {
            next(); // Allow navigation to other authenticated routes
          }
        } catch (err) {
          // If authCheck fails (e.g., token expired, invalid, network error)
          console.error('Authentication check failed:', err);
          localStorage.clear(); // Clear all local storage items, effectively logging out
          next({ name: 'Login' }); // Redirect to the login page using its name
        }
      } else {
        // No user data or access_token found, redirect to login page
        next({ name: 'Login' });
      }
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    // This guard prevents an already logged-in user from seeing the login page
    beforeEnter: (to, from, next) => {
      const auth = JSON.parse(localStorage.getItem('user'));
      if (auth && auth.access_token) {
        // If logged in, redirect to home
        next('/home');
      } else {
        next(); // Otherwise, allow access to the login page
      }
    }
  },
  // If you have a signup page
  // {
  //   path: '/signup',
  //   name: 'Signup',
  //   component: Signup,
  //   beforeEnter: (to, from, next) => {
  //     const auth = JSON.parse(localStorage.getItem('user'));
  //     if (auth && auth.access_token) {
  //       next('/home'); // If already logged in, redirect from signup
  //     } else {
  //       next();
  //     }
  //   }
  // },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    // You can also add `beforeEnter` here if you want specific auth checks for /home,
    // but the root '/' guard already covers it generally.
    // meta: { requiresAuth: true } // Removed meta for simplicity, relying on root guard
  },
  {
    path: '/months/:companyId',
    name: 'Months',
    component: Months,
    // meta: { requiresAuth: true }
  },
  {
    path: '/days/companyId/:companyId/:month/:year',
    name: 'DaysView',
    component: DaysView,
    props: route => ({
      month: parseInt(route.params.month, 10),
      year: parseInt(route.params.year, 10)
    }),
    meta: { requiresAuth: true } // Keep meta if you want more granular control,
                                // but ensure it works with your root guard.
  },
  {
    path: '/day-details/companyId/:companyId/date/:date',
    name: 'DayDetails',
    component: DayDetails,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/purchase/companyId/:companyId/:date',
    name: 'Purchase',
    component: PurchasePage,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/sales/companyId/:companyId/:date',
    name: 'Sales',
    component: SalesPage,
    props: true,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(), // Using createWebHistory for standard web history API
  routes,
});

// Optional: If you want to use meta fields for authentication on specific routes,
// you can re-introduce a global beforeEach guard.
// However, your current root '/' guard is quite comprehensive.
// router.beforeEach(async (to, from, next) => {
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   const auth = JSON.parse(localStorage.getItem('user'));
//
//   if (requiresAuth && (!auth || !auth.access_token)) {
//     next('/login');
//   } else if (to.path === '/login' && auth && auth.access_token) {
//     next('/home');
//   } else {
//     next();
//   }
// });


export default router;