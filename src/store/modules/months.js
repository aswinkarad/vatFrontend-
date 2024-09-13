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
        // SET_EXPECTETION_WITH_ID(state, data) {
        //     state.expectationWithId = data
        // },
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
            //  commit('SET_CITY_TOTAL_PAGE', data.data.totalPages)
        },
        // async GET_EXPECTETION_WITH_ID({ commit, state }, params) {
        //     const auth = JSON.parse(localStorage.getItem('user'))
        //     // console.log(auth)
        //     const options = {
        //         method: 'get',
        //         url: `${import.meta.env.VITE_API_BASE_URL}expectation/getList`,
        //         params: params,
        //         headers: {
        //             Authorization: 'Bearer ' + auth.access_token
        //         }
        //     }
        //     const data = await axios(options)
        //     commit('SET_EXPECTETION_WITH_ID', data.data.data[0])
        //     // console.log(state.expectationWithId);
        //     //  commit('SET_CITY_TOTAL_PAGE', data.data.totalPages)

        // },
      
    },
    getters: {

    }

}