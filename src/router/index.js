import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/Home.vue';
import Months from '../views/Months.vue';
import DaysView from '../views/DaysView.vue';
import DayDetails from '../views/DayDetails.vue';
import PurchasePage from '../views/Purchase.vue';
import SalesPage from '../views/Sales.vue';
import Login from '../views/Login.vue';
import axios from 'axios';
import store from '../store';

const routes = [
  {
    path: '/',
    redirect: '/login',
    beforeEnter: (to, from, next) => {
      const auth = JSON.parse(localStorage.getItem('user'))
      if (auth) {

        // next()
        axios({
          method: 'get',
          url: `${import.meta.env.VITE_API_BASE_URL}client/authCheck`,
          headers: {
            Authorization: 'Bearer ' + auth.access_token
          }
        }).then((result) => {
          // console.log(result);

          next()

        }).catch(err => {
          localStorage.clear('user')
          next({ name: 'signIn' })
        })
      } else {
        next({ name: 'signIn' })
      }
      // next() 
    },
  },
  // {
  //   path: '/',
  //   redirect: '/login'
  // },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    // meta: { requiresAuth: true }
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
    meta: { requiresAuth: true }
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

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes
// });

// Navigation guard to check authentication status
// router.beforeEach(async (to, from, next) => {
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   const isAuthenticated = localStorage.getItem('auth');

//   if (requiresAuth && !isAuthenticated) {
//     next('/login');
//   } else if (to.path === '/login' && isAuthenticated) {
//     next('/home');
//   } else {
//     next();
//   }
// });

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;