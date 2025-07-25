import axios from 'axios'
export default {
    namespaced: true,
    state: {
        userData: {},
        UserList:[],
        UserwithIdList:[],
    },
    mutations: {
        SET_USER( state, user){
            localStorage.setItem('user', JSON.stringify(user) )
            state.userData = user
        },
        SET_USER_LIST(state, data){
            state.UserList = data
        },
        SET_USER_WITHID(state, data){
            state.UserwithIdList = data
        },
    },
    actions: {
    async USER_LOGIN({ commit }, payload) {
    try {
        const login = await axios({
            method: 'post',
            url: `${import.meta.env.VITE_API_BASE_URL}client/login`,
            data: {
                name: payload.name,
                password: payload.password
            }
        });
        // Ensure your backend sends all necessary user data including access_token
        // and potentially a refresh_token here.
        commit('SET_USER', login.data); // login.data should contain the user object + token(s)
        return login.data; // Return data for success handling in component
    } catch (error) {
        // Re-throw the error so the component can catch and display
        throw error;
    }
},
    // },
    async CLIENT_SIGN_UP({ commit, state }, payload) {
        const auth = JSON.parse(localStorage.getItem('user'))
        const options = {
            method: 'post',
            url: `${import.meta.env.VITE_API_BASE_URL}user/sign_up`,
            data: payload,
            headers: {
                Authorization: 'Bearer ' + auth.access_token
            }
        }
        const addClienty = await axios(options);
        // console.log(addClienty);
        //  commit('SET_CITY_TOTAL_PAGE', data.data.totalPages)
    },
    async GET_USER_LIST({ commit, state }, params){
        const auth = JSON.parse(localStorage.getItem('user'))
        // console.log(auth)
        const options = {
            method: 'get',
            url: `${import.meta.env.VITE_API_BASE_URL}users`,
            params: params,
            headers: {
                Authorization: 'Bearer ' + auth.access_token
            }
        }
        const data = await axios(options)
         commit('SET_USER_LIST', data.data)
        //  console.log(data);
        //  commit('SET_CITY_TOTAL_PAGE', data.data.totalPages)
      },
      async GET_USER_WITHID({ commit, state }, payload){
        const auth = JSON.parse(localStorage.getItem('user'))
        const options = await axios({
            method: 'get',
            url: `${import.meta.env.VITE_API_BASE_URL}users/get_user/${payload.id}`,
            data: payload,
            headers: {
                Authorization: 'Bearer ' + auth.access_token
            }
        })
         commit('SET_USER_WITHID', options.data)
        //  console.log(options);
        //  commit('SET_CITY_TOTAL_PAGE', data.data.totalPages)
      },
      async USER_UPDATE({ commit }, payload) {
        const auth = JSON.parse(localStorage.getItem('user'));
        try {
            const updateClient = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_BASE_URL}user/update_users/${payload.id}`,
                data: payload,
                headers: {
                    Authorization: 'Bearer ' + auth.access_token
                }
            });
            // console.log(updateClient);
            // Handle success if needed, e.g., commit('UPDATE_USER', updateClient.data)
        } catch (error) {
            // console.error('Error updating user:', error);
            throw error;  // Ensure errors are properly handled in the component
        }
    },
    async DELETE_USER({ commit, state }, data) {
        const auth = JSON.parse(localStorage.getItem('user'))
        const cat = await axios({
            method: 'delete',
            data: data,
            url: `${import.meta.env.VITE_API_BASE_URL}user/delete_user/${ data.id }`,
            headers: {
                Authorization: 'Bearer ' + auth.access_token
            }
        })
        // console.log(cat);
    },
    },
    getters: {
    }
}