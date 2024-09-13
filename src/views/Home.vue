<template>
  <ion-page>
    <Header />
    <ion-content>
      <div class="content-wrapper">
        <h1 class="welcome-text">Welcome, {{ userName }}!</h1>
        <ion-button expand="block" @click="openCompanyModal" class="company-select-btn">
          <span class="material-icons">business</span><span class="dg">Select Company</span>
        </ion-button>

        <div class="card-container">
          <div class="card">
            <ion-icon name="shopping_cart" style="color: #E74C3C;"></ion-icon>
            <div class="card-content">
              <h3>Purchases</h3>
              <p>{{ PurchaseAmount }}</p>
            </div>
          </div>
          <div class="card">
            <ion-icon name="trending_up" style="color: #E74C3C;"></ion-icon>
            <div class="card-content">
              <h3>Sales</h3>
              <p>{{ SaleTotalAmount }}</p>
            </div>
          </div>
        </div>

        <div class="card-container">
          <div class="card">
            <ion-icon name="calculate" style="color: #E74C3C;"></ion-icon>
            <div class="card-content">
              <h3>VAT</h3>
              <p>{{ totalVAT }}</p> <!-- Bind the computed VAT total here -->
            </div>
          </div>
        </div>

        <!--<ion-button expand="block" @click="addTransaction" class="add-transaction-btn">
          <span class="material-icons">add_circle</span>
          Add New Bill
        </ion-button> -->
        
      </div>
    </ion-content>

    <ion-modal :is-open="isCompanyModalOpen" @didDismiss="closeCompanyModal">
      <HeaderM @close-modal="closeCompanyModal" />
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item v-for="company in CompanyList" :key="company.id" @click="selectCompany(company)"
            class="company-item">
            <ion-label>{{ company.name }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>
    
  </ion-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { IonPage, IonContent, IonButton, IonModal, IonList, IonItem, IonLabel } from '@ionic/vue';
import Header from '../components/Header.vue';
import HeaderM from '../components/HeaderM.vue';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
  name: 'Home',
  components: {
    IonPage, IonContent, IonButton, IonModal, IonList, IonItem, IonLabel, Header, HeaderM,
  },
  data() {
    return {
      userName: '',
    }
  },
  setup() {
    const router = useRouter();
    const isCompanyModalOpen = ref(false);

    const addTransaction = () => {
      router.push('months');
    };

    const openCompanyModal = () => {
      isCompanyModalOpen.value = true;
    };

    const closeCompanyModal = () => {
      isCompanyModalOpen.value = false;
    };
    // const selectCompany = (company) => {
    //   router.push({ name: 'Months', params: { companyId: company.id } });
    // };
//     const selectCompany = (company) => {
//   router.push({ name: 'Months', params: { companyId: `companyId:${company.id}` } });
// };
const selectCompany = (company) => {
  router.push({ name: 'Months', params: { companyId: company.id } }).then(() => {
    location.reload();
  });
};

    return {
      addTransaction,
      isCompanyModalOpen,
      openCompanyModal,
      closeCompanyModal,
      selectCompany
    };
  },
  computed: {
    ...mapState('client', ['clientList']),
    ...mapState('company', ['CompanyList']),
    ...mapState('purchase', ['PurchaseAmount', 'PurchaseData']),
    ...mapState('sales', ['SaleTotalAmount', 'SlaeList']),


    totalVAT() {
      // Calculate purchase VAT
      const purchaseVAT = Array.isArray(this.PurchaseData?.data)
        ? this.PurchaseData.data.reduce((acc, item) => {
          console.log('Item:', item); // Log each item to check field
          return acc + (item.purchase_tax_amount || 0);
        }, 0)
        : 0;

      // Calculate sale VAT
      const saleVAT = Array.isArray(this.SlaeList?.data)
        ? this.SlaeList.data.reduce((acc, item) => {
          console.log('Item:', item); // Log each item to check field
          return acc + (item.sale_tax_amount || 0);
        }, 0)
        : 0;
      const VAT = purchaseVAT + saleVAT;
      return VAT;
    },
  },
  methods: {
    ...mapActions('client', ['GET_CLIENT_LIST']),
    ...mapActions('company', ['GET_COMPANY_LIST']),
    ...mapActions('purchase', ['GET_PURCHASE_AMOUNT', 'GET_PURCHASE_LIST']),
    ...mapActions('sales', ['GET_SALES_AMOUNT', 'GET_SALE_LIST']),
  },
  mounted() {
    this.GET_COMPANY_LIST();
    this.GET_PURCHASE_AMOUNT();
    this.GET_SALES_AMOUNT();
    this.GET_PURCHASE_LIST();
    this.GET_SALE_LIST();

    const auth = JSON.parse(localStorage.getItem('user'));
    if (auth && auth.data.name) {
      this.userName = auth.data.name;
    }
  },
});
</script>



