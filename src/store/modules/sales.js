import axios from "axios"
export default {
    namespaced: true,
    state: {
        SaleTotalAmount: [],
        SlaeList:[],
    },
    mutations: {
        SET_SALES_AMOUNT(state, data) {
            state.SaleTotalAmount = data
        },
        SET_SALES_LIST(state, data) {
            state.SlaeList = data
        },
    },
    actions: {
       
        async GET_SALES_AMOUNT({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}Sale/TotalAmount`, 
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_SALES_AMOUNT', data.data)
            // console.log(state.SaleTotalAmount);
        },
        async GET_SALE_LIST({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}Sale/ListByClient`, 
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_SALES_LIST', data.data)
            console.log(state.SlaeList);
        },

        async CREATE_SALES({ commit, state }, payload) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'post',
                url: `${import.meta.env.VITE_API_BASE_URL}Sale/create`,
                data: payload,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            // console.log(data.data);

        },
        async UPDATE_SALES({ commit, state }, payload) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'put',
                url: `${import.meta.env.VITE_API_BASE_URL}Sale/update/${payload.id}`,
                data: payload,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            // console.log(data);

        },
    
        async DELETE_SALES({ commit }, id) {
            const auth = JSON.parse(localStorage.getItem("user"));
            try {
              const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}Sale/delete/${id}`, {
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