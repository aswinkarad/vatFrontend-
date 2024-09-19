import { createStore } from 'vuex'
import user from './modules/user';
import bill from './modules/bill'; 
import client from './modules/client';
import months from './modules/months';
import company from './modules/company';
import date from './modules/date';
import purchase from './modules/purchase';
import sales from './modules/sales';
import vat from './modules/vat'


export default createStore({
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user,
    bill, 
    client,
    months,
    company,
    date,
    purchase,
    sales,
    vat
  }
})