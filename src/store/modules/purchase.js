import axios from "axios"
export default {
    namespaced: true,
    state: {
        PurchaseData: [],
        PurchaseAmount:[],
    },
    mutations: {
        SET_PURCHASELIST(state, data) {
            state.PurchaseData = data
        },
        SET_PURCHASE_AMOUNT(state, data) {
            state.PurchaseAmount = data
        },
    },
    actions: {
        async GET_PURCHASE_LISTS({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}purchase/listByClient`, 
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_PURCHASELIST', data.data)
            console.log(state.PurchaseData);
        },
        async GET_PURCHASE_AMOUNT({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}purchase/TotalAmount`, 
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_PURCHASE_AMOUNT', data.data)
            // console.log(state.PurchaseAmount);
        },
       
    },
    getters: {

    }

}