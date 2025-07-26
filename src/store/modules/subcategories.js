// subcategories.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default {
  namespaced: true,
  state: {
    subcategoryList: [],
    loading: false,
    error: null,
  },
  mutations: {
    SET_SUBCATEGORY_LIST(state, data) {
      state.subcategoryList = data;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_SUBCATEGORY(state, subcategory) {
      state.subcategoryList.push(subcategory);
    },
    UPDATE_SUBCATEGORY(state, updatedSubcategory) {
      const index = state.subcategoryList.findIndex(
        (sc) => sc.id === updatedSubcategory.id
      );
      if (index !== -1) {
        state.subcategoryList.splice(index, 1, updatedSubcategory);
      }
    },
    REMOVE_SUBCATEGORY(state, subcategoryId) {
      state.subcategoryList = state.subcategoryList.filter(
        (sc) => sc.id !== subcategoryId
      );
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },
  actions: {
    async GET_SUBCATEGORY_LIST({ commit }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        const options = {
          method: "get",
          url: `${baseURL}SubCategory/list`, // Correct endpoint from Subcategory.router.js
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        };

        const response = await axios(options);
        console.log("API response for subcategories:", response.data);
        // Assuming the list API returns data in response.data.rows for pagination
        commit("SET_SUBCATEGORY_LIST", response.data.rows || response.data.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Error fetching subcategories"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

async CREATE_SUBCATEGORY({ commit }, subcategoryData) {
  try {
    console.log('=== Starting CREATE_SUBCATEGORY action ===');
    console.log('Input subcategoryData:', subcategoryData);
    
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);
    console.log('Loading state set to true, error cleared');
    
    const auth = JSON.parse(localStorage.getItem("user"));
    console.log('Retrieved auth from localStorage:', auth);
    
    if (!auth || !auth.data || !auth.data.token) {
      console.log('Auth validation failed:');
      console.log('- auth exists:', !!auth);
      console.log('- auth.data exists:', !!(auth && auth.data));
      console.log('- auth.data.token exists:', !!(auth && auth.data && auth.data.token));
      throw new Error("Authorization token not found");
    }
    console.log('Auth token found:', auth.data.token.substring(0, 20) + '...');
    
    if (!subcategoryData.sub_name) {
      console.log('Validation failed: sub_name is missing');
      console.log('subcategoryData.sub_name:', subcategoryData.sub_name);
      throw new Error("Subcategory name is required");
    }
    console.log('sub_name validation passed:', subcategoryData.sub_name);
    
    if (!subcategoryData.categoryId) {
      console.log('Validation failed: categoryId is missing');
      console.log('subcategoryData.categoryId:', subcategoryData.categoryId);
      throw new Error("Category ID is required");
    }
    console.log('categoryId validation passed:', subcategoryData.categoryId);
    
    const requestUrl = `${baseURL}SubCategory/create`;
    const requestHeaders = {
      Authorization: `Bearer ${auth.data.token}`,
      "Content-Type": "application/json",
    };
    
    console.log('API Request Details:');
    console.log('- URL:', requestUrl);
    console.log('- Headers:', requestHeaders);
    console.log('- Data:', subcategoryData);
    
    console.log('Making API call...');
    const response = await axios.post(
      requestUrl,
      subcategoryData,
      {
        headers: requestHeaders,
      }
    );
    
    console.log('=== API Response Received ===');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    console.log('Response data structure:');
    console.log('- response.data type:', typeof response.data);
    console.log('- response.data keys:', Object.keys(response.data || {}));
    
    if (response.data && response.data.data) {
      console.log('response.data.data:', response.data.data);
      console.log('response.data.data keys:', Object.keys(response.data.data || {}));
    }
    
    // Optional: Add the new subcategory to local state if you have a mutation for it
    // commit("ADD_SUBCATEGORY", response.data.data || response.data);
    
    console.log("Subcategory created successfully:", response.data);
    commit("CLEAR_ERROR");
    console.log('Error state cleared');
    
    console.log('Returning response.data:', response.data);
    console.log('=== CREATE_SUBCATEGORY action completed successfully ===');
    return response.data;
    
  } catch (error) {
    console.error('=== Error in CREATE_SUBCATEGORY action ===');
    console.error("Full error object:", error);
    console.error("Error message:", error.message);
    console.error("Error response:", error.response);
    
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
      console.error("Error response headers:", error.response.headers);
    }
    
    const errorMessage = error.response?.data?.message ||
      error.message ||
      "Failed to create subcategory";
    
    console.error("Final error message to commit:", errorMessage);
    
    commit(
      "SET_ERROR",
      errorMessage
    );
    
    console.error('Error committed to state');
    throw error;
    
  } finally {
    console.log('=== CREATE_SUBCATEGORY finally block ===');
    commit("SET_LOADING", false);
    console.log('Loading state set to false');
  }
},

    async UPDATE_SUBCATEGORY({ commit }, { id, subcategoryData }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!id || !subcategoryData.sub_name) {
          throw new Error("Subcategory ID and name are required for update");
        }

        const response = await axios.put(
          `${baseURL}SubCategory/update/${id}`, // Correct endpoint
          subcategoryData,
          {
            headers: {
              Authorization: "Bearer " + auth.data.token,
              "Content-Type": "application/json",
            },
          }
        );
       
        commit("UPDATE_SUBCATEGORY", { id, ...subcategoryData });
        commit('CLEAR_ERROR');
        return response.data;
      } catch (error) {
        console.error("Error updating subcategory:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to update subcategory"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async DELETE_SUBCATEGORY({ commit }, id) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!id) {
          throw new Error("Subcategory ID is required for deletion");
        }

        const response = await axios.delete(`${baseURL}SubCategory/delete/${id}`, {
          // Correct endpoint
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        });

        // Your controller returns "subcategory is deleted" on success
        if (response.status === 200 || response.status === 204) {
          commit("REMOVE_SUBCATEGORY", id);
          commit('CLEAR_ERROR');
        } else {
          throw new Error("Failed to delete subcategory");
        }
        return response.data;
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Error deleting subcategory"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    // No READ_SUBCATEGORY action provided in your backend controller/router.
    // If needed, you'd implement a route and controller for it and then this action.
  },
  getters: {
    subcategoryNames: (state) => {
      return state.subcategoryList.map((subcategory) => subcategory.sub_name);
    },
    subcategories: (state) => {
      return state.subcategoryList;
    },
    getSubcategoryById: (state) => (id) => {
      return state.subcategoryList.find((subcategory) => subcategory.id === parseInt(id));
    },
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
};