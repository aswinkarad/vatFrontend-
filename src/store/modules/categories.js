// categories.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default {
  namespaced: true,
  state: {
    categoryList: [],
    loading: false,
    error: null,
  },
  mutations: {
    SET_CATEGORY_LIST(state, data) {
      state.categoryList = data;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_CATEGORY(state, category) {
      state.categoryList.push(category);
    },
    UPDATE_CATEGORY(state, updatedCategory) {
      const index = state.categoryList.findIndex(
        (c) => c.id === updatedCategory.id
      );
      if (index !== -1) {
        state.categoryList.splice(index, 1, updatedCategory);
      }
    },
    REMOVE_CATEGORY(state, categoryId) {
      state.categoryList = state.categoryList.filter(
        (c) => c.id !== categoryId
      );
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },
  actions: {
    async GET_CATEGORY_LIST({ commit }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        const options = {
          method: "get",
          url: `${baseURL}Category/list`, // Correct endpoint from category.router.js
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        };

        const response = await axios(options);
        console.log("API response for categories:", response.data);
        // Assuming the list API also returns data in response.data.data or directly in response.data.rows for pagination
        // Adjust this based on your actual API response structure for the list.
        // If your CategoryList in controller returns { rows: [...], count: N }, you'd use response.data.rows
        commit("SET_CATEGORY_LIST", response.data.rows || response.data.data); 
      } catch (error) {
        console.error("Error fetching categories:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Error fetching categories"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async CREATE_CATEGORY({ commit }, categoryData) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!categoryData.cat_name) {
          throw new Error("Category name is required");
        }

        const response = await axios.post(
          `${baseURL}Category/create`, // Correct endpoint
          categoryData,
          {
            headers: {
              Authorization: "Bearer " + auth.data.token,
              "Content-Type": "application/json",
            },
          }
        );
        // Your controller returns "category created successfully", so you might not get the full object back
        // If your API doesn't return the full created object, you might need to re-fetch the list or add a placeholder.
        // For now, assuming the API would ideally return the created category object.
        // If not, you could dispatch GET_CATEGORY_LIST or structure your API to return the created resource.
        // For demonstration, we'll assume the API could return data in response.data.data or directly.
        // Given your controller returns a string, consider dispatching GET_CATEGORY_LIST after a successful creation.
        // commit('ADD_CATEGORY', response.data.data); // This might not work as your controller returns a string.
        
        // A more robust approach if your backend just sends a success message:
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for backend to process
        commit('CLEAR_ERROR'); // Clear any previous errors
        return response.data; // Return the success message from the backend
      } catch (error) {
        console.error("Error creating category:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to create category"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async UPDATE_CATEGORY({ commit }, { id, categoryData }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!id || !categoryData.cat_name) {
          throw new Error("Category ID and name are required for update");
        }

        const response = await axios.put(
          `${baseURL}Category/update/${id}`, // Correct endpoint
          categoryData,
          {
            headers: {
              Authorization: "Bearer " + auth.data.token,
              "Content-Type": "application/json",
            },
          }
        );
        // Your controller returns "email is updated" (which seems like a copy-paste error from vendor)
        // Ideally, the backend would return the updated category object.
        // If it doesn't, you might need to re-fetch or make assumptions based on the input data.
        // For now, assuming the API would ideally return the updated object or we update based on input.
        commit("UPDATE_CATEGORY", { id, ...categoryData }); // Update based on provided data, assuming success
        commit('CLEAR_ERROR');
        return response.data;
      } catch (error) {
        console.error("Error updating category:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to update category"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async DELETE_CATEGORY({ commit }, id) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!id) {
          throw new Error("Category ID is required for deletion");
        }

        const response = await axios.delete(`${baseURL}Category/delete/${id}`, {
          // Correct endpoint
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        });

        // Your controller returns "category is deleted" on success
        if (response.status === 200 || response.status === 204) {
          commit("REMOVE_CATEGORY", id);
          commit('CLEAR_ERROR');
        } else {
          throw new Error("Failed to delete category");
        }
        return response.data;
      } catch (error) {
        console.error("Error deleting category:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Error deleting category"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

  
  },
  getters: {
    categoryNames: (state) => {
      return state.categoryList.map((category) => category.cat_name);
    },
    categories: (state) => {
      return state.categoryList;
    },
    getCategoryById: (state) => (id) => {
      return state.categoryList.find((category) => category.id === parseInt(id));
    },
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
};