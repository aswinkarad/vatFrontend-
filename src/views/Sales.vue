<template>
  <ion-page>
    <Header />
    <ion-content class="ion-padding">
      <!-- Search Bar -->
      <ion-searchbar v-model="searchQuery" placeholder="Search sales..." animated debounce="500"
      class="custom-searchbar"></ion-searchbar>

      <ion-grid v-if="isDataLoaded">
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="4" v-for="(item, index) in filteredSales" :key="index">
            <ion-card class="sales-card animate-bg">
              <ion-card-content>
                <div class="card-header">
                  <ion-icon :icon="bagOutline" class="info-icon"></ion-icon>
                  <div class="product-name">{{ item.company.name }}</div>
                  <ion-button fill="clear" class="options-button" @click="openPopover($event, item)">
                    <ion-icon :icon="ellipsisVertical"></ion-icon>
                  </ion-button>
                </div>
                <div class="card-details">
                  <div class="info-item">
                    <ion-icon :icon="calendarOutline" class="detail-icon"></ion-icon>
                    <span>{{ formatDate(item.date) }}</span>
                  </div>
                  <div class="info-item amount">
                    <ion-icon :icon="cashOutline" class="detail-icon"></ion-icon>
                    <span>{{ item.amount }}</span>
                  </div>
                  <div class="info-item amount">
                    <ion-icon :icon="cashOutline" class="detail-icon"></ion-icon>
                    <span>{{ item.sale_tax_amount }}</span>
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
        <ion-fab-button @click="openAddModal">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Update Modal -->
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
        <ion-button expand="block" @click="updateSale">Update</ion-button>
      </ion-content>
    </ion-modal>

    <!-- Delete Confirmation Alert -->

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

    <!-- Add Sale Modal -->
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
          <ion-input v-model="newSale.date" readonly></ion-input> <!-- Display the date from URL -->
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Company</ion-label>
          <ion-input v-model="newSale.companyId" readonly>
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Amount</ion-label>
          <ion-input v-model="newSale.amount" type="number" @ionChange="updateNewSaleTaxAmount"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Sale Tax Amount</ion-label>
          <ion-input v-model="newSale.sale_tax_amount" readonly></ion-input>
        </ion-item>
        <ion-button expand="block" @click="submitForm">Add Sale</ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue';
import { IonPage, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol, IonSearchbar, IonFab, IonFabButton, IonPopover, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonAlert, IonList, IonSelect, IonSelectOption } from '@ionic/vue';
import { bagOutline, calendarOutline, cashOutline, add, ellipsisVertical } from 'ionicons/icons';
import Header from '@/components/Header.vue';
import { mapActions, mapState } from 'vuex';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'SalesPage',
  components: {
    IonPage, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol, IonSearchbar,
    Header, IonFab, IonFabButton, IonPopover, IonModal, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonItem, IonLabel, IonInput, IonAlert, IonList, IonSelect, IonSelectOption
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
    const addSale = () => {

      this.CREATE_SALES(newSale.value).then(() => {
        console.log('New sale added successfully');
        showAddModal.value = false;
      }).catch(error => {
        console.error('Error adding new sale:', error);
      });
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
      // deleteAlertButtons,
      openPopover,
      closePopover,
      openUpdateModal,
      openAddModal,
      addSale,
      updateSaleTaxAmount,
      updateNewSaleTaxAmount,
      bagOutline,
      calendarOutline,
      cashOutline,
      add,
      ellipsisVertical,
      urlCompanyId,
      urlDate,
      formatDateForInput, confirmDelete
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
      return this.formattedDate;
    },
    selectedCompany() {
      return this.companyName;
    },
    selectedCompanyName() {
      const company = this.CompanyList.find(
        (c) => c.id === this.newSale.companyId
      );
      return company ? company.name : 'Unknown Company';
    },
    // filteredSales() {

    //   if (!this.SlaeList || !this.SlaeList.data) {
    //     return [];
    //   }

    //   return this.SlaeList.data.filter(item => {
    //     const matchesCompany = !this.urlCompanyId || item.companyId.toString() === this.urlCompanyId;
    //     const matchesDate = !this.urlDate || this.formatDate(item.date) === this.urlDate;
    //     const matchesSearch = item.company.name.toLowerCase().includes(this.searchQuery.toLowerCase());
    //     return matchesCompany && matchesDate && matchesSearch;
    //   });
    // }
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
        // Handle error (e.g., show error message to user)
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toISOString().split('T')[0];
    },

    fetchCompanyName() {
      if (!this.CompanyList || !this.companyId) {
        console.warn('CompanyList or companyId is undefined');
        return;
      }

      const company = this.CompanyList.find(c => c.id.toString() === this.companyId.toString());
      this.companyName = company ? company.name : `Company ${this.companyId}`;
      console.log('Fetched company name:', this.companyName);
    },
    async submitForm() {
      const vatRate = 5;
      try {
        const payload = {
          date: this.newSale.date,
          companyId: this.newSale.companyId,
          amount: this.newSale.amount,
          sale_tax_amount: this.newSale.amount * (vatRate / 100)
        };
        // console.log('Submitting form with:', payload);
        await this.CREATE_SALES(payload);
        window.location.reload();
        this.handleReset();
      } catch (error) {
        console.error('Error adding bill:', error);
      }
    },
    updateSale() {
      this.UPDATE_SALES(this.selectedItem).then(() => {
        console.log('Sale updated successfully');
        this.showUpdateModal = false;
        window.location.reload();
      }).catch(error => {
        console.error('Error updating sale:', error);
      });
    },

    async deleteSale() {
      try {
        await this.DELETE_SALES(this.selectedItem.id);
        this.showDeleteAlert = false;
        window.location.reload();
        this.GET_SALE_LIST();
      } catch (error) {
        console.error('Error deleting bill:', error);
      }
    }
  },
  mounted() {
    this.GET_SALE_LIST();
    this.GET_COMPANY_LIST();
    this.loadPurchaseData();
  },
});
</script>

<style scoped>
.no-data-message {
  text-align: center;
  color: var(--ion-color-medium);
  margin-top: 2rem;
}

.options-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.bottom-buttons {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}

.custom-searchbar {
  --background: #f3f7fa;
  --color: #333;
  --placeholder-color: #888;
  --icon-color: #3880ff;
  --border-radius: 20px;
  margin-bottom: 1rem;

}

.sales-card {
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.sales-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

ion-card-content {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.info-icon {
  font-size: 2.2rem;
  color: #3880ff;
  margin-right: 0.8rem;
}

.product-name {
  font-size: 1.3rem;
  color: #333;
  font-weight: 600;
}

.card-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
}

.detail-icon {
  font-size: 1.2rem;
  color: #666;
  margin-right: 0.5rem;
}

.info-item span {
  font-size: 1rem;
  color: #666;
}

.amount {
  font-weight: 600;
  color: #2dd36f;
}

@keyframes gradientBG {
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

.animate-bg {
  background: linear-gradient(-45deg, #f3f7fa, #e6f0f8, #d9e9f7, #cce2f6);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sales-card {
  animation: fadeInUp 0.5s ease-out;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-icon {
    margin-bottom: 0.5rem;
  }

  .card-details {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-item {
    margin-bottom: 0.5rem;
  }

  .amount {
    align-self: flex-end;
  }
}
</style>