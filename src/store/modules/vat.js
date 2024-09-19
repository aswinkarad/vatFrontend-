import axios from "axios"
export default {
    namespaced: true,
    state: {
        VATList: [],
    },
    mutations: {
        SET_VATLIST(state, data) {
            state.VATList = data
        },
        
    },
    actions: {
        async GET_VAT_LIST({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}vat/listByClient`,
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_VATLIST', data.data)
            console.log(state.VATList);
            
        },
    },
    getters: {

    }

}