<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

ion-content::part(scroll) {
  display: flex;
  flex-direction: column;
}

.dg {
  color: white;
}

.content-wrapper {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #F5F7FA 0%, #E4E7EB 100%);
}

.welcome-text {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: bold;
  background: linear-gradient(45deg, #2C3E50, #3498DB, #8E44AD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientText 6s ease infinite;
}

@keyframes gradientText {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.card-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* Two columns */
  gap: 1rem;
  margin-bottom: 2rem;
}

.card-container:nth-child(3) {
  grid-column: span 2;
  /* Make the third card span across both columns */
}

.card {
  background: white;
  border-radius: 15px;
  height: 155px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card .material-icons {
  font-size: 8rem;
  margin-bottom: 1rem;
}

.card-content {
  text-align: center;
}

.card h3 {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #2C3E50;
}

.card p {
  font-size: 1.1rem;
  font-weight: bold;
  color: #34495E;
  margin: 0;
}

.add-transaction-btn,
.company-select-btn {
  --background: #3498DB;
  --background-hover: #2980B9;
  --background-activated: #2980B9;
  --color: #FFFFFF;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.add-transaction-btn {
  animation: pulse 2s infinite;
}

.company-select-btn {
  --background: #5CB180;
  --background-hover: #27AE60;
  --background-activated: #27AE60;
}

.add-transaction-btn::before,
.company-select-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.4));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.add-transaction-btn:hover::before,
.company-select-btn:hover::before {
  transform: scaleX(1);
}

.add-transaction-btn:active,
.company-select-btn:active {
  transform: scale(0.98);
}

.add-transaction-btn .material-icons,
.company-select-btn .material-icons {
  margin-right: 8px;
  font-size: 1.2rem;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4);
  }

  70% {
    box-shadow: 0 0 0 15px rgba(52, 152, 219, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0);
  }
}

.company-item {
  --background: transparent;
  --background-hover: rgba(52, 152, 219, 0.1);
  --background-activated: rgba(52, 152, 219, 0.2);
  --border-color: rgba(0, 0, 0, 0.1);
  --border-style: solid;
  --border-width: 0 0 1px 0;
  --padding-start: 1rem;
  --padding-end: 1rem;
  --padding-top: 1rem;
  --padding-bottom: 1rem;
  transition: all 0.3s ease;
}

.company-item:last-child {
  --border-width: 0;
}

.company-item:hover {
  --background: rgba(52, 152, 219, 0.1);
}

.company-item ion-label {
  font-weight: 500;
  font-size: 1.1rem;
  color: #2C3E50;
}

@media (max-width: 768px) {
  .welcome-text {
    font-size: 1.6rem;
  }

  .card .material-icons {
    font-size: 1.8rem;
  }

  .card h3 {
    font-size: 0.85rem;
  }

  .card p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 1rem;
  }

  .welcome-text {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .card-container {
    gap: 0.8rem;
  }

  .card {
    padding: 0.8rem;
  }

  .card .material-icons {
    font-size: 2.5rem;
  }

  .card h3 {
    font-size: 0.8rem;
  }

  .card p {
    font-size: 0.9rem;
  }

  .add-transaction-btn,
  .company-select-btn {
    font-size: 0.8rem;
    --padding-top: 0.8rem;
    --padding-bottom: 0.8rem;
  }
}
</style>