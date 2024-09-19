<template>
  <ion-page>
    <Header />
    <ion-content>
      <div class="content-wrapper">
        <h1 class="welcome-text">Welcome, {{ userName }}!</h1>
        <ion-button expand="block" @click="openCompanyModal" class="company-select-btn">
          <span class="material-icons">business</span><span class="btn-text">Select Company</span>
        </ion-button>

        <div class="card-container">
          <div class="card purchases-card">
            <ion-icon name="cart-outline"></ion-icon>
            <div class="card-content">
              <h3>Purchases</h3>
              <p>{{ PurchaseAmount }}</p>
            </div>
          </div>
          <div class="card sales-card">
            <ion-icon name="trending-up-outline"></ion-icon>
            <div class="card-content">
              <h3>Sales</h3>
              <p>{{ SaleTotalAmount }}</p>
            </div>
          </div>
          <div class="card vat-card">
            <ion-icon name="calculator-outline"></ion-icon>
            <div class="card-content">
              <h3>VAT</h3>
              <p>{{ totalVAT }}</p>
            </div>
          </div>
        </div>
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
    ...mapActions('purchase', ['GET_PURCHASE_AMOUNT',]),
    ...mapActions('sales', ['GET_SALES_AMOUNT', 'GET_SALE_LIST']),
  },
  mounted() {
    this.GET_COMPANY_LIST();
    this.GET_PURCHASE_AMOUNT();
    this.GET_SALES_AMOUNT();
    // this.GET_PURCHASE_LIST();
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Poppins', sans-serif;
}

ion-content::part(scroll) {
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f2f9 100%);
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin: 1.5rem;
}

.welcome-text {
  font-size: 2.8rem;
  margin-bottom: 2rem;
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

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.card {
  background: white;
  border-radius: 20px;
  height: 200px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: fadeInUp 0.8s ease forwards;
  opacity: 0;
  transform: translateY(30px);
  overflow: hidden;
  position: relative;
}

.card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  transform: rotate(45deg);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0;
}

.card:hover::before {
  opacity: 1;
  transform: rotate(45deg) translate(50%, 50%);
}

.card:hover {
  transform: translateY(-15px) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.purchases-card { background: linear-gradient(135deg, #74b9ff, #0984e3); }
.sales-card { background: linear-gradient(135deg, #55efc4, #00b894); }
.vat-card { background: linear-gradient(135deg, #fab1a0, #e17055); }

.card ion-icon {
  font-size: 3.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.card:hover ion-icon {
  transform: scale(1.2);
}

.card-content {
  text-align: center;
  color: white;
}

.card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.card p {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.company-select-btn {
  --background: #5CB180;
  --background-hover: #27AE60;
  --background-activated: #27AE60;
  --color: #FFFFFF;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  padding: 1.2rem 2rem;
  font-size: 1.1rem;
}

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

.company-select-btn:hover::before {
  transform: scaleX(1);
}

.company-select-btn:active {
  transform: scale(0.98);
}

.company-select-btn .material-icons {
  margin-right: 10px;
  font-size: 1.5rem;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.company-item {
  --background: transparent;
  --background-hover: rgba(52, 152, 219, 0.1);
  --background-activated: rgba(52, 152, 219, 0.2);
  --border-color: rgba(0, 0, 0, 0.1);
  --border-style: solid;
  --border-width: 0 0 1px 0;
  --padding: 1rem;
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
    font-size: 2.2rem;
  }

  .card {
    height: 180px;
  }

  .card h3 {
    font-size: 1.1rem;
  }

  .card p {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 1.5rem;
  }

  .welcome-text {
    font-size: 1.8rem;
  }

  .card-container {
    gap: 1.5rem;
  }

  .card {
    height: 160px;
  }

  .card h3 {
    font-size: 1rem;
  }

  .card p {
    font-size: 1.4rem;
  }

  .company-select-btn {
    font-size: 1rem;
    padding: 1rem 1.5rem;
  }
}
</style>