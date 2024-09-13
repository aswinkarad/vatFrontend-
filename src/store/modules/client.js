import axios from "axios"
export default {
    namespaced: true,
    state: {
        ClientList: [],
        // expectationWithId: {}
    },
    mutations: {
        SET_CLIENTLIST(state, data) {
            state.ClientList = data
        },
        // SET_EXPECTETION_WITH_ID(state, data) {
        //     state.expectationWithId = data
        // },
    },
    actions: {
        async GET_EXPECTETION_LIST({ commit, state }, params) {
            const auth = JSON.parse(localStorage.getItem('user'))
            // console.log(auth)
            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}client/read`,
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.access_token
                }
            }
            const data = await axios(options)
            commit('SET_CLIENTLIST', data.data.data)
            // console.log(state.expectationList);
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
        // async ADD_EXPECTETION({ commit, state }, payload) {
        //     const auth = JSON.parse(localStorage.getItem('user'))
        //     // console.log(auth)
        //     const options = {
        //         method: 'post',
        //         url: `${import.meta.env.VITE_API_BASE_URL}expectation/create`,
        //         data: payload,
        //         headers: {
        //             Authorization: 'Bearer ' + auth.access_token
        //         }
        //     }
        //     const add = await axios(options)
        //     // console.log(add);

        // },
        // async DELETE_EXPECTETION({ commit, state }, payload) {
        //     const auth = JSON.parse(localStorage.getItem('user'))
        //     // console.log(auth)
        //     const options = {
        //         method: 'delete',
        //         url: `${import.meta.env.VITE_API_BASE_URL}expectation/delete/${payload.id}`,

        //         headers: {
        //             Authorization: 'Bearer ' + auth.access_token
        //         }
        //     }
        //     const dell = await axios(options)
        //     // console.log(dell);

        // },
        // async UPDATE_EXPECTETION({ commit, state }, payload) {
        //     const auth = JSON.parse(localStorage.getItem('user'))
        //     // console.log(payload);
        //     // console.log(auth)
        //     const options = {
        //         method: 'put',
        //         url: `${import.meta.env.VITE_API_BASE_URL}expectation/update/${payload.id}`,
        //         data: payload,
        //         headers: {
        //             Authorization: 'Bearer ' + auth.access_token
        //         }
        //     }
        //     const update = await axios(options)
        //     // console.log(update);

        // },
    },
    getters: {

    }

}