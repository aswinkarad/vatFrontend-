<template>
  <ion-page>
    <ion-header>
      <Header />
    </ion-header>
    <ion-content class="ion-padding">
      <ion-searchbar v-model="searchQuery" placeholder="Search sales..." animated debounce="500"
        class="custom-searchbar"></ion-searchbar>

      <ion-grid v-if="isDataLoaded">
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="3" v-for="(item, index) in filteredSales" :key="index">
            <ion-card class="sales-card">
              <ion-card-content>
                <div class="card-header">
                  <ion-icon :icon="storefrontOutline" class="info-icon"></ion-icon>
                  <div class="product-name">{{ item.company.name }}</div>
                  <ion-button fill="clear" class="options-button" @click="openPopover($event, item)">
                    <ion-icon :icon="ellipsisVertical"></ion-icon>
                  </ion-button>
                </div>
                <div class="card-details">
                  <div class="info-item">
                    <ion-icon :icon="calendarNumberOutline" class="detail-icon"></ion-icon>
                    <span>Date: {{ formatDate(item.date) }}</span>
                  </div>
                  <div class="info-item amount">
                    <ion-icon :icon="walletOutline" class="detail-icon"></ion-icon>
                    <span>Amount: {{ item.amount }}</span>
                  </div>
                  <div class="info-item tax-amount">
                    <ion-icon :icon="receiptOutline" class="detail-icon"></ion-icon>
                    <span>Sale Tax: {{ item.sale_tax_amount }}</span>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <div v-if="isDataLoaded && filteredSales.length === 0" class="no-data-message">
        <p>No Sales found for the selected company and date.</p>
      </div>

      <ion-popover :is-open="showPopover" @didDismiss="closePopover" :event="popoverEvent">
        <ion-content>
          <ion-list>
            <ion-item button @click="openUpdateModal">Update</ion-item>
            <ion-item button @click="confirmDelete">Delete</ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openAddModal" class="action-fab-button">
          &nbsp; <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="showUpdateModal" @didDismiss="showUpdateModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Update Sale</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showUpdateModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Date</ion-label>
            <ion-input v-model="selectedItem.date" type="date"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Amount</ion-label>
            <ion-input v-model="selectedItem.amount" type="number" @ionChange="updateSaleTaxAmount"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Company</ion-label>
            <ion-select v-model="selectedItem.companyId">
              <ion-select-option v-for="company in CompanyList" :key="company.id" :value="company.id">
                {{ company.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Sale Tax Amount</ion-label>
            <ion-input v-model="selectedItem.sale_tax_amount" type="number" readonly></ion-input>
          </ion-item>
          <ion-button expand="block" @click="updateSale" class="upload-button">Update</ion-button>
        </ion-content>
      </ion-modal>

      <ion-alert :is-open="showDeleteAlert" header="Confirm Delete" message="Are you sure you want to delete this sale?"
        :buttons="[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              showDeleteAlert = false;
            },
          },
          {
            text: 'Yes',
            handler: () => {
              deleteSale();
            },
          },
        ]"></ion-alert>

      <ion-modal :is-open="showAddModal" @didDismiss="showAddModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Add New Sale</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showAddModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Date</ion-label>
            <ion-input v-model="newSale.date" readonly></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Amount</ion-label>
            <ion-input v-model="newSale.amount" type="number" @ionChange="updateNewSaleTaxAmount"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Sale Tax Amount</ion-label>
            <ion-input v-model="newSale.sale_tax_amount" readonly></ion-input>
          </ion-item>
          <ion-button expand="block" @click="submitForm" class="upload-button">Add Sale</ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script>
