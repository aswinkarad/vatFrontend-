// // store/modules/bill.js

// import axios from 'axios';

// const state = {
//   bills: [],
//   currentBill: null,
//   totalItems: 0,
//   totalPages: 0,
//   currentPage: 0,
// };

// const mutations = {
//   SET_BILLS(state, bills) {
//     state.bills = bills;
//   },
//   SET_CURRENT_BILL(state, bill) {
//     state.currentBill = bill;
//   },
//   SET_PAGINATION(state, { totalItems, totalPages, currentPage }) {
//     state.totalItems = totalItems;
//     state.totalPages = totalPages;
//     state.currentPage = currentPage;
//   },
// };

// const actions = {
//   async createBill({ commit }, formData) {
//     try {
//       const response = await axios.post('/api/bills', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error creating bill:', error);
//       throw error;
//     }
//   },

//   async updateBill({ commit }, { id, formData }) {
//     try {
//       const response = await axios.put(`/api/bills/${id}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error updating bill:', error);
//       throw error;
//     }
//   },

//   async deleteBill({ commit }, id) {
//     try {
//       const response = await axios.delete(`/api/bills/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error deleting bill:', error);
//       throw error;
//     }
//   },

//   async fetchBills({ commit }, { page = 0, size = 16, title = '', id = '' }) {
//     try {
//       const response = await axios.get('/api/bills', {
//         params: { page, size, title, id },
//       });
//       commit('SET_BILLS', response.data.bill);
//       commit('SET_PAGINATION', {
//         totalItems: response.data.totalItems,
//         totalPages: response.data.totalPages,
//         currentPage: response.data.currentPage,
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching bills:', error);
//       throw error;
//     }
//   },
// };

// const getters = {
//   allBills: (state) => state.bills,
//   currentBill: (state) => state.currentBill,
//   paginationInfo: (state) => ({
//     totalItems: state.totalItems,
//     totalPages: state.totalPages,
//     currentPage: state.currentPage,
//   }),
// };

// export default {
//   namespaced: true,
//   state,
//   mutations,
//   actions,
//   getters,
// };

import axios from "axios"
export default {
    namespaced: true,
    state: {
        PurchaseList: [],
    },
    mutations: {
        SET_PURCHASELIST(state, data) {
            state.PurchaseList = data
        },
    },
    actions: {
        async GET_PURCHASE_LIST({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}bill/read`, 
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_PURCHASELIST', data.data)
            console.log(state.PurchaseList);
        },

        async ADD_BILL({ commit }, payload) {
          const data = new FormData();
          data.append("date", payload.date);
          data.append("companyId", payload.companyId);
          payload.image.forEach((file) => {
            data.append("image", file);
          });
    
          const auth = JSON.parse(localStorage.getItem("user"));
          try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}bill/create`, data, {
              headers: {
                Authorization: "Bearer " + auth.data.token,
                "Content-Type": "multipart/form-data",
              },
            });
            console.log(response.data);
          } catch (error) {
            console.error("Error creating bill:", error);
            throw error;
          }
        },
        
        // async UPDATE_BILL({ commit }, { id, payload }) {
        //   const data = new FormData();
        //   data.append("date", payload.date);
        //   data.append("companyId", payload.companyId);
        //   payload.image.forEach((file) => {
        //     data.append("image", file);
        //   });
    
        //   const auth = JSON.parse(localStorage.getItem("user"));
        //   try {
        //     const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}bill/update/${id}`, data, {
        //       headers: {
        //         Authorization: "Bearer " + auth.data.token,
        //         "Content-Type": "multipart/form-data",
        //       },
        //     });
        //     console.log(response.data);
        //   } catch (error) {
        //     console.error("Error updating bill:", error);
        //     throw error;
        //   }
        // },
        async UPDATE_BILL({ commit }, payload) {
          console.log('UPDATE_BILL payload:', payload); // Log the entire payload
        
          if (!payload || typeof payload !== 'object') {
            console.error('Invalid payload:', payload);
            throw new Error('Invalid payload for UPDATE_BILL');
          }
        
          const { id, date, companyId, image } = payload;
        
          if (!id) {
            console.error('Missing id in payload');
            throw new Error('Missing id in UPDATE_BILL payload');
          }
        
          const data = new FormData();
          
          if (date) data.append("date", date);
          if (companyId) data.append("companyId", companyId);
        
          if (image && image.length) {
            image.forEach((file) => {
              data.append("image", file);
            });
          }
        
          const auth = JSON.parse(localStorage.getItem("user"));
        
          try {
            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}bill/update/${id}`, data, {
              headers: {
                Authorization: "Bearer " + auth.data.token,
                "Content-Type": "multipart/form-data",
              },
            });
            console.log('Update response:', response.data);
            return response.data;
          } catch (error) {
            console.error("Error updating bill:", error);
            throw error;
          }
        },
    
        async DELETE_BILL({ commit }, id) {
          const auth = JSON.parse(localStorage.getItem("user"));
          try {
            const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}bill/delete/${id}`, {
              headers: {
                Authorization: "Bearer " + auth.data.token,
              },
            });
            console.log(response.data);
          } catch (error) {
            console.error("Error deleting bill:", error);
            throw error;
          }
        },
    
    },
    getters: {

    }

}