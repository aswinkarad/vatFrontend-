import axios from "axios"

export default {
    namespaced: true,
    state: {
        SaleTypeList: [],
    },
    mutations: {
        /**
         * Sets the SaleTypeList in the state.
         * @param {Object} state - The current state.
         * @param {Array} data - The data to set for SaleTypeList.
         */
        SET_SALETYPE_LIST(state, data) {
            console.log('Mutation: SET_SALETYPE_LIST - Setting SaleTypeList with data:', data);
            state.SaleTypeList = data
        },
    },
    actions: {
        /**
         * Fetches the list of Sale Types from the API.
         * @param {Object} { commit, state } - Vuex commit and state objects.
         * @param {Object} params - Parameters for the GET request.
         */
        async GET_SALETYPE_LIST({ commit, state }, params) {
            console.log('Action: GET_SALETYPE_LIST - Starting fetch for SaleType list.');
            console.log('Action: GET_SALETYPE_LIST - Provided params:', params);

            const auth = JSON.parse(localStorage.getItem('user'));
            console.log('Action: GET_SALETYPE_LIST - Retrieved auth from localStorage:', auth);

            if (!auth || !auth.data || !auth.data.token) {
                console.error('Action: GET_SALETYPE_LIST - Authentication token not found in localStorage.');
                // Optionally, handle redirection or error state here
                return; 
            }

            const options = {
                method: 'get',
                url: `${import.meta.env.VITE_API_BASE_URL}SaleType/list`,
                params: params,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            };
            console.log('Action: GET_SALETYPE_LIST - Axios request options:', options);

            try {
                console.log('Action: GET_SALETYPE_LIST - Making API call...');
                const data = await axios(options);
                console.log('Action: GET_SALETYPE_LIST - API call successful. Response data:', data.data);
                commit('SET_SALETYPE_LIST', data.data);
                console.log('Action: GET_SALETYPE_LIST - SaleTypeList in state after commit:', state.SaleTypeList);
            } catch (error) {
                console.error('Action: GET_SALETYPE_LIST - Error fetching SaleType list:', error.response ? error.response.data : error.message);
                throw error; // Re-throw the error for further handling if needed
            }
        },

        /**
         * Creates a new Sale Type via API.
         * @param {Object} { commit, state } - Vuex commit and state objects.
         * @param {Object} payload - The data for the new Sale Type.
         */
        async CREATE_SALETYPE({ commit, state }, payload) {
            console.log('Action: CREATE_SALETYPE - Starting creation of new SaleType.');
            console.log('Action: CREATE_SALETYPE - Provided payload:', payload);

            const auth = JSON.parse(localStorage.getItem('user'));
            console.log('Action: CREATE_SALETYPE - Retrieved auth from localStorage:', auth);

            if (!auth || !auth.data || !auth.data.token) {
                console.error('Action: CREATE_SALETYPE - Authentication token not found in localStorage.');
                return;
            }

            const options = {
                method: 'post',
                url: `${import.meta.env.VITE_API_BASE_URL}SaleType/create`,
                data: payload,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            };
            console.log('Action: CREATE_SALETYPE - Axios request options:', options);

            try {
                console.log('Action: CREATE_SALETYPE - Making API call...');
                const data = await axios(options);
                console.log('Action: CREATE_SALETYPE - API call successful. Response data:', data.data);
                // No commit here as it's typically for creating, not updating the list directly after creation
                // You might want to re-fetch the list after creation if needed:
                // commit('GET_SALETYPE_LIST'); 
            } catch (error) {
                console.error('Action: CREATE_SALETYPE - Error creating SaleType:', error.response ? error.response.data : error.message);
                throw error;
            }
        },

        /**
         * Updates an existing Sale Type via API.
         * @param {Object} { commit, state } - Vuex commit and state objects.
         * @param {Object} payload - The data to update the Sale Type, including its ID.
         */
        async UPDATE_SALETYPE({ commit, state }, payload) {
            console.log('Action: UPDATE_SALETYPE - Starting update of SaleType.');
            console.log('Action: UPDATE_SALETYPE - Provided payload:', payload);

            const auth = JSON.parse(localStorage.getItem('user'));
            console.log('Action: UPDATE_SALETYPE - Retrieved auth from localStorage:', auth);

            if (!auth || !auth.data || !auth.data.token) {
                console.error('Action: UPDATE_SALETYPE - Authentication token not found in localStorage.');
                return;
            }
            if (!payload || !payload.id) {
                console.error('Action: UPDATE_SALETYPE - Payload missing ID for update.');
                return;
            }

            const options = {
                method: 'put',
                url: `${import.meta.env.VITE_API_BASE_URL}SaleType/update/${payload.id}`,
                data: payload,
                headers: {
                    Authorization: 'Bearer ' + auth.data.token
                }
            };
            console.log('Action: UPDATE_SALETYPE - Axios request options:', options);

            try {
                console.log('Action: UPDATE_SALETYPE - Making API call...');
                const data = await axios(options);
                console.log('Action: UPDATE_SALETYPE - API call successful. Response data:', data.data);
                // No commit here as it's typically for updating, not updating the list directly after update
                // You might want to re-fetch the list after update if needed:
                // commit('GET_SALETYPE_LIST');
            } catch (error) {
                console.error('Action: UPDATE_SALETYPE - Error updating SaleType:', error.response ? error.response.data : error.message);
                throw error;
            }
        },

        /**
         * Deletes a Sale Type via API.
         * @param {Object} { commit } - Vuex commit object.
         * @param {string} id - The ID of the Sale Type to delete.
         */
        async DELETE_SALETYPE({ commit }, id) {
            console.log('Action: DELETE_SALETYPE - Starting deletion of SaleType.');
            console.log('Action: DELETE_SALETYPE - Provided ID:', id);

            const auth = JSON.parse(localStorage.getItem("user"));
            console.log('Action: DELETE_SALETYPE - Retrieved auth from localStorage:', auth);

            if (!auth || !auth.data || !auth.data.token) {
                console.error('Action: DELETE_SALETYPE - Authentication token not found in localStorage.');
                return;
            }
            if (!id) {
                console.error('Action: DELETE_SALETYPE - ID is missing for deletion.');
                return;
            }

            try {
                console.log('Action: DELETE_SALETYPE - Making API call...');
                const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}SaleType/delete/${id}`, {
                    headers: {
                        Authorization: "Bearer " + auth.data.token,
                    },
                });
                console.log('Action: DELETE_SALETYPE - API call successful. Response data:', response.data);
                // No commit here as it's typically for deleting, not updating the list directly after deletion
                // You might want to re-fetch the list after deletion if needed:
                // commit('GET_SALETYPE_LIST');
            } catch (error) {
                console.error("Action: DELETE_SALETYPE - Error deleting SaleType:", error.response ? error.response.data : error.message);
                throw error;
            }
        },
    },
    getters: {
        // Getters can be added here if needed to derive state.
    }
}