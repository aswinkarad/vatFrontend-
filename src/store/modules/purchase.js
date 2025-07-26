import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default {
  namespaced: true,
  state: {
    PurchaseData: [],
    PurchaseAmount: [],
    loading: false,
    error: null,
    currentPurchase: null,
  },
  mutations: {
    SET_PURCHASELIST(state, data) {
      state.PurchaseData = data;
    },
    SET_PURCHASE_AMOUNT(state, data) {
      state.PurchaseAmount = data;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_CURRENT_PURCHASE(state, purchase) {
      state.currentPurchase = purchase;
    },
    ADD_PURCHASE(state, purchase) {
      if (state.PurchaseData && Array.isArray(state.PurchaseData.data)) {
        state.PurchaseData.data.push(purchase);
      } else {
        state.PurchaseData = { data: [purchase] };
      }
    },
    UPDATE_PURCHASE(state, updatedPurchase) {
      if (state.PurchaseData && Array.isArray(state.PurchaseData.data)) {
        const index = state.PurchaseData.data.findIndex(
          (p) => p.id === updatedPurchase.id
        );
        if (index !== -1) {
          state.PurchaseData.data.splice(index, 1, updatedPurchase);
        }
      }
    },
    REMOVE_PURCHASE(state, purchaseId) {
      if (state.PurchaseData && Array.isArray(state.PurchaseData.data)) {
        state.PurchaseData.data = state.PurchaseData.data.filter(
          (p) => p.id !== purchaseId
        );
      }
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },
  actions: {
    async GET_PURCHASE_LISTS({ commit }, params) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        const options = {
          method: "get",
          url: `${baseURL}purchase/listByClient`,
          params: params,
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        };

        const response = await axios(options);
        commit("SET_PURCHASELIST", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching purchases:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message || error.message || "Error fetching purchases"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

async CREATE_PURCHASE({ commit }, purchaseData) { // `purchaseData` is the incoming parameter
  console.log("🚀 CREATE_PURCHASE started with data:", purchaseData);
  
  try {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);
    
    // Debug: Check localStorage
    const authString = localStorage.getItem("user");
    console.log("📦 Raw auth from localStorage:", authString);
    
    const auth = JSON.parse(authString);
    console.log("🔑 Parsed auth object:", auth);
    
    if (!auth || !auth.data || !auth.data.token) {
      console.error("❌ Authorization token not found. Auth structure:", auth);
      throw new Error("Authorization token not found");
    }
    
    console.log("✅ Token found:", auth.data.token.substring(0, 20) + "...");

    // Debug: Validation check
    console.log("🔍 Validating purchase data:");
    console.log("- date:", purchaseData.date);
    console.log("- amount:", purchaseData.amount);
    console.log("- purchase_tax_amount:", purchaseData.purchase_tax_amount);
    console.log("- categoryId:", purchaseData.categoryId);
    console.log("- taxTypeId:", purchaseData.taxTypeId);
    console.log("- companyId:", purchaseData.companyId);

    // This validation is good for the client side
    if (
      !purchaseData.date ||
      !purchaseData.amount ||
      purchaseData.purchase_tax_amount === undefined ||
      purchaseData.categoryId === null ||
      purchaseData.taxTypeId === null ||
      !purchaseData.companyId
    ) {
      console.error("❌ Validation failed. Missing required fields");
      throw new Error(
        "Date, amount, purchase tax amount, category ID, tax type ID, and company ID are required"
      );
    }
    
    console.log("✅ Validation passed");

    // Debug: Prepare request payload
    const requestPayload = {
      date: purchaseData.date,
      amount: purchaseData.amount,
      purchase_tax_amount: purchaseData.purchase_tax_amount,
      status: purchaseData.status !== undefined ? purchaseData.status : true,
      companyId: purchaseData.companyId,
      categoryId: purchaseData.categoryId,
      subcategoryId: purchaseData.subcategoryId || null,
      taxTypeId: purchaseData.taxTypeId,
    };
    
    console.log("📤 Request payload:", requestPayload);
    console.log("🌐 Request URL:", `${baseURL}purchase/create`);
    
    const requestHeaders = {
      Authorization: `Bearer ${auth.data.token}`,
      "Content-Type": "application/json",
    };
    
    console.log("📋 Request headers:", {
      ...requestHeaders,
      Authorization: `Bearer ${auth.data.token.substring(0, 20)}...` // Hide full token in logs
    });

    const response = await axios.post(
      `${baseURL}purchase/create`,
      requestPayload,
      {
        headers: requestHeaders,
      }
    );

    console.log("✅ API Response received:", response);
    console.log("📊 Response status:", response.status);
    console.log("📄 Response data:", response.data);

    // Renamed the variable to 'newPurchaseRecord' to avoid conflict
    const newPurchaseRecord = response.data.data || response.data; 
    console.log("💾 Data to commit:", newPurchaseRecord);
    
    // Use the new variable name here
    commit("ADD_PURCHASE", newPurchaseRecord); 
    
    console.log("🎉 CREATE_PURCHASE completed successfully");
    return response.data;
    
  } catch (error) {
    console.error("💥 Error in CREATE_PURCHASE:", error);
    
    // Debug: More detailed error logging
    if (error.response) {
      console.error("📡 Error response status:", error.response.status);
      console.error("📄 Error response data:", error.response.data);
      console.error("📋 Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("📡 No response received. Request:", error.request);
    } else {
      console.error("⚙️ Error setting up request:", error.message);
    }
    
    console.error("🔍 Full error object:", error);
    
    const errorMessage = error.response?.data?.message || error.message || "Error creating purchase";
    console.error("📝 Final error message:", errorMessage);
    
    commit("SET_ERROR", errorMessage);
    throw error;
  } finally {
    console.log("🏁 CREATE_PURCHASE finally block - setting loading to false");
    commit("SET_LOADING", false);
  }
},
    async UPDATE_PURCHASE({ commit }, { id, purchaseData }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        if (!id) {
          throw new Error("Purchase ID is required for update");
        }

        // You might want to add more validation for purchaseData fields here,
        // similar to CREATE_PURCHASE, depending on your update requirements.

        const response = await axios.put(
          `${baseURL}purchase/update/${id}`, // Endpoint to update a purchase by ID
          {
            date: purchaseData.date,
            amount: purchaseData.amount,
            purchase_tax_amount: purchaseData.purchase_tax_amount,
            status: purchaseData.status,
            companyId: purchaseData.companyId,
            categoryId: purchaseData.categoryId,
            subcategoryId: purchaseData.subcategoryId || null,
            taxTypeId: purchaseData.taxTypeId,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.data.token}`,
              "Content-Type": "application/json",
            },
          }
        );

       
        commit("UPDATE_PURCHASE", response.data.data || response.data);
        return response.data;
      } catch (error) {
        console.error("Error updating purchase:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message || error.message || "Error updating purchase"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async DELETE_PURCHASE({ commit }, purchaseId) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        if (!purchaseId) {
          throw new Error("Purchase ID is required for deletion");
        }

        const response = await axios.delete(`${baseURL}purchase/delete/${purchaseId}`, {
          // Endpoint to delete a purchase by ID
          headers: {
            Authorization: `Bearer ${auth.data.token}`,
          },
        });

        if (response.status === 200 || response.status === 204) {
          commit("REMOVE_PURCHASE", purchaseId); // Remove from local state on successful deletion
        } else {
          throw new Error("Failed to delete purchase");
        }

        return response.data;
      } catch (error) {
        console.error("Error deleting purchase:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message || error.message || "Error deleting purchase"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

   
    async GET_PURCHASE_BY_ID({ commit }, purchaseId) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        const response = await axios.get(`${baseURL}purchase/${purchaseId}`, {
          // Endpoint to get a single purchase by ID
          headers: {
            Authorization: `Bearer ${auth.data.token}`,
          },
        });

        commit("SET_CURRENT_PURCHASE", response.data.data || response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching purchase:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message || error.message || "Error fetching purchase"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },


    async GET_PURCHASE_AMOUNT({ commit }, params) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const auth = JSON.parse(localStorage.getItem("user"));
        if (!auth || !auth.data || !auth.data.token) {
          throw new Error("Authorization token not found");
        }

        const options = {
          method: "get",
          url: `${baseURL}purchase/TotalAmount`, // Endpoint to get total purchase amount
          params: params,
          headers: {
            Authorization: "Bearer " + auth.data.token,
          },
        };

        const response = await axios(options);
        commit("SET_PURCHASE_AMOUNT", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching purchase amount:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message ||
            error.message ||
            "Error fetching purchase amount"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

 
    CLEAR_ERROR({ commit }) {
      commit("CLEAR_ERROR");
    },

   
    CLEAR_CURRENT_PURCHASE({ commit }) {
      commit("SET_CURRENT_PURCHASE", null);
    },
  },
  getters: {

    getAllPurchases: (state) => {
      return state.PurchaseData.data || [];
    },

    getPurchasesByCompany: (state) => (companyId) => {
      const purchases = state.PurchaseData.data || [];
      return purchases.filter((purchase) => purchase.companyId === companyId);
    },

    getPurchasesByDateRange: (state) => (startDate, endDate) => {
      const purchases = state.PurchaseData.data || [];
      return purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate);
      });
    },


    getTotalPurchaseAmount: (state) => {
      const purchases = state.PurchaseData.data || [];
      return purchases.reduce((total, purchase) => total + (purchase.amount || 0), 0);
    },


    getTotalTaxAmount: (state) => {
      const purchases = state.PurchaseData.data || [];
      return purchases.reduce(
        (total, purchase) => total + (purchase.purchase_tax_amount || 0),
        0
      );
    },

 
    getActivePurchases: (state) => {
      const purchases = state.PurchaseData.data || [];
      return purchases.filter((purchase) => purchase.status === true);
    },

  
    isLoading: (state) => state.loading,

 
    getError: (state) => state.error,

   
    getCurrentPurchase: (state) => state.currentPurchase,
  },
};