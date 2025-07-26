import axios from "axios"
export default {
    namespaced: true,
    state: {
        SaleTypeList: [],
    },
    mutations: {
        SET_SALETYPE_LIST(state, data) {
            state.SaleTypeList = data
        },
    },
    actions: {
       
         async GET_SALETYPE_LIST({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}SaleType/list`, 
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_SALETYPE_LIST', data.data)
            console.log(state.SaleTypeList);
        },
        
        async CREATE_SALETYPE({ commit, state }, payload) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'post',
                url: `${import.meta.env.VITE_API_BASE_URL}SaleType/create`,
                data: payload,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            // console.log(data.data);
        },
        async UPDATE_SALETYPE({ commit, state }, payload) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'put',
                url: `${import.meta.env.VITE_API_BASE_URL}SaleType/update/${payload.id}`,
                data: payload,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            // console.log(data);

        },
    
        async DELETE_SALETYPE({ commit }, id) {
            const auth = JSON.parse(localStorage.getItem("user"));
            try {
              const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}SaleType/delete/${id}`, {
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