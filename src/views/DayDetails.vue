<template>
  <ion-page>
    <Header />
    <ion-content class="ion-padding">
      <h2 class="selected-day">{{ formattedDate }}</h2>
      <ion-segment value="purchase-sales" class="segment-container">
        <ion-segment-button value="purchase" @click="navigateTo('purchase')">
          <ion-icon :icon="cartOutline"></ion-icon>
          <ion-label>Purchase</ion-label>
        </ion-segment-button>
        <ion-segment-button value="sales" @click="navigateTo('sales')">
          <ion-icon :icon="cashOutline"></ion-icon>
          <ion-label>Sales</ion-label>
        </ion-segment-button>
      </ion-segment>

      <ion-grid v-if="isDataLoaded">
        <ion-row>
          <ion-col size="4" v-for="image in filteredPurchases" :key="image.id">
            <ion-card class="image-card">
              <img :src="image.image" alt="Purchase Image" @click="showDetailedView(image)" />
              <ion-button fill="clear" class="dots-menu" @click="showOptions(image, $event)">
                <ion-icon :icon="ellipsisVertical"></ion-icon>
              </ion-button>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div v-if="isDataLoaded && filteredPurchases.length === 0" class="no-data-message">
        <p>No bill found for the selected company and date.</p>
      </div>

      <!-- Detailed View Modal -->
      <ion-modal :is-open="detailedViewImage !== null" @didDismiss="closeDetailedView" class="detailed-modal">
        <ion-content class="detailed-content">
          <div class="image-container">
            <img :src="detailedViewImage?.image" class="detailed-image" />
          </div>
          <ion-button fill="clear" class="close-button" @click="closeDetailedView">
            <ion-icon :icon="closeCircle" size="large"></ion-icon>
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-popover :is-open="showPopover" @didDismiss="closePopover" :event="popoverEvent">
        <ion-content>
          <ion-list>
            <ion-item button @click="updateImage">Update</ion-item>
            <ion-item button @click="deleteImage">Delete</ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>

      <!-- Update Modal -->
      <ion-modal :is-open="showUpdateModal" @didDismiss="closeUpdateModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Update Bill</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeUpdateModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Date</ion-label>
            <ion-input type="date" v-model="updateForm.date"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Company</ion-label>
            <ion-select v-model="updateForm.companyId">
              <ion-select-option v-for="company in CompanyList" :key="company.id" :value="company.id">
                {{ company.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Image</ion-label>
            <img v-if="updateForm.imageUrl" :src="updateForm.imageUrl" alt="Selected Image" class="selected-image" />
            <ion-input type="file" @change="onUpdateFileChange"></ion-input>
          </ion-item>
          <ion-button expand="block" @click="submitUpdateForm">Update</ion-button>
        </ion-content>
      </ion-modal>

      <!-- Delete Confirmation Alert -->
      <ion-alert :is-open="showDeleteAlert" header="Confirm Delete" message="Are you sure you want to delete this bill?"
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
            confirmDelete();
          },
        },
      ]"></ion-alert>

      <!-- Upload button and modal -->
      <div class="bottom-buttons">
        <ion-button class="upload-button" @click="openAddModal">
          <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
          Upload Bill
        </ion-button>
      </div>

      <!-- Modal for the form -->
      <ion-modal :is-open="showAddModal" @didDismiss="closeAddModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Add New Bill</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-content">
          <ion-list>
            <ion-item>
              <ion-input :value="selectedDate" readonly></ion-input>
            </ion-item>
            <ion-item>
              <ion-input :value="selectedCompany" readonly></ion-input>
            </ion-item>
            <ion-item>
              <ion-input type="file" @change="onFileChange"></ion-input>
            </ion-item>
            <ion-button expand="block" @click="submitForm">Submit</ion-button>
          </ion-list>
        </ion-content>
      </ion-modal>

      <div class="tax-info-container">
        <ion-row>
          <ion-col>
            <ion-card class="tax-card">
              <ion-card-title>Current Tax Period</ion-card-title>
              <ion-item>
                {{ formattedPeriod }}
              </ion-item>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card class="tax-card">
              <ion-card-title>Tax Payment Due Date</ion-card-title>
              <ion-item>
                {{ taxPaymentDate }}
              </ion-item>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-card class="tax-card">
              <ion-card-title>Purchase Tax</ion-card-title>
              <ion-item>
                {{ purchaseTax.toFixed(2) }}
              </ion-item>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card class="tax-card">
              <ion-card-title>Sales Tax</ion-card-title>
              <ion-item>
                {{ salesTax.toFixed(2) }}
              </ion-item>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-card class="tax-card">
              <ion-card-title>Total Tax</ion-card-title>
              <ion-item>
                {{ totalTax.toFixed(2) }}
              </ion-item>
            </ion-card>
          </ion-col>
        </ion-row>
      </div>

    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref, computed, } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonButton, IonCard, IonGrid, IonRow, IonCol, IonModal, IonSegment, IonSegmentButton, IonIcon, IonLabel, IonPopover, IonList, IonItem, IonAlert, IonDatetime, IonSelect, IonSelectOption, IonInput
} from '@ionic/vue';
import { cartOutline, cashOutline, cloudUploadOutline, closeCircle, ellipsisVertical, closeOutline } from 'ionicons/icons';
import Header from '@/components/Header.vue';
import { mapActions, mapState } from 'vuex';
// import { format, parseISO, isValid } from 'date-fns';

