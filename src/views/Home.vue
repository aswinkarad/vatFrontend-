<template>
  <ion-page>
    <Header />
    <ion-content>
      <div class="content-wrapper">
        <h1 class="welcome-text">Welcome, {{ userName }}!</h1>

        <div v-if="defaultCompany && !showCompanySelector" class="default-company-info clickable" @click="toggleCompanySelector">
          <div class="company-info-left">
            <span class="material-icons">business</span>
            <span><strong>{{ defaultCompany.name }}</strong></span>
          </div>
          <span class="edit-icon"></span>
        </div>
        <div v-else-if="!defaultCompany && CompanyList.length > 0 && !isCompanyModalOpen" class="no-company-selected-prompt">
          <p>Please select a company to get started.</p>
          <ion-button @click="openCompanyModal" expand="block" class="select-company-button">
            Select Company
            <span class="material-icons ion-padding-start">arrow_forward</span>
          </ion-button>
        </div>


        <div class="card-container">
          <div
            class="card purchases-card clickable-card"
            @click="handlePurchaseCardClick"
            :class="{ 'disabled-card': !defaultCompany }"
          >
            <div class="card-icon-wrapper">
              <span class="material-icons primary-icon">shopping_bag</span>
              <div class="icon-bg-circle"></div>
            </div>
            <div class="card-content">
              <h3>Purchases</h3>
              <p class="amount-text">{{ formatAmount(PurchaseAmount) }}</p>
            </div>
          </div>

          <div
            class="card sales-card clickable-card"
            @click="handleSalesCardClick"
            :class="{ 'disabled-card': !defaultCompany }"
          >
            <div class="card-icon-wrapper">
              <span class="material-icons primary-icon">trending_up</span>
              <div class="icon-bg-circle"></div>
            </div>
            <div class="card-content">
              <h3>Sales</h3>
              <p class="amount-text">{{ formatAmount(SaleTotalAmount) }}</p>
            </div>
          </div>

          <div class="card total-vat-card">
            <div class="card-icon-wrapper">
              <span class="material-icons primary-icon">calculate</span>
              <div class="icon-bg-circle"></div>
            </div>
            <div class="card-content">
              <h3>Total VAT</h3>
              <p class="amount-text">{{ formatAmount(totalVAT) }}</p>
              <p class="vat-calculation">(Sales - Purchase)</p>
            </div>
          </div>
        </div>

        <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="showFabButtons">
          <ion-fab-button @click="goToMonthsPage" class="fab-shop">
            <span class="material-icons">store</span>
          </ion-fab-button>
        </ion-fab>

      </div>

      <ion-modal :is-open="isCompanyModalOpen" @didDismiss="closeCompanyModal" class="company-modal">
        <HeaderM @close-modal="closeCompanyModal" />
        <ion-content class="ion-padding">
          <ion-list>
            <ion-item v-for="company in CompanyList" :key="company.id" class="company-item" @click="selectAndSetDefault(company)">
              <ion-label>{{ company.name }}</ion-label>
              <div class="company-actions-modal">
                <span v-if="defaultCompany && defaultCompany.id === company.id" class="material-icons check-icon">check_circle</span>
              </div>
            </ion-item>
          </ion-list>
          <div class="modal-footer" v-if="defaultCompany">
            <ion-button @click="clearDefaultCompany" fill="clear" class="clear-default-btn">
              <span class="material-icons">clear</span> Clear Default Company
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonButton, IonModal, IonList, IonItem, IonLabel, IonFab, IonFabButton } from '@ionic/vue';
import Header from '../components/Header.vue';
import HeaderM from '../components/HeaderM.vue';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
  name: 'Home',
  components: {
    IonPage, IonContent, IonButton, IonModal, IonList, IonItem, IonLabel, IonFab, IonFabButton, Header, HeaderM,
  },
  data() {
    return {
      userName: '',
      defaultCompany: null,
      showCompanySelector: false,
    };
  },
  setup() {
    const router = useRouter();
    const isCompanyModalOpen = ref(false);

    const openCompanyModal = () => {
      isCompanyModalOpen.value = true;
    };

    const closeCompanyModal = () => {
      isCompanyModalOpen.value = false;
    };

    const selectCompany = (company) => {
      router.push({ name: 'Months', params: { companyId: company.id } });
    };

    return {
      isCompanyModalOpen,
      openCompanyModal,
      closeCompanyModal,
      selectCompany,
    };
  },
  // Add a navigation guard to check authentication before entering the route
  beforeRouteEnter(to, from, next) {
    const auth = localStorage.getItem('user'); // Check if user data exists in localStorage
    if (auth) {
      next(); // Proceed to the route if authenticated
    } else {
      console.log('User not authenticated, redirecting to login page.');
      next({ name: 'Login' }); // Redirect to your login route
    }
  },
  computed: {
    ...mapState('client', ['clientList']),
    ...mapState('company', ['CompanyList']),
    ...mapState('purchase', ['PurchaseAmount', 'PurchaseData']),
    ...mapState('sales', ['SaleTotalAmount', 'SlaeList']),

    showFabButtons() {
      // FAB buttons should only show if a default company is selected and the modal isn't open
      return this.defaultCompany && !this.isCompanyModalOpen;
    },

    currentDate() {
      return new Date();
    },

    currentMonth() {
      return this.currentDate.getMonth();
    },

    currentYear() {
      return this.currentDate.getFullYear();
    },

    currentDateString() {
      const year = this.currentYear;
      const month = String(this.currentMonth + 1).padStart(2, '0');
      const day = String(this.currentDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // Purchase VAT calculation
    purchaseVAT() {
      let purchaseVAT = 0;

      try {
        const purchaseArray = Array.isArray(this.PurchaseData) ? this.PurchaseData : (this.PurchaseData?.data || []);

        if (purchaseArray.length > 0) {
          purchaseVAT = purchaseArray.reduce((acc, item) => {
            const vatAmount = parseFloat(item.purchase_tax_amount) || 0;
            return acc + vatAmount;
          }, 0);
        } else {
        }
      } catch (error) {
        console.error('Error calculating Purchase VAT:', error);
        purchaseVAT = 0;
      }

      return purchaseVAT;
    },

    // Sales VAT calculation
    salesVAT() {
      let salesVAT = 0;

      try {
        const salesArray = Array.isArray(this.SlaeList) ? this.SlaeList : (this.SlaeList?.data || []);

        if (salesArray.length > 0) {
          salesVAT = salesArray
            .filter(item => {
              const saleDate = new Date(item.date);
              return (
                saleDate.getMonth() === this.currentMonth &&
                saleDate.getFullYear() === this.currentYear
              );
            })
            .reduce((acc, item) => {
              const vatAmount = parseFloat(item.sale_tax_amount) || 0;
              return acc + vatAmount;
            }, 0);
        } else {
        }
      } catch (error) {
        console.error('Error calculating Sales VAT:', error);
        salesVAT = 0;
      }

      return salesVAT;
    },

    // Total VAT = Sales VAT - Purchase VAT
    totalVAT() {
      const total = this.salesVAT - this.purchaseVAT;
      return total;
    },
  },
  methods: {
    ...mapActions('client', ['GET_CLIENT_LIST']),
    ...mapActions('company', ['GET_COMPANY_LIST']),
    ...mapActions('purchase', ['GET_PURCHASE_AMOUNT', 'GET_PURCHASE_LISTS']),
    ...mapActions('sales', ['GET_SALES_AMOUNT', 'GET_SALE_LIST']),

    formatAmount(amount) {
      if (amount === null || amount === undefined || isNaN(parseFloat(amount))) return '0.00';
      return parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    // --- Card Click Handlers ---
    handlePurchaseCardClick() {
      if (!this.defaultCompany) {
        this.showCompanyNotSelectedAlert();
        return;
      }

      console.log('Purchase card clicked - navigating to today\'s details page');
      this.$router.push({
        name: 'DayDetails',
        params: {
          companyId: this.defaultCompany.id,
          date: this.currentDateString,
        },
      });
    },

    handleSalesCardClick() {
      if (!this.defaultCompany) {
        this.showCompanyNotSelectedAlert();
        return;
      }

      console.log('Sales card clicked - navigating to today\'s sales page');
      this.$router.push({
        name: 'Sales',
        params: {
          companyId: this.defaultCompany.id,
          date: this.currentDateString,
        },
      });
    },
    // --- End Card Click Handlers ---

    showCompanyNotSelectedAlert() {
      alert('Please select a company first to view details');
      this.openCompanyModal();
      this.showCompanySelector = true; // Ensure selector is shown
    },

    goToMonthsPage() {
      if (this.defaultCompany) {
        console.log('Navigating to months page with company:', this.defaultCompany.name);
        this.selectCompany(this.defaultCompany);
      } else {
        console.log('No default company selected for months page navigation');
        this.showCompanyNotSelectedAlert();
      }
    },

    selectAndSetDefault(company) {
      this.defaultCompany = company;
      localStorage.setItem('defaultCompany', JSON.stringify(company));
      console.log(`Selected and set ${company.name} as default company`);
      this.closeCompanyModal();
      // showCompanySelector state will be synced via watch in isCompanyModalOpen
      this.loadCompanyData();
      console.log('Default company set. Click cards to navigate to today\'s details.');
    },

    clearDefaultCompany() {
      this.defaultCompany = null;
      localStorage.removeItem('defaultCompany');
      console.log('Default company cleared');
      // No need to set showCompanySelector=true here, closeCompanyModal will handle it
      this.closeCompanyModal();
      // Optionally reload data or reset state for cards if needed
    },

    toggleCompanySelector() {
      console.log('Toggling company selector (via company info click). Current modal state:', this.isCompanyModalOpen);
      if (this.isCompanyModalOpen) {
        this.closeCompanyModal();
      } else {
        this.openCompanyModal();
      }
    },

    closeCompanyModal() {
      console.log('Closing company modal');
      this.isCompanyModalOpen = false;
      this.showCompanySelector = false; // Ensure showCompanySelector is also false when modal closes
    },

    loadDefaultCompany() {
      const saved = localStorage.getItem('defaultCompany');
      if (saved) {
        try {
          this.defaultCompany = JSON.parse(saved);
          console.log('Loaded default company:', this.defaultCompany.name);
          this.showCompanySelector = false; // Keep selector hidden if default company is loaded
          return true;
        } catch (error) {
          console.error('Error loading default company from localStorage:', error);
          localStorage.removeItem('defaultCompany'); // Clear invalid data
        }
      }
      this.showCompanySelector = true; // Show selector if no default company found or invalid
      return false;
    },

    async loadCompanyData() {
      if (!this.defaultCompany) {
        console.log('No default company selected, skipping data load.');
        return;
      }

      try {
        const params = {
          companyId: this.defaultCompany.id,
        };

        console.log('Loading data for company:', this.defaultCompany.name, 'with params:', params);

        await Promise.all([
          this.GET_PURCHASE_AMOUNT(params),
          this.GET_PURCHASE_LISTS(params),
          this.GET_SALES_AMOUNT(params),
          this.GET_SALE_LIST(params),
        ]);

        console.log('Data loaded successfully.');

        setTimeout(() => {
          this.debugVATData();
        }, 100); // Small delay to ensure computed properties update
      } catch (error) {
        console.error('Error loading company data:', error);
        alert('Failed to load company data. Please try again.');
      }
    },

    debugVATData() {
      console.log('=== VAT DATA DEBUG ===');
      console.log('Purchase Data:', JSON.stringify(this.PurchaseData, null, 2));
      console.log('Sales Data (SaleList):', JSON.stringify(this.SlaeList, null, 2));
      console.log('Calculated Purchase VAT:', this.purchaseVAT);
      console.log('Calculated Sales VAT:', this.salesVAT);
      console.log('Calculated Total VAT:', this.totalVAT);
      console.log('=== END VAT DATA DEBUG ===');
    },

    async initializeApp() {
      // Check for user authentication at the start of app initialization
      const auth = JSON.parse(localStorage.getItem('user'));
      if (!auth || !auth.data || !auth.data.name) {
        console.log('User not authenticated during initializeApp, redirecting to login page.');
        this.$router.replace({ name: 'Login' }); // Use replace to prevent back button to this page
        return; // Stop further initialization
      }

      this.userName = auth.data.name;

      await this.GET_COMPANY_LIST();

      // If no default company is loaded, or if the loaded company isn't in the list
      if (!this.loadDefaultCompany() || (this.defaultCompany && !this.CompanyList.some(c => c.id === this.defaultCompany.id))) {
        if (this.CompanyList?.length > 0) {
          // If there are companies, set the first one as default
          this.defaultCompany = this.CompanyList[0];
          localStorage.setItem('defaultCompany', JSON.stringify(this.defaultCompany));
          console.log('Set first available company as default:', this.defaultCompany.name);
          this.showCompanySelector = false; // Hide selector
        } else {
          // No companies available at all
          console.log('No companies found. User needs to add one.');
          this.showCompanySelector = true; // Ensure modal opens if no companies
        }
      }

      if (this.defaultCompany) {
        await this.loadCompanyData();
      } else {
        this.openCompanyModal(); // Automatically open modal if no default company after initial load attempt
      }

      console.log('Current Date Info:', {
        date: this.currentDate,
        month: this.currentMonth,
        year: this.currentYear,
        dateString: this.currentDateString,
      });
      console.log('FAB visibility (showFabButtons):', this.showFabButtons);
    },
  },

  async mounted() {
    await this.initializeApp();
  },

  watch: {
    defaultCompany(newVal) {
      console.log('defaultCompany changed:', newVal ? newVal.name : 'None');
      // If default company changes, reload its data
      if (newVal) {
        this.loadCompanyData();
      } else {
        // If default company is cleared, reset card amounts
        this.GET_PURCHASE_AMOUNT({ companyId: null }); // Pass null or 0 to reset store state
        this.GET_SALES_AMOUNT({ companyId: null });
        this.GET_PURCHASE_LISTS({ companyId: null });
        this.GET_SALE_LIST({ companyId: null });
      }
      console.log('FAB visibility (showFabButtons):', this.showFabButtons);
    },
    isCompanyModalOpen(newVal) {
      console.log('isCompanyModalOpen changed:', newVal);
      // Keep showCompanySelector in sync with modal state
      this.showCompanySelector = newVal;
      console.log('FAB visibility (showFabButtons):', this.showFabButtons);
    },
    showCompanySelector(newVal) {
      console.log('showCompanySelector changed (watched):', newVal);
      console.log('FAB visibility (showFabButtons):', this.showFabButtons);
    },
  },
});
</script>


<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Poppins', sans-serif;
}

