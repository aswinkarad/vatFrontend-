import axios from "axios"
export default {
    namespaced: true,
    state: {
        DateList: [],
    },
    mutations: {
        SET_DATELIST(state, data) {
            state.DateList = data
        },
      
    },
    actions: {
        async GET_DATE_LIST({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}dates/read`,
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_DATELIST', data.data)
            console.log(state.DateList);
        },
              
    },
    getters: {

    }

}