import Header from '@/components/Header.vue';
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
  IonPage, IonHeader, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol,
  IonSearchbar, IonFab, IonFabButton, IonPopover, IonModal, IonToolbar,
  IonTitle, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonAlert, IonList,
  IonSelect, IonSelectOption,
} from '@ionic/vue';
import {
  storefrontOutline, calendarNumberOutline, walletOutline, receiptOutline,
  add, ellipsisVertical, // Ensure 'add' is imported from ionicons/icons
} from 'ionicons/icons';
import { mapActions, mapState } from 'vuex';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'SalesPage',
  components: {
    Header,
    IonPage, IonHeader, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol,
    IonSearchbar, IonFab, IonFabButton, IonPopover, IonModal, IonToolbar,
    IonTitle, IonButtons, IonButton, IonItem, IonLabel, IonInput,
    IonAlert, IonList, IonSelect, IonSelectOption,
  },
  setup() {
    const route = useRoute();
    const searchQuery = ref('');
    const showPopover = ref(false);
    const popoverEvent = ref(null);
    const showUpdateModal = ref(false);
    const showDeleteAlert = ref(false);
    const showAddModal = ref(false);
    const selectedItem = ref({});
    const isDataLoaded = ref(false);
    const newSale = ref({
      date: '',
      companyId: '',
      amount: null,
      sale_tax_amount: null
    });
    const urlCompanyId = route.params.companyId;
    const urlDate = route.params.date;

    const vatRate = 5;

    const openPopover = (e, item) => {
      popoverEvent.value = e;
      selectedItem.value = { ...item, companyId: item.company.id };
      showPopover.value = true;
    };

    const closePopover = () => {
      showPopover.value = false;
    };

    const openUpdateModal = () => {
      showPopover.value = false;
      selectedItem.value.date = formatDateForInput(selectedItem.value.date);
      showUpdateModal.value = true;
    };

    const updateSaleTaxAmount = () => {
      if (selectedItem.value.amount) {
        selectedItem.value.sale_tax_amount = Number((selectedItem.value.amount * (vatRate / 100)).toFixed(2));
      }
    };

    const openAddModal = () => {
      const companyId = route.params.companyId;
      const date = route.params.date;
      newSale.value = {
        date: date || '',
        companyId: companyId || '',
        amount: null,
        sale_tax_amount: null
      };
      showAddModal.value = true;
    };

    const updateNewSaleTaxAmount = () => {
      if (newSale.value.amount) {
        newSale.value.sale_tax_amount = Number((newSale.value.amount * (vatRate / 100)).toFixed(2));
      }
    };

    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    };

    const confirmDelete = () => {
      showPopover.value = false;
      showDeleteAlert.value = true;
    };

    return {
      isDataLoaded,
      searchQuery,
      showPopover,
      popoverEvent,
      showUpdateModal,
      showDeleteAlert,
      showAddModal,
      selectedItem,
      newSale,
      openPopover,
      closePopover,
      openUpdateModal,
      openAddModal,
      updateSaleTaxAmount,
      updateNewSaleTaxAmount,
      storefrontOutline,
      calendarNumberOutline,
      walletOutline,
      receiptOutline,
      add, // THIS IS THE KEY FIX: Expose 'add' icon to the template
      ellipsisVertical,
      urlCompanyId,
      urlDate,
      formatDateForInput,
      confirmDelete
    };
  },
  watch: {
    CompanyList: {
      immediate: true,
      handler() {
        this.fetchCompanyName();
      }
    }
  },
  computed: {
    ...mapState('sales', ['SlaeList']),
    ...mapState('company', ['CompanyList']),
    selectedDate() {
      return this.urlDate || 'N/A';
    },
    selectedCompany() {
      return this.companyName || 'N/A';
    },
    selectedCompanyName() {
      const company = this.CompanyList.find(
        (c) => c.id === this.newSale.companyId
      );
      return company ? company.name : 'Unknown Company';
    },
    filteredSales() {
      if (!this.SlaeList || !this.SlaeList.data) {
        return [];
      }
      return this.SlaeList.data.filter(item => {
        const matchesCompany = !this.urlCompanyId || item.companyId.toString() === this.urlCompanyId;
        const matchesDate = !this.urlDate || this.formatDate(item.date) === this.urlDate;
        const matchesSearch = this.searchQuery
          ? item.company.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.amount.toString().includes(this.searchQuery) ||
          this.formatDate(item.date).includes(this.searchQuery)
          : true;
        return matchesCompany && matchesDate && matchesSearch;
      });
    }
  },
  methods: {
    ...mapActions('sales', ['GET_SALE_LIST', 'CREATE_SALES', 'UPDATE_SALES', 'DELETE_SALES']),
    ...mapActions('company', ['GET_COMPANY_LIST']),
    async loadPurchaseData() {
      try {
        await this.GET_SALE_LIST();
        this.isDataLoaded = true;
      } catch (error) {
        console.error('Failed to load purchase data:', error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toISOString().split('T')[0];
    },
    fetchCompanyName() {
      if (!this.CompanyList || !this.urlCompanyId) {
        console.warn('CompanyList or companyId is undefined');
        this.companyName = 'N/A';
        return;
      }
      const company = this.CompanyList.find(c => c.id.toString() === this.urlCompanyId.toString());
      this.companyName = company ? company.name : `Company ${this.urlCompanyId}`;
      console.log('Fetched company name:', this.companyName);
    },
    async submitForm() {
      const vatRate = 5;
      try {
        const payload = {
          date: this.newSale.date,
          companyId: this.newSale.companyId,
          amount: Number(this.newSale.amount),
          sale_tax_amount: Number((this.newSale.amount * (vatRate / 100)).toFixed(2))
        };
        await this.CREATE_SALES(payload);
        this.showAddModal = false;
        window.location.reload();
      } catch (error) {
        console.error('Error adding sale:', error);
      }
    },
    async updateSale() {
      try {
        await this.UPDATE_SALES(this.selectedItem);
        console.log('Sale updated successfully');
        this.showUpdateModal = false;
        window.location.reload();
      } catch (error) {
        console.error('Error updating sale:', error);
      }
    },
    async deleteSale() {
      try {
        await this.DELETE_SALES(this.selectedItem.id);
        this.showDeleteAlert = false;
        window.location.reload();
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  },
  mounted() {
    this.GET_SALE_LIST();
    this.GET_COMPANY_LIST();
    this.loadPurchaseData();
  }
});
</script>

<style scoped>
.upload-button {
  --background: var(--ion-color-primary);
  --color: #ffffff;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

}

.update-button,
.submit-button {
  --background: var(--ion-color-primary);
  --color: #fff;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 10px 20px;
}

/* No Data Message */
.no-data-message {
  text-align: center;
  color: var(--ion-color-medium, #787878);
  margin: 1rem 0;
  font-size: 0.9rem;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Options Button */
.options-button {
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  --background: transparent;
  --color: #666;
  font-size: 0.9rem;
}

/* Search Bar */
.custom-searchbar {
  --background: linear-gradient(135deg, #ffffff, #f0f4ff);
  --color: #333;
  --placeholder-color: #888;
  --icon-color: #4a6dff;
  --border-radius: 15px;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 0.3rem;
}

/* Sales Card */
.sales-card {
  border-radius: 10px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  margin: 0.3rem;
}

.sales-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

ion-card-content {
  padding: 0.8rem;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.6rem;
  position: relative;
  padding-bottom: 0.4rem;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, #4a6dff, #00ddeb);
  border-radius: 2px;
}

.info-icon {
  font-size: 1.5rem;
  color: #4a6dff;
  margin-right: 0.6rem;
  background: linear-gradient(45deg, #4a6dff, #00ddeb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.product-name {
  font-size: 0.95rem;
  color: #222;
  font-weight: 600;
  letter-spacing: 0.2px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.info-item {
  display: flex;
  align-items: center;
  background: rgba(245, 247, 255, 0.85);
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(230, 235, 255, 0.95);
  transform: translateY(-1px);
}

.detail-icon {
  font-size: 1rem;
  color: #4a6dff;
  margin-right: 0.4rem;
  transition: all 0.3s ease;
}

.info-item:hover .detail-icon {
  color: #00ddeb;
}

.info-item span {
  font-size: 0.85rem;
  color: #444;
  font-weight: 500;
}

.amount {
  font-weight: 600;
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.15);
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
}

.tax-amount {
  font-weight: 600;
  color: #e67e22;
  background: rgba(230, 126, 34, 0.15);
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
}

/* FAB Button */
ion-fab-button {
  --background-activated: linear-gradient(135deg, #3a5dcc, #00b8c4);
  --box-shadow: 0 3px 12px rgba(74, 109, 255, 0.35);
  --border-radius: 50%;
  width: 45px;
  height: 45px;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sales-card {
  animation: fadeInUp 0.5s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-icon {
    margin-bottom: 0.4rem;
  }

  .card-details {
    flex-direction: column;
  }

  .info-item {
    margin-bottom: 0.4rem;
    width: 100%;
  }

  .amount,
  .tax-amount {
    align-self: flex-start;
  }

  .custom-searchbar {
    padding: 0.2rem;
  }

  .sales-card {
    margin: 0.2rem;
  }
}

@media (max-width: 480px) {
  .product-name {
    font-size: 0.85rem;
  }

  .info-item span {
    font-size: 0.8rem;
  }

  .detail-icon {
    font-size: 0.9rem;
  }


}

ion-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}
</style>