import { parseISO, addMonths, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';

export default defineComponent({
  name: 'DayDetails',
  components: {
    IonPage, IonContent, IonButton, IonCard, IonGrid, IonRow, IonCol, IonModal, IonSegment, IonSegmentButton, IonIcon, IonLabel, Header, IonPopover, IonList, IonItem, IonAlert, IonDatetime, IonSelect, IonSelectOption, IonInput
  },
  data() {
    return {
      updateForm: {
        id: null,
        date: '',
        companyId: '',
        image: null
      },
    };
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Get companyId and date from the URL params
    const companyId = computed(() => route.params.companyId);
    const date = computed(() => route.params.date);

    const formattedDate = computed(() => {
      return format(new Date(date.value), 'MMMM d, yyyy');
    });

    const companyName = ref('');
    const image = ref(null);
    const fullScreenImage = ref(null);

    const detailedViewImage = ref(null);
    const showPopover = ref(false);
    const popoverEvent = ref(null);
    const selectedImage = ref(null);
    const showDetailedView = (img) => {
      detailedViewImage.value = img;
    };

    const closeDetailedView = () => {
      detailedViewImage.value = null;
    };

    const showUpdateModal = ref(false);
    const showDeleteAlert = ref(false);

    const updateForm = ref({
      id: null,
      date: '',
      companyId: '',
      image: null,
      imageUrl: ''
    });

    const showOptions = (img, event) => {
      event.stopPropagation();
      selectedImage.value = img;
      showPopover.value = true;
      popoverEvent.value = event;
    };

    const closePopover = () => {
      showPopover.value = false;
      popoverEvent.value = null;
    };

    const updateImage = (img) => {
      let selectedImageDate = selectedImage.value.date;
      if (typeof selectedImageDate === 'string') {
        selectedImageDate = new Date(selectedImageDate);
      }
      const formattedDate = format(selectedImageDate, 'yyyy-MM-dd');

      showUpdateModal.value = true;
      updateForm.value = {
        id: selectedImage.value.id,
        date: formattedDate,
        companyId: selectedImage.value.companyId,
        image: null,
        imageUrl: selectedImage.value.image
      };
    };
    const onUpdateFileChange = (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        updateForm.value.image = files[0];
      }
    };

    const deleteImage = () => {
      console.log('Delete image:', selectedImage.value);
      showDeleteAlert.value = true;
      closePopover();
    };

    const closeUpdateModal = () => {
      showUpdateModal.value = false;
    };


    const showFullScreen = (img) => {
      fullScreenImage.value = img;
    };

    const closeFullScreen = () => {
      fullScreenImage.value = null;
    };

    const navigateTo = (page) => {
      if (page === 'purchase') {
        router.push({ name: 'Purchase', params: { date: date.value } });
      } else if (page === 'sales') {
        router.push({ name: 'Sales', params: { date: date.value } });
      }
    };

    const closeModal = () => {
      const modal = document.querySelector('ion-modal');
      if (modal) {
        modal.dismiss();
      }
    };
    const showAddModal = ref(false);

    const openAddModal = () => {
      showAddModal.value = true;
    };

    const closeAddModal = () => {
      showAddModal.value = false;
    };

    return {
      showAddModal,
      openAddModal,
      closeAddModal,
      companyId,
      date,
      formattedDate,
      companyName,
      image,
      fullScreenImage,
      showFullScreen,
      closeFullScreen,
      navigateTo,
      closeModal,
      cartOutline,
      cashOutline,
      cloudUploadOutline,
      closeCircle,
      detailedViewImage,
      showDetailedView,
      closeDetailedView,
      showPopover,
      popoverEvent,
      showOptions,
      closePopover,
      updateImage,
      deleteImage,
      ellipsisVertical,
      showUpdateModal,
      showDeleteAlert,
      updateForm,
      closeUpdateModal,
      closeOutline,
      showPopover,
      popoverEvent,
      showOptions,
      closePopover,
      updateImage,
      deleteImage,
      onUpdateFileChange,
      selectedImage,
    };
  },
  computed: {
    ...mapState('bill', ['PurchaseList']),
    ...mapState('company', ['CompanyList']),
    ...mapState('purchase', ['PurchaseData']),
    ...mapState('sales', ['SlaeList']),
    selectedDate() {
      return this.formattedDate;
    },
    selectedCompany() {
      return this.companyName;
    },
    filteredPurchases() {
      const urlDate = this.date;
      return this.PurchaseList.data.filter(purchase => {
        const purchaseDate = format(parseISO(purchase.date), 'yyyy-MM-dd');
        return purchase.companyId.toString() === this.companyId.toString() &&
          purchaseDate === urlDate;
      });
    },

    isDataLoaded() {
      return this.PurchaseList && this.PurchaseList.data;
    },
    // purchaseTax() {
    //   if (!this.PurchaseData || !this.PurchaseData.data) return 0;
    //   return this.PurchaseData.data
    //     .filter(purchase => purchase.companyId.toString() === this.companyId.toString())
    //     .reduce((total, purchase) => total + (purchase.purchase_tax_amount || 0), 0);
    // },

    // salesTax() {
    //   if (!this.SlaeList || !this.SlaeList.data) return 0;
    //   return this.SlaeList.data
    //     .filter(sale => sale.companyId.toString() === this.companyId.toString())
    //     .reduce((total, sale) => total + (sale.sale_tax_amount || 0), 0);
    // },

    // totalTax() {
    //   return this.purchaseTax + this.salesTax;
    // }
    // currentCompany() {
    //   return this.CompanyList.find(company => company.id.toString() === this.companyId.toString());
    // },

    // currentPeriod() {
    //   if (!this.currentCompany || !this.currentCompany.ved) return null;
      
    //   const vedDate = parseISO(this.currentCompany.ved);
    //   const now = new Date();
    //   const monthsSinceVed = differenceInMonths(now, vedDate);
    //   const periodNumber = Math.floor(monthsSinceVed / 3);
      
    //   const periodStart = addMonths(vedDate, periodNumber * 3);
    //   const periodEnd = addMonths(periodStart, 3);
      
    //   return { start: periodStart, end: periodEnd };
    // },

    // purchaseTax() {
    //   if (!this.PurchaseData || !this.PurchaseData.data || !this.currentPeriod) return 0;
      
    //   return this.PurchaseData.data
    //     .filter(purchase => {
    //       const purchaseDate = parseISO(purchase.date);
    //       return purchase.companyId.toString() === this.companyId.toString() &&
    //              isWithinInterval(purchaseDate, this.currentPeriod);
    //     })
    //     .reduce((total, purchase) => total + (purchase.purchase_tax_amount || 0), 0);
    // },

    // salesTax() {
    //   if (!this.SlaeList || !this.SlaeList.data || !this.currentPeriod) return 0;
      
    //   return this.SlaeList.data
    //     .filter(sale => {
    //       const saleDate = parseISO(sale.date);
    //       return sale.companyId.toString() === this.companyId.toString() &&
    //              isWithinInterval(saleDate, this.currentPeriod);
    //     })
    //     .reduce((total, sale) => total + (sale.sale_tax_amount || 0), 0);
    // },

    // totalTax() {
    //   return this.purchaseTax + this.salesTax;
    // },

    // formattedPeriod() {
    //   if (!this.currentPeriod) return 'N/A';
    //   return `${this.currentPeriod.start.toDateString()} - ${this.currentPeriod.end.toDateString()}`;
    // }
    currentCompany() {
      return this.CompanyList.find(company => company.id.toString() === this.companyId.toString());
    },

    currentPeriod() {
      if (!this.currentCompany || !this.currentCompany.ved) return null;
      
      const vedDate = startOfDay(parseISO(this.currentCompany.ved));
      const now = new Date();
      const monthsSinceVed = Math.floor((now - vedDate) / (1000 * 60 * 60 * 24 * 30.44)); // Approximate months
      const periodNumber = Math.floor(monthsSinceVed / 3);
      
      const periodStart = addMonths(vedDate, periodNumber * 3);
      const periodEnd = endOfDay(addMonths(periodStart, 3));
      
      return { start: periodStart, end: periodEnd };
    },

    purchaseTax() {
      if (!this.PurchaseData || !this.PurchaseData.data || !this.currentPeriod) return 0;
      
      return this.PurchaseData.data
        .filter(purchase => {
          const purchaseDate = parseISO(purchase.date);
          return purchase.companyId.toString() === this.companyId.toString() &&
                 isWithinInterval(purchaseDate, this.currentPeriod);
        })
        .reduce((total, purchase) => total + (purchase.purchase_tax_amount || 0), 0);
    },

    salesTax() {
      if (!this.SlaeList || !this.SlaeList.data || !this.currentPeriod) return 0;
      
      return this.SlaeList.data
        .filter(sale => {
          const saleDate = parseISO(sale.date);
          return sale.companyId.toString() === this.companyId.toString() &&
                 isWithinInterval(saleDate, this.currentPeriod);
        })
        .reduce((total, sale) => total + (sale.sale_tax_amount || 0), 0);
    },

    totalTax() {
      return this.purchaseTax + this.salesTax;
    },

    formattedPeriod() {
      if (!this.currentPeriod) return 'N/A';
      return `${format(this.currentPeriod.start, 'MMM d, yyyy')} - ${format(this.currentPeriod.end, 'MMM d, yyyy')}`;
    },

    taxPaymentDate() {
      if (!this.currentPeriod) return 'N/A';
      return format(this.currentPeriod.end, 'MMM d, yyyy');
    }

  },
  methods: {
    ...mapActions('bill', ['GET_PURCHASE_LIST', 'ADD_BILL', 'UPDATE_BILL', 'DELETE_BILL']),
    ...mapActions('company', ['GET_COMPANY_LIST']),
    ...mapActions('purchase', ['GET_PURCHASE_LISTS']),
    ...mapActions('sales', ['GET_SALE_LIST']),
    fetchCompanyName() {
      const company = this.CompanyList.find(c => c.id.toString() === this.companyId.toString());
      this.companyName = company ? company.name : `Company ${this.companyId}`;
      console.log('Fetched company name:', this.companyName);
    },
    async loadPurchaseData() {
      try {
        await this.GET_PURCHASE_LIST();
        this.isDataLoaded = true;
      } catch (error) {
        console.error('Failed to load purchase data:', error);
        // Handle error (e.g., show error message to user)
      }
    },
    async submitForm() {
      try {
        const payload = {
          date: this.date,
          companyId: this.companyId,
          image: this.image ? [this.image] : []
        };
        await this.ADD_BILL(payload);
        window.location.reload();
        this.handleReset();
      } catch (error) {
        console.error('Error adding bill:', error);
      }
    },

    updateImage(img) {
      let selectedImageDate = img.date;
      if (typeof selectedImageDate === 'string') {
        selectedImageDate = new Date(selectedImageDate);
      }
      const formattedDate = format(selectedImageDate, 'yyyy-MM-dd');
      this.showUpdateModal = true;
      this.updateForm = {
        id: img.id,
        date: formattedDate,
        companyId: img.companyId,
        image: null
      };
      // console.log('updateForm set:', this.updateForm);
    },

    onUpdateFileChange(event) {
      const files = event.target.files;
      if (files.length > 0) {
        this.updateForm.image = files[0];
      }
    },
    handleReset() {
      this.image = null;

    },
    onFileChange(event) {
      const files = event.target.files;
      if (files.length > 0) {
        this.image = files[0];
      }
    },

    async submitUpdateForm() {
      try {
        console.log('Submitting update form:', this.updateForm);
        if (!this.updateForm.id || !this.updateForm.date || !this.updateForm.companyId) {
          throw new Error('Missing required fields for update');
        }
        const payload = {
          id: this.updateForm.id,
          date: this.updateForm.date,
          companyId: this.updateForm.companyId,
          image: this.updateForm.image ? [this.updateForm.image] : []
        };
        await this.UPDATE_BILL(payload);
        this.closeUpdateModal();
        window.location.reload();
        await this.GET_PURCHASE_LIST();
      } catch (error) {
        console.error('Error in submitUpdateForm:', error);
      }
    },

    deleteImage() {
      this.showDeleteAlert = true;
      this.closePopover();
    },

    async confirmDelete() {
      try {
        await this.DELETE_BILL(this.selectedImage.id);
        this.showDeleteAlert = false;
        window.location.reload();
        this.GET_PURCHASE_LIST();
      } catch (error) {
        console.error('Error deleting bill:', error);
      }
    }
  },
  watch: {
    CompanyList: {
      immediate: true,
      handler() {
        this.fetchCompanyName();
      }
    }
  },
  mounted() {
    this.GET_PURCHASE_LIST();
    this.GET_COMPANY_LIST();
    this.GET_PURCHASE_LISTS();
    this.GET_SALE_LIST();
    this.handleReset();
  },
});
</script>

