import axios from "axios"
export default {
    namespaced: true,
    state: {
        CompanyList: [],
        
    },
    mutations: {
      
        SET_COMPANY_LIST(state, data) {
            state.CompanyList = data
        },
    },
    actions: {
       
        async GET_COMPANY_LIST({ commit, state }, data) {
            const auth = JSON.parse(localStorage.getItem('user'));    
            console.log('User from localStorage:', auth);
            
            try {
                const response = await axios({
                    method: 'get',
                    url: `${import.meta.env.VITE_API_BASE_URL}company/listByClient`,
                    headers: {
                        Authorization: 'Bearer ' + auth.data.token
                    }
                });
        
                console.log('Company List Response:', response.data);
                commit('SET_COMPANY_LIST', response.data.data);
                console.log('Company List in state:', state.CompanyList);
            } catch (error) {
                console.error('Error fetching company list:', error);
            }
        }
        
        
    },
    getters: {

    }

}