ion-content::part(scroll) {
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f2f9 100%);
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  margin: 1rem;
}

.welcome-text {
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
  background: linear-gradient(45deg, #3498DB, #8E44AD, #2C3E50);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientText 8s ease infinite;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes gradientText {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

ion-fab {
  margin-bottom: 1rem;
  margin-right: 1rem;
  z-index: 1000;
}

/* Ensure FAB buttons are perfectly round and styled */
ion-fab-button {
  --border-radius: 50%; /* Makes the button perfectly round */
  width: 56px; /* Standard FAB size */
  height: 56px; /* Standard FAB size */
  display: flex;
  align-items: center;
  justify-content: center;

  --background: #FFFFFF; /* Set default background to white */
  --background-activated: #F0F0F0; /* Lighter white on activate */
  --background-hover: #F8F8F8; /* Even lighter white on hover */
  --color: #333; /* Darker icon color for contrast */
}

.fab-shop {
  margin-bottom: 0.5rem;
}

.fab-shop .material-icons {
  font-size: 1.8rem;
  color: #3498DB; /* Example: Blue for shop icon */
}

@keyframes pulseFab {
  0% { transform: scale(1); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
  50% { transform: scale(1.05); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3); }
  100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
}

.default-company-info {
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid rgba(52, 152, 219, 0.2);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #2C3E50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer; /* Makes it clickable */
}

.default-company-info:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: rgba(52, 152, 219, 0.4); /* Subtle border change on hover */
}

.company-info-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.company-info-left .material-icons {
  font-size: 1.1rem;
  color: #3498DB;
}

.edit-icon {
  font-size: 1.2rem;
  color: #E67E22; /* Accent color for the edit icon */
  transition: transform 0.2s ease-in-out;
}

.default-company-info:hover .edit-icon {
  transform: scale(1.1); /* Slightly enlarge the icon on hover */
}

.no-company-selected-prompt {
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  text-align: center;
  color: #d35400; /* Darker orange text */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-company-selected-prompt p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.select-company-button {
  --background: #3498DB;
  --background-activated: #2980B9;
  --color: #FFFFFF;
  --border-radius: 8px;
  font-weight: 600;
  padding: 0.8rem 1.5rem;
  margin-top: 0.5rem;
  max-width: 250px; /* Limit width */
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items: center;
}

.select-company-button .material-icons {
  font-size: 1.2rem;
  margin-left: 0.5rem;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.card {
  background: white;
  border-radius: 16px;
  height: 160px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06), 0 3px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  /* Glassmorphism effect */
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, 0.15); /* Slightly transparent white */
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(10px); /* Blur the background of the card */
  z-index: 0;
  opacity: 0.8;
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12), 0 8px 20px rgba(0, 0, 0, 0.08);
}

.clickable-card {
  cursor: pointer;
}

.disabled-card {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  filter: grayscale(1); /* Visually indicate it's disabled */
}

/* Card specific background gradients - slightly adjusted for better blend with glassmorphism */
.purchases-card {
  background: linear-gradient(135deg, rgba(116, 185, 255, 0.8), rgba(9, 132, 227, 0.8));
}

.sales-card {
  background: linear-gradient(135deg, rgba(85, 239, 196, 0.8), rgba(0, 184, 148, 0.8));
}

.total-vat-card {
  background: linear-gradient(135deg, rgba(162, 155, 254, 0.8), rgba(108, 92, 231, 0.8));
}

.card-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-bottom: 0.8rem;
}

.primary-icon {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.95);
  z-index: 3;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.card:hover .primary-icon {
  transform: scale(1.1);
  color: rgba(255, 255, 255, 1);
}

.icon-bg-circle {
  position: absolute;
  width: 55px;
  height: 55px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  z-index: 1;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.card:hover .icon-bg-circle {
  transform: scale(1.15);
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
}

.card-content {
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
}

.card-content h3 {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0.95;
  transition: all 0.3s ease;
}

.card:hover .card-content h3 {
  opacity: 1;
  transform: translateY(-1px);
}

.amount-text {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.card:hover .amount-text {
  transform: scale(1.03);
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.click-hint, .vat-calculation {
  font-size: 0.75rem;
  opacity: 0.9;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.company-modal {
  /* Original properties */
  --border-radius: 20px;
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalEnter 0.3s ease-out forwards;

  /* MODIFIED PROPERTIES for smaller, dropdown-like modal */
  --width: 350px; /* Adjust this value to your desired width */
  --max-width: 90%; /* Ensures it doesn't exceed 90% on smaller screens */
  --height: auto; /* Allows height to adjust based on content */
  --max-height: 500px; /* Optional: Sets a max-height with scroll if many items */

  /* Positioning to mimic a dropdown (e.g., center or near the trigger) */
  --presenting-top: auto;
  --presenting-bottom: auto;
  --presenting-left: auto;
  --presenting-right: auto;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
}


@keyframes modalEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.company-item {
  --background: var(--ion-color-light);
  --background-hover: rgba(52, 152, 219, 0.1);
  --background-activated: rgba(52, 152, 219, 0.2);
  --border-color: rgba(0, 0, 0, 0.08);
  --border-style: solid;
  --border-width: 0 0 1px 0;
  --padding-start: 1rem;
  --padding-end: 1rem;
  --inner-padding-end: 0;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer; /* Make the entire item clickable */
}

.company-item:last-child {
  --border-width: 0;
  margin-bottom: 0;
}

.company-item:hover {
  --background: rgba(52, 152, 219, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.company-item ion-label {
  font-weight: 500;
  font-size: 1.1rem;
  color: #2C3E50;
  flex-grow: 1;
  padding-top: 12px;
  padding-bottom: 12px;
}

.company-actions-modal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.check-icon {
  font-size: 1.5rem;
  color: #28a745; /* Green color for the tick */
  margin-left: 10px; /* Space from the company name */
  animation: scaleIn 0.3s ease-out forwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #eee;
  margin-top: 1rem;
}

.clear-default-btn {
  --color: #dc3545;
  --color-hover: #c82333;
  font-size: 0.9rem;
  text-transform: capitalize;
  font-weight: 500;
  display: flex; /* To align icon and text */
  align-items: center;
  justify-content: center;
}

.clear-default-btn .material-icons {
  font-size: 1rem;
  margin-right: 5px;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
    margin: 0.5rem;
  }

  .welcome-text {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  .default-company-info {
    flex-direction: row; /* Keep it in a row for better alignment of text and icon */
    justify-content: center; /* Center content horizontally */
    align-items: center;
    padding: 0.6rem 0.8rem;
  }
  .edit-icon {
    margin-left: 0.8rem; /* Adjust margin for mobile */
  }

  .no-company-selected-prompt {
    padding: 1rem;
  }

  .card-container {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }

  .card {
    height: 166px;
    padding: 2rem;
  }

  .card h3 {
    font-size: 1rem;
  }

  .amount-text {
    font-size: 1.4rem;
  }

  .primary-icon {
    font-size: 2rem;
  }

  .icon-bg-circle {
    width: 50px;
    height: 50px;
  }

  .company-modal {
    --width: 90%; /* On small screens, let it take more width */
    --height: 70%; /* Or keep it at auto if content is short */
    /* Reset positioning if you want it centered on mobile */
    justify-content: center;
    align-items: center;
  }
}

.purchases-card {
  animation-delay: 0.1s;
}

.sales-card {
  animation-delay: 0.2s;
}

.total-vat-card {
  animation-delay: 0.3s;
}
</style>