<style scoped>
.selected-day {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--ion-color-primary);
}

.segment-container {
  margin-bottom: 1rem;
}

.image-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-card:hover {
  transform: translateY(-5px);
}

.image-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.dots-menu {
  position: absolute;
  top: 5px;
  right: 5px;
  --background: rgba(255, 255, 255, 0.7);
  --color: var(--ion-color-dark);
}

.no-data-message {
  text-align: center;
  color: var(--ion-color-medium);
  margin-top: 2rem;
}

.detailed-modal {
  --height: 90%;
  --width: 90%;
  --border-radius: 10px;
}

.detailed-content {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
}

.image-container {
  max-width: 90%;
  max-height: 90%;
}

.detailed-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  --color: white;
}

.selected-image {
  width: 100%;
  height: auto;
  margin-top: 10px;
  border-radius: 8px;
}

.bottom-buttons {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000;
}

.upload-button {
  --background: var(--ion-color-primary);
  --color: white;
  --border-radius: 20px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tax-info-container {
  margin-top: 2rem;
}

.tax-card {
  background-color: var(--ion-color-light);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tax-card ion-card-title {
  font-size: 1rem;
  font-weight: bold;
  color: var(--ion-color-primary);
  padding: 1rem 1rem 0.5rem;
}

.tax-card ion-item {
  --background: transparent;
  --padding-start: 1rem;
  --padding-end: 1rem;
  --min-height: 40px;
}
</style>