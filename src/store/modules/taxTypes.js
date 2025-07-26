// store/modules/taxTypes.js (Conceptual - if you need to fetch from an API)
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default {
  namespaced: true,
  state: {
    taxTypeList: [],
    loading: false,
    error: null,
  },
  mutations: {
    SET_TAX_TYPE_LIST(state, data) {
      state.taxTypeList = data;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_TAX_TYPE(state, taxType) {
      state.taxTypeList.push(taxType);
    },
    UPDATE_TAX_TYPE(state, updatedTaxType) {
      const index = state.taxTypeList.findIndex(
        (tt) => tt.id === updatedTaxType.id
      );
      if (index !== -1) {
        state.taxTypeList.splice(index, 1, updatedTaxType);
      }
    },
    REMOVE_TAX_TYPE(state, taxTypeId) {
      state.taxTypeList = state.taxTypeList.filter((tt) => tt.id !== taxTypeId);
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },
  actions: {
    async GET_TAX_TYPE_LIST({ commit }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        const options = {
          method: "get",
          url: `${baseURL}Tax/read`, // Replace with your actual endpoint
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        };

        const response = await axios(options);
        commit("SET_TAX_TYPE_LIST", response.data.rows || response.data.data);
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Error fetching tax types"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async CREATE_TAX_TYPE({ commit }, taxTypeData) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!taxTypeData.type_name) {
          throw new Error("Tax type name is required");
        }

        const response = await axios.post(
          `${baseURL}Tax/create`, // Replace with your actual endpoint
          taxTypeData,
          {
            headers: {
              Authorization: "Bearer " + auth.data.token,
              "Content-Type": "application/json",
            },
          }
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        commit("CLEAR_ERROR");
        return response.data;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to create tax type"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async UPDATE_TAX_TYPE({ commit }, { id, taxTypeData }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!id || !taxTypeData.type_name) {
          throw new Error("Tax type ID and name are required for update");
        }

        const response = await axios.put(
          `${baseURL}TaxType/update/${id}`, // Replace with your actual endpoint
          taxTypeData,
          {
            headers: {
              Authorization: "Bearer " + auth.data.token,
              "Content-Type": "application/json",
            },
          }
        );
        commit("UPDATE_TAX_TYPE", { id, ...taxTypeData });
        commit("CLEAR_ERROR");
        return response.data;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Failed to update tax type"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async DELETE_TAX_TYPE({ commit }, id) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);
        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }
        if (!id) {
          throw new Error("Tax type ID is required for deletion");
        }

        const response = await axios.delete(`${baseURL}TaxType/delete/${id}`, {
          // Replace with your actual endpoint
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        });

        if (response.status === 200 || response.status === 204) {
          commit("REMOVE_TAX_TYPE", id);
          commit("CLEAR_ERROR");
        } else {
          throw new Error("Failed to delete tax type");
        }
        return response.data;
      } catch (error) {
        console.error("Error deleting tax type:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Error deleting tax type"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
  getters: {
    taxTypeNames: (state) => {
      return state.taxTypeList.map((taxType) => taxType.type_name);
    },
    taxTypes: (state) => {
      return state.taxTypeList;
    },
    getTaxTypeById: (state) => (id) => {
      return state.taxTypeList.find((taxType) => taxType.id === parseInt(id));
    },
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
};