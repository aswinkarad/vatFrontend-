
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