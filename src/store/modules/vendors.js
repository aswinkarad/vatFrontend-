// vendors.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default {
  namespaced: true,
  state: {
    // Initialize vendorList as an empty array directly,
    // as your GET_VENDOR_LIST action commits response.data.data (which is an array)
    vendorList: [],
    loading: false, // Added for consistency with other modules
    error: null,    // Added for consistency with other modules
  },
  mutations: {
    SET_VENDOR_LIST(state, data) {
      // 'data' here is already the array of vendors (response.data.data)
      state.vendorList = data;
    },
    // Add mutations for loading and error states for consistency if needed
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_VENDOR(state, vendor) {
      state.vendorList.push(vendor);
    },
    UPDATE_VENDOR(state, updatedVendor) {
      const index = state.vendorList.findIndex(v => v.id === updatedVendor.id);
      if (index !== -1) {
        state.vendorList.splice(index, 1, updatedVendor);
      }
    },
    REMOVE_VENDOR(state, vendorId) {
      state.vendorList = state.vendorList.filter(v => v.id !== vendorId);
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  actions: {
    async GET_VENDOR_LIST({ commit }) { // Removed 'state' from destructuring, as it's not used directly here
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);

        const auth = JSON.parse(localStorage.getItem('user'));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error('Authorization token not found');
        }

        const options = {
          method: 'get',
          url: `${baseURL}vendor/list`, // Your correct endpoint
          headers: {
            Authorization: 'Bearer ' + auth.data.token
          }
        };

        const response = await axios(options);
        console.log('API response for vendors:', response.data);
        // Commit the actual array of vendor objects
        commit('SET_VENDOR_LIST', response.data.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Error fetching vendors');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async CREATE_VENDOR({ commit, dispatch }, vendorData) { // Added commit for loading/error
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!vendorData.vendor_name) {
          throw new Error("Vendor name is required");
        }

        const response = await axios.post(
          `${baseURL}vendor/create`,
          vendorData, // Send vendorData directly as it should contain vendor_name
          {
            headers: {
              Authorization: "Bearer " + auth.data.token,
              "Content-Type": "application/json",
            },
          }
        );
        // Assuming the API returns the newly created vendor object in response.data.data
        commit('ADD_VENDOR', response.data.data); // Directly add the new vendor to the state list
        // No need to dispatch GET_VENDOR_LIST if ADD_VENDOR updates state correctly
        return response.data;
      } catch (error) {
        console.error("Error creating vendor:", error);
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Failed to create vendor');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async UPDATE_VENDOR({ commit, dispatch }, { id, vendorData }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!id || !vendorData.vendor_name) {
          throw new Error("Vendor ID and name are required for update");
        }

        const response = await axios.put(
          `${baseURL}vendor/update/${id}`,
          vendorData,
          {
            headers: {
              Authorization: "Bearer " + auth.data.token,
              "Content-Type": "application/json",
            },
          }
        );
        commit('UPDATE_VENDOR', response.data.data); // Update the state with the returned data
        return response.data;
      } catch (error) {
        console.error("Error updating vendor:", error);
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Failed to update vendor');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async DELETE_VENDOR({ commit }, id) { // Changed to commit, as we remove from state directly
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!id) {
          throw new Error("Vendor ID is required for deletion");
        }

        const response = await axios.delete(`${baseURL}vendor/delete/${id}`, {
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        });

        if (response.status === 200 || response.status === 204) {
          commit("REMOVE_VENDOR", id); // Remove from state directly
        } else {
          throw new Error("Failed to delete vendor");
        }
        return response.data;
      } catch (error) {
        console.error("Error deleting vendor:", error);
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Error deleting vendor');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async READ_VENDOR({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        const options = {
          method: "get",
          url: `${baseURL}vendor/read/${id}`,
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        };
        const response = await axios(options);
        return response.data.data; // Return the data part
      } catch (error) {
        console.error("Error reading vendor:", error);
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Error reading vendor');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
  getters: {
    // This getter returns the array of vendor names for display in ion-select
    vendorNames: (state) => {
      return state.vendorList.map((vendor) => vendor.vendor_name);
    },
    // This getter returns the full array of vendor objects for lookup by ID
    vendors: (state) => {
      return state.vendorList;
    },
    // This getter is useful for finding a vendor object by its ID
    getVendorById: (state) => (id) => {
      // Ensure the ID is compared correctly (number to number)
      return state.vendorList.find((vendor) => vendor.id === parseInt(id));
    },
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
};