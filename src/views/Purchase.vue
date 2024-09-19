<template>
  <ion-page>
    <Header />
    <ion-content class="ion-padding">
      <!-- Search Bar -->
      <ion-searchbar v-model="searchQuery" placeholder="Search purchases..." debounce="500"
        class="custom-searchbar"></ion-searchbar>
      <ion-grid v-if="isDataLoaded">
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="4" v-for="(item, index) in filteredPurchases" :key="index">
            <ion-card class="sales-card animate-bg">
              <ion-card-content>
                <div class="card-header">
                  <ion-icon :icon="bagOutline" class="info-icon"></ion-icon>
                  <div class="product-name">{{ getCompanyName(item) }}</div>
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
                    <span>{{ item.purchase_tax_amount }}</span>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <!-- <div v-else class="loading-message">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading purchase data...</p>
      </div> -->
      <div v-if="isDataLoaded && filteredPurchases.length === 0" class="no-data-message">
        <p>No purchases found for the selected company and date.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { IonPage, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol, IonSpinner, IonSearchbar } from '@ionic/vue';
import { bagOutline, calendarOutline, cashOutline } from 'ionicons/icons';
import Header from '@/components/Header.vue';
import { mapActions, mapState } from 'vuex';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'PurchasePage',
  components: {
    IonPage,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    Header,
    IonSpinner,
    IonSearchbar,
  },
  setup() {
    const route = useRoute();
    const isDataLoaded = ref(false);
    const searchQuery = ref('');

    return {
      bagOutline,
      calendarOutline,
      cashOutline,
      route,
      isDataLoaded,
      searchQuery,
    };
  },
  computed: {
    ...mapState('purchase', ['PurchaseData']),
    filteredPurchases() {
      if (!this.PurchaseData || !this.PurchaseData.data) {
        return [];
      }

      const companyId = this.route.params.companyId;
      const routeDate = this.route.params.date;

      return this.PurchaseData.data.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        const itemCompanyId = item.company_id || (item.company && item.company.id);

        const matchesRoute = (!companyId || itemCompanyId.toString() === companyId) &&
          (!routeDate || itemDate === routeDate);

        const matchesSearch = this.searchQuery.toLowerCase().trim() === '' ||
          (item.company && item.company.name && item.company.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          item.amount.toString().includes(this.searchQuery) ||
          itemDate.includes(this.searchQuery);

        return matchesRoute && matchesSearch;
      });
    }
  },
  methods: {
    ...mapActions('purchase', ['GET_PURCHASE_LISTS']),
    async loadPurchaseData() {
      try {
        await this.GET_PURCHASE_LISTS();
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
    getCompanyName(item) {
      if (item.company && item.company.name) {
        return item.company.name;
      }
      return 'N/A';
    }
  },
  mounted() {
    this.loadPurchaseData();
  },
});
</script>

<style scoped>
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