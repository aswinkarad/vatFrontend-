// purchase.js
import axios from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL

export default {
    namespaced: true,
    state: {
        PurchaseData: [],
        PurchaseAmount: [],
        loading: false, // Ensure this is present
        error: null,    // Ensure this is present
        currentPurchase: null
    },
    mutations: {
        SET_PURCHASELIST(state, data) {
            state.PurchaseData = data
        },
        SET_PURCHASE_AMOUNT(state, data) {
            state.PurchaseAmount = data
        },
        SET_LOADING(state, loading) {
            state.loading = loading
        },
        SET_ERROR(state, error) {
            state.error = error
        },
        SET_CURRENT_PURCHASE(state, purchase) {
            state.currentPurchase = purchase
        },
        ADD_PURCHASE(state, purchase) {
            if (state.PurchaseData.data) {
                state.PurchaseData.data.push(purchase)
            } else {
                state.PurchaseData = { data: [purchase] }
            }
        },
        UPDATE_PURCHASE(state, updatedPurchase) {
            if (state.PurchaseData.data) {
                const index = state.PurchaseData.data.findIndex(p => p.id === updatedPurchase.id)
                if (index !== -1) {
                    state.PurchaseData.data.splice(index, 1, updatedPurchase)
                }
            }
        },
        REMOVE_PURCHASE(state, purchaseId) {
            if (state.PurchaseData.data) {
                state.PurchaseData.data = state.PurchaseData.data.filter(p => p.id !== purchaseId)
            }
        },
        CLEAR_ERROR(state) {
            state.error = null
        }
    },
    actions: {
        // Get all purchases
        async GET_PURCHASE_LISTS({ commit }, params) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                const auth = JSON.parse(localStorage.getItem('user'))
                if (!auth || !auth.data || !auth.data.token) {
                    throw new Error('Authorization token not found')
                }

                const options = {
                    method: 'get',
                    url: `${baseURL}purchase/listByClient`,
                    params: params,
                    headers: {
                        Authorization: 'Bearer ' + auth.data.token
                    }
                }

                const response = await axios(options)
                commit('SET_PURCHASELIST', response.data)
                return response.data
            } catch (error) {
                console.error('Error fetching purchases:', error)
                commit('SET_ERROR', error.response?.data?.message || error.message || 'Error fetching purchases')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Create new purchase
        async CREATE_PURCHASE({ commit }, purchaseData) {
            try {
                commit('SET_LOADING', true);
                commit('SET_ERROR', null);

                const auth = JSON.parse(localStorage.getItem('user'));
                if (!auth || !auth.data || !auth.data.token) {
                    throw new Error('Authorization token not found');
                }

                // Validate required fields
                if (!purchaseData.date || !purchaseData.amount || !purchaseData.purchase_tax_amount || !purchaseData.vendorId) {
                    throw new Error('Date, amount, purchase tax amount, and vendor ID are required');
                }

                const response = await axios.post(`${baseURL}purchase/create`, {
                    name: purchaseData.name, // Keep name if your backend needs it, otherwise remove
                    date: purchaseData.date,
                    amount: purchaseData.amount,
                    purchase_tax_amount: purchaseData.purchase_tax_amount,
                    status: purchaseData.status !== undefined ? purchaseData.status : true,
                    companyId: purchaseData.companyId,
                    vendorId: purchaseData.vendorId, // Pass vendorId
                }, {
                    headers: {
                        Authorization: `Bearer ${auth.data.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                commit('ADD_PURCHASE', response.data.data || response.data);
                return response.data;
            } catch (error) {
                console.error('Error creating purchase:', error);
                commit('SET_ERROR', error.response?.data?.message || error.message || 'Error creating purchase');
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },

        // Update purchase
        async UPDATE_PURCHASE({ commit }, { id, purchaseData }) {
            try {
                commit('SET_LOADING', true);
                commit('SET_ERROR', null);

                const auth = JSON.parse(localStorage.getItem('user'));
                if (!auth || !auth.data || !auth.data.token) {
                    throw new Error('Authorization token not found');
                }

                if (!id) {
                    throw new Error('Purchase ID is required for update');
                }

                const response = await axios.put(`${baseURL}purchase/update/${id}`, {
                    name: purchaseData.name, // Keep name if your backend needs it, otherwise remove
                    date: purchaseData.date,
                    amount: purchaseData.amount,
                    purchase_tax_amount: purchaseData.purchase_tax_amount,
                    status: purchaseData.status,
                    companyId: purchaseData.companyId,
                    vendorId: purchaseData.vendorId, // Pass vendorId
                }, {
                    headers: {
                        Authorization: `Bearer ${auth.data.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                commit('UPDATE_PURCHASE', response.data.data || response.data);
                return response.data;
            } catch (error) {
                console.error('Error updating purchase:', error);
                commit('SET_ERROR', error.response?.data?.message || error.message || 'Error updating purchase');
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },

        // Delete purchase
        async DELETE_PURCHASE({ commit }, purchaseId) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                const auth = JSON.parse(localStorage.getItem('user'))
                if (!auth || !auth.data || !auth.data.token) {
                    throw new Error('Authorization token not found')
                }

                if (!purchaseId) {
                    throw new Error('Purchase ID is required for deletion')
                }

                const response = await axios.delete(`${baseURL}purchase/delete/${purchaseId}`, {
                    headers: {
                        Authorization: `Bearer ${auth.data.token}`,
                    },
                })

                if (response.status === 200 || response.status === 204) {
                    commit('REMOVE_PURCHASE', purchaseId)
                } else {
                    throw new Error('Failed to delete purchase')
                }

                return response.data
            } catch (error) {
                console.error('Error deleting purchase:', error)
                commit('SET_ERROR', error.response?.data?.message || error.message || 'Error deleting purchase')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Get purchase by ID
        async GET_PURCHASE_BY_ID({ commit }, purchaseId) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                const auth = JSON.parse(localStorage.getItem('user'))
                if (!auth || !auth.data || !auth.data.token) {
                    throw new Error('Authorization token not found')
                }

                const response = await axios.get(`${baseURL}purchase/${purchaseId}`, {
                    headers: {
                        Authorization: `Bearer ${auth.data.token}`,
                    },
                })

                commit('SET_CURRENT_PURCHASE', response.data.data || response.data)
                return response.data
            } catch (error) {
                console.error('Error fetching purchase:', error)
                commit('SET_ERROR', error.response?.data?.message || error.message || 'Error fetching purchase')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Get purchase total amount
        async GET_PURCHASE_AMOUNT({ commit }, params) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                const auth = JSON.parse(localStorage.getItem('user'))
                if (!auth || !auth.data || !auth.data.token) {
                    throw new Error('Authorization token not found')
                }

                const options = {
                    method: 'get',
                    url: `${baseURL}purchase/TotalAmount`,
                    params: params,
                    headers: {
                        Authorization: 'Bearer ' + auth.data.token
                    }
                }

                const response = await axios(options)
                commit('SET_PURCHASE_AMOUNT', response.data)
                return response.data
            } catch (error) {
                console.error('Error fetching purchase amount:', error)
                commit('SET_ERROR', error.response?.data?.message || error.message || 'Error fetching purchase amount')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Clear error
        CLEAR_ERROR({ commit }) {
            commit('CLEAR_ERROR')
        },

        // Clear current purchase
        CLEAR_CURRENT_PURCHASE({ commit }) {
            commit('SET_CURRENT_PURCHASE', null)
        }
    },
    getters: {
        // Get all purchases
        getAllPurchases: (state) => {
            return state.PurchaseData.data || []
        },

        // Get purchases by company ID
        getPurchasesByCompany: (state) => (companyId) => {
            const purchases = state.PurchaseData.data || []
            return purchases.filter(purchase => purchase.companyId === companyId)
        },

        // Get purchases by date range
        getPurchasesByDateRange: (state) => (startDate, endDate) => {
            const purchases = state.PurchaseData.data || []
            return purchases.filter(purchase => {
                const purchaseDate = new Date(purchase.date)
                return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate)
            })
        },

        // Get total purchase amount
        getTotalPurchaseAmount: (state) => {
            const purchases = state.PurchaseData.data || []
            return purchases.reduce((total, purchase) => total + (purchase.amount || 0), 0)
        },

        // Get total tax amount
        getTotalTaxAmount: (state) => {
            const purchases = state.PurchaseData.data || []
            return purchases.reduce((total, purchase) => total + (purchase.purchase_tax_amount || 0), 0)
        },

        // Get active purchases
        getActivePurchases: (state) => {
            const purchases = state.PurchaseData.data || []
            return purchases.filter(purchase => purchase.status === true)
        },

        // Check if loading
        isLoading: (state) => state.loading,

        // Get error
        getError: (state) => state.error,

        // Get current purchase
        getCurrentPurchase: (state) => state.currentPurchase
    }
}