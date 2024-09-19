import axios from "axios"
export default {
    namespaced: true,
    state: {
        MonthList: [],
        // expectationWithId: {}
    },
    mutations: {
        SET_MONTHLIST(state, data) {
            state.MonthList = data
        },
        
    },
    actions: {
        async GET_MONTH_LIST({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}month/read`,
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            }
            const data = await axios(options)
            commit('SET_MONTHLIST', data.data)
            // console.log(state.MonthList);
            
        },
     
      
    },
    getters: {

    }

}