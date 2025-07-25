<template>
  <ion-page>
    <Header />
    <ion-content class="ion-padding">
      <h2 class="selected-day">{{ formattedDate }}</h2>
      <ion-segment :value="selectedSegment" class="segment-container">
        <ion-segment-button value="purchase" @click="selectedSegment = 'purchase'">
          <ion-icon :icon="cart"></ion-icon>
          <ion-label>Purchase</ion-label>
        </ion-segment-button>
        <ion-segment-button value="sales" @click="navigateTo('sales')">
          <ion-icon :icon="cash"></ion-icon>
          <ion-label>Sales</ion-label>
        </ion-segment-button>
        <ion-segment-button value="overview" @click="selectedSegment = 'overview'">
          <ion-icon :icon="eyeOutline"></ion-icon>
          <ion-label>Overview</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Tax Filter Segment - Only show when NOT on purchase tab -->
      <ion-segment v-show="selectedSegment !== 'purchase'" v-model="taxFilterType" class="tax-filter-segment">
        <ion-segment-button value="day">
          <ion-label>Day Tax</ion-label>
        </ion-segment-button>
        <ion-segment-button value="month">
          <ion-label>Month Tax</ion-label>
        </ion-segment-button>
        <ion-segment-button value="period">
          <ion-label>Period Tax</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Tax Information Card - Only show when NOT on purchase tab -->
      <div v-show="selectedSegment !== 'purchase'" class="tax-info-container">
        <ion-row>
          <ion-col size="12">
            <ion-card class="tax-card">
              <ion-card-header>
                <ion-card-title>
                  {{ taxFilterType === 'day' ? 'Daily Tax Information' :
                  taxFilterType === 'month' ? 'Monthly Tax Information' :
                  'Tax Period Information' }}
                </ion-card-title>
                <ion-card-subtitle v-if="taxFilterType === 'day'">
                  {{ formattedDate }}
                </ion-card-subtitle>
                <ion-card-subtitle v-else-if="taxFilterType === 'month'">
                  {{ currentMonthFormatted }}
                </ion-card-subtitle>
                <ion-card-subtitle v-else>
                  {{ formattedPeriod }}
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isDataLoaded" class="tax-details">
                  <div class="tax-item">
                    <span class="tax-label">Purchase Tax:</span>
                    <span class="tax-value">₹{{ displayPurchaseTax.toFixed(2) }}</span>
                  </div>
                  <div class="tax-item">
                    <span class="tax-label">Sales Tax:</span>
                    <span class="tax-value">₹{{ displaySalesTax.toFixed(2) }}</span>
                  </div>
                  <div class="tax-item total">
                    <span class="tax-label">Total Tax:</span>
                    <span class="tax-value">₹{{ displayTotalTax.toFixed(2) }}</span>
                  </div>
                  <div v-if="taxFilterType === 'period'" class="tax-item">
                    <span class="tax-label">Tax Payment Due Date:</span>
                    <span class="tax-value">{{ taxPaymentDate }}</span>
                  </div>
                </div>
                <div v-else class="no-data-message">
                  <p>Loading tax information...</p>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </div>

      <ion-card class="purchase-data-card ion-margin-top" v-show="selectedSegment === 'overview'">
        <ion-card-header>
          <ion-card-title>Overview for {{ overviewPeriodLabel }}</ion-card-title>
          <ion-card-subtitle>{{ overviewPeriodDate }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div v-if="isDataLoaded" class="tax-details">
            <div class="tax-item">
              <span class="tax-label">Total Purchase Amount:</span>
              <span class="tax-value">₹{{ displayTotalPurchaseAmount.toFixed(2) }}</span>
            </div>
            <div class="tax-item">
              <span class="tax-label">Total Sales Amount:</span>
              <span class="tax-value">₹{{ displayTotalSalesAmount.toFixed(2) }}</span>
            </div>
            <div class="tax-item">
              <span class="tax-label">Total Purchase Tax:</span>
              <span class="tax-value">₹{{ displayPurchaseTax.toFixed(2) }}</span>
            </div>
            <div class="tax-item">
              <span class="tax-label">Total Sales Tax:</span>
              <span class="tax-value">₹{{ displaySalesTax.toFixed(2) }}</span>
            </div>
            <div class="tax-item total">
              <span class="tax-label">Net Tax Impact:</span>
              <span class="tax-value">{{ (displaySalesTax - displayPurchaseTax).toFixed(2) }}</span>
            </div>
          </div>
          <div v-else class="no-data-message">
            <p>Loading overview information...</p>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card class="purchase-data-card ion-margin-top" v-show="selectedSegment === 'purchase'">
        <ion-card-header>
          <ion-card-title>Purchase Data</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div v-if="filteredPurchaseData.length > 0">
            <ion-list>
              <ion-item
                v-for="purchase in filteredPurchaseData"
                :key="purchase.id"
                @click="togglePurchaseDetails(purchase.id)"
              >
                <ion-label>
                  <h2>Amount: ₹{{ purchase.amount.toFixed(2) }}</h2>
                  <div v-if="expandedPurchaseId === purchase.id">
                    <p>Tax: ₹{{ purchase.purchase_tax_amount.toFixed(2) }}</p>
                    <p>Vendor: {{ getVendorName(purchase.vendorId) || 'N/A' }}</p>
                    <p>Date: {{ format(parseISO(purchase.date), 'MMM d, yyyy') }}</p>
                    <p>Created At: {{ format(parseISO(purchase.createdAt), 'MMM d, yyyy HH:mm:ss') }}</p>
                  </div>
                </ion-label>
                <ion-buttons slot="end">
                  <ion-button @click.stop="editPurchaseData(purchase)">
                    <ion-icon :icon="create"></ion-icon>
                  </ion-button>
                  <ion-button color="danger" @click.stop="deletePurchaseData(purchase.id)">
                    <ion-icon :icon="trash"></ion-icon>
                  </ion-button>
                  <ion-button @click.stop="openDetailedPurchaseView(purchase)">
                    <ion-icon :icon="eyeOutline"></ion-icon>
                  </ion-button>
                </ion-buttons>
              </ion-item>
            </ion-list>
          </div>
          <div v-else class="no-data-message">
            <p>No purchase data records found for the selected day.</p>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- All your existing modals remain the same -->
      <ion-modal :is-open="showDetailedPurchaseModal" @didDismiss="closeDetailedPurchaseView" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Purchase Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeDetailedPurchaseView">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list v-if="selectedPurchaseForDetail">
            <ion-item>
              <ion-label>Date:</ion-label>
              <ion-text>{{ format(parseISO(selectedPurchaseForDetail.date), 'MMM d, yyyy') }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Created At:</ion-label>
              <ion-text>{{ format(parseISO(selectedPurchaseForDetail.createdAt), 'MMM d, yyyy HH:mm:ss') }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Company:</ion-label>
              <ion-text>{{ getCompanyName(selectedPurchaseForDetail.companyId) }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Vendor:</ion-label>
              <ion-text>{{ getVendorName(selectedPurchaseForDetail.vendorId) || 'N/A' }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Amount:</ion-label>
              <ion-text>₹{{ selectedPurchaseForDetail.amount.toFixed(2) }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Purchase Tax:</ion-label>
              <ion-text>₹{{ selectedPurchaseForDetail.purchase_tax_amount.toFixed(2) }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Status:</ion-label>
              <ion-text>{{ selectedPurchaseForDetail.status === 1 ? 'Active' : 'Inactive' }}</ion-text>
            </ion-item>

            <ion-item-divider v-if="imagesForDetailedPurchase.length > 0">
              <ion-label>Associated Bills</ion-label>
            </ion-item-divider>
            <ion-grid v-if="imagesForDetailedPurchase.length > 0" class="image-grid">
              <ion-row>
                <ion-col size="6" v-for="image in imagesForDetailedPurchase" :key="image.id">
                  <ion-card class="image-card" @click="openImageFullScreen(image)">
                    <div class="image-container">
                      <img
                        :src="image.image"
                        alt="Purchase Image"
                        class="thumbnail-image"
                        loading="lazy"
                      />
                    </div>
                    <ion-button
                      fill="clear"
                      class="dots-menu"
                      @click.stop="showOptions(image, $event)"
                    >
                      <ion-icon :icon="ellipsisVertical" style="color: black;"></ion-icon>
                    </ion-button>
                  </ion-card>
                </ion-col>
              </ion-row>
            </ion-grid>
            <div v-else class="no-data-message">
              <p>No bills found for this purchase record.</p>
            </div>

            <ion-button expand="block"
              @click="editPurchaseData(selectedPurchaseForDetail)"
              class="ion-margin-top custom-edit-btn"
              color="primary">
              <ion-icon :icon="create" slot="start"></ion-icon>
              Edit Purchase
            </ion-button>

          </ion-list>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showImageModal" @didDismiss="closeImageModal" class="fullscreen-image-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title></ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeImageModal">
                <ion-icon :icon="closeCircle" size="large"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content v-if="detailedViewImage" class="ion-padding ion-text-center">
          <img :src="detailedViewImage.image" class="fullscreen-image" />
        </ion-content>
      </ion-modal>

      <ion-popover :is-open="showPopover" @didDismiss="closePopover" :event="popoverEvent">
        <ion-content>
          <ion-list>
            <ion-item button @click="updateImage">
              <ion-icon :icon="create" slot="start"></ion-icon>
              Update Bill
            </ion-item>
            <ion-item button @click="deleteImage" color="danger">
              <ion-icon :icon="trash" slot="start"></ion-icon>
              Delete Bill
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>

      <ion-modal :is-open="showUpdateModal" @didDismiss="closeUpdateModal" ion-color-scheme="light">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Update Bill</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeUpdateModal">
                <ion-icon :icon="close"></ion-icon>
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
              <ion-select-option
                v-for="company in CompanyList"
                :key="company.id"
                :value="company.id"
              >
                {{ company.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Image</ion-label>
            <div class="image-upload-container">
              <div v-if="updateForm.imageUrl || previewImage" class="preview-container">
                <img
                  :src="previewImage || updateForm.imageUrl"
                  alt="Selected Image"
                  class="preview-image"
                />
              </div>
              <label class="custom-upload-button">
                <input
                  type="file"
                  @change="onUpdateFileChange"
                  accept="image/*"
                  ref="updateFileInput"
                  hidden
                />
                <ion-icon :icon="cloudUpload" class="upload-icon"></ion-icon>
                Choose Image
              </label>
            </div>
          </ion-item>
          <ion-button expand="block" @click="submitUpdateForm" class="update-button" color="primary" >
            Update
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showEditPurchaseDataModal" @didDismiss="closeEditPurchaseDataModal" ion-color-scheme="light">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Edit Purchase Data</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeEditPurchaseDataModal">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Date</ion-label>
            <ion-input type="date" v-model="editPurchaseForm.date"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Company</ion-label>
            <ion-select v-model="editPurchaseForm.companyId">
              <ion-select-option
                v-for="company in CompanyList"
                :key="company.id"
                :value="company.id"
              >
                {{ company.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Vendor</ion-label>
            <div class="vendor-select-container">
              <ion-select v-model="editPurchaseForm.vendorId" placeholder="Select Vendor">
                <ion-select-option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                  {{ vendor.vendor_name }}
                </ion-select-option>
              </ion-select>
              <ion-button fill="clear" @click="openAddVendorModal" class="add-vendor-button">
                <ion-icon :icon="add"></ion-icon>
              </ion-button>
            </div>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Amount</ion-label>
            <ion-input
              type="number"
              v-model="editPurchaseForm.amount"
              placeholder="Enter purchase amount"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Purchase Tax Amount</ion-label>
            <ion-input
              type="number"
              v-model="editPurchaseForm.purchase_tax_amount"
              placeholder="Enter tax amount"
            ></ion-input>
          </ion-item>
          <ion-button expand="block"
            @click="submitEditPurchaseDataForm"
            class="update-button"
            color="primary">
            Update Purchase Data
          </ion-button>

        </ion-content>
      </ion-modal>

      <ion-alert
        :is-open="showDeleteAlert"
        header="Confirm Delete"
        message="Are you sure you want to delete this bill?"
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
        ]"
      ></ion-alert>

      <ion-alert
        :is-open="showDeletePurchaseDataAlert"
        header="Confirm Delete"
        message="Are you sure you want to delete this purchase record?"
        :buttons="[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              showDeletePurchaseDataAlert = false;
            },
          },
          {
            text: 'Yes',
            handler: () => {
              confirmDeletePurchaseData();
            },
          },
        ]"
      ></ion-alert>

      <ion-modal :is-open="showAddPurchaseModal" @didDismiss="closeAddPurchaseModal" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Add Purchase and Bill</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddPurchaseModal">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Date</ion-label>
            <ion-input :value="selectedDate" readonly></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Company</ion-label>
            <ion-input :value="selectedCompany" readonly></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Vendor</ion-label>
            <div class="vendor-select-container">
              <ion-select v-model="addPurchaseForm.vendorId" placeholder="Select Vendor">
                <ion-select-option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                  {{ vendor.vendor_name }}
                </ion-select-option>
              </ion-select>
              <ion-button fill="clear" @click="openAddVendorModal" class="add-vendor-button">
                <ion-icon :icon="add"></ion-icon>
              </ion-button>
            </div>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Amount</ion-label>
            <ion-input
              type="number"
              v-model="addPurchaseForm.amount"
              placeholder="Enter purchase amount"
              @ionInput="calculatePurchaseTax"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Calculated Purchase Tax (5%)</ion-label>
            <ion-input
              type="number"
              :value="calculatedPurchaseTax"
              readonly
            ></ion-input>
          </ion-item>
          <br><br>
          <ion-item>
            <div class="image-upload-container">
              <div v-if="previewImage" class="preview-container">
                <img :src="previewImage" alt="Selected Image" class="preview-image" />
                <ion-button
                  fill="clear"
                  class="remove-image-button"
                  @click="removePreviewImage"
                >
                  <ion-icon :icon="closeCircle"></ion-icon>
                </ion-button>
              </div>
              <label class="custom-upload-button">
                <input
                  type="file"
                  @change="onFileChange"
                  accept="image/*"
                  ref="fileInput"
                  hidden
                />
                <ion-icon :icon="cloudUpload" class="upload-icon"></ion-icon>
                Choose Image
              </label>
            </div>
          </ion-item>
          <ion-button expand="block"
            @click="submitAddPurchaseForm"
            class="submit-button"
            color="primary">
            Submit
          </ion-button>

        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showAddVendorModal" @didDismiss="closeAddVendorModal" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Add Vendor</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddVendorModal">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Vendor Name</ion-label>
            <ion-input
              v-model="addVendorForm.vendor_name"
              placeholder="Enter vendor name"
            ></ion-input>
          </ion-item>
          <ion-button expand="block" @click="submitAddVendorForm" class="submit-button" color="primary">
            Add Vendor
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openAddPurchaseModal" class="action-fab-button">
          &nbsp;<ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>
<script>
import { defineComponent, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  IonPage,
  IonContent,
  IonButton,
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonLabel,
  IonPopover,
  IonList,
  IonItem,
  IonAlert,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonFab,
  IonFabButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonText,
  IonItemDivider,
  toastController,
} from "@ionic/vue";
import {
  cart,
  cash,
  cloudUpload,
  closeCircle,
  ellipsisVertical,
  close,
  create,
  trash,
  add,
  eyeOutline,
} from "ionicons/icons";
import Header from "@/components/Header.vue";
import { parseISO, addMonths, isWithinInterval, startOfDay, endOfDay, format, startOfMonth, endOfMonth, isSameDay, isSameMonth } from "date-fns";
import { mapActions, mapState, mapGetters } from "vuex";

export default defineComponent({
  name: "DayDetails",
  components: {
    IonPage,
    IonContent,
    IonButton,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonModal,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    IonLabel,
    Header,
    IonPopover,
    IonList,
    IonItem,
    IonAlert,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
    IonFab,
    IonFabButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonText,
    IonItemDivider,
  },
  data() {
    return {
      addPurchaseForm: {
        vendorId: "", // Will hold the vendor's ID
        date: "",
        companyId: "",
        amount: "",
        status: "1",
      },
      addVendorForm: {
        vendor_name: "",
      },
      updateForm: {
        id: null,
        date: "",
        companyId: "",
        image: null,
        imageUrl: "",
      },
      showEditPurchaseDataModal: false,
      editPurchaseForm: {
        id: null,
        vendorId: "", // Will hold the vendor's ID for editing
        date: "",
        companyId: "",
        amount: "",
        purchase_tax_amount: "",
        status: "1",
      },
      showDeletePurchaseDataAlert: false,
      purchaseDataToDeleteId: null,
      isSalesDataLoaded: false,
      taxFilterType: "day",
      showAddVendorModal: false,
      calculatedPurchaseTax: 0,
      showDetailedPurchaseModal: false,
      selectedPurchaseForDetail: null,
      imagesForDetailedPurchase: [],
      expandedPurchaseId: null,
      selectedSegment: "purchase", // Default to 'purchase' segment
    };
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const companyId = computed(() => route.params.companyId);
    const date = computed(() => route.params.date);
    const formattedDate = computed(() => {
      return format(new Date(date.value), "MMMM d, yyyy");
    });
    const companyName = ref("");
    const image = ref(null);
    const previewImage = ref(null);

    const detailedViewImage = ref(null); // This will hold the image object for the fullscreen modal
    const showImageModal = ref(false); // Controls the visibility of the fullscreen image modal

    const showPopover = ref(false);
    const popoverEvent = ref(null);
    const selectedImage = ref(null);
    const showUpdateModal = ref(false);
    const showDeleteAlert = ref(false);
    const fileInput = ref(null);
    const updateFileInput = ref(null);
    const showAddPurchaseModal = ref(false);

    // New functions for fullscreen image modal
    const openImageFullScreen = (img) => {
      detailedViewImage.value = img;
      showImageModal.value = true;
    };

    const closeImageModal = () => {
      showImageModal.value = false;
      detailedViewImage.value = null;
    };

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
    const onUpdateFileChange = (event) => {
      let files = null;
      if (event.target && event.target.files) {
        files = event.target.files;
      } else if (event.detail && event.detail.value) {
        files = event.detail.value;
      }
      if (files && files.length > 0) {
        image.value = files[0];
        previewImage.value = URL.createObjectURL(files[0]);
      } else {
        console.error("No files selected or invalid event structure");
      }
    };
    const onFileChange = (event) => {
      let files = null;
      if (event.target && event.target.files) {
        files = event.target.files;
      } else if (event.detail && event.detail.value) {
        files = event.detail.value;
      }
      if (files && files.length > 0) {
        image.value = files[0];
        previewImage.value = URL.createObjectURL(files[0]);
      } else {
        console.error("No files selected or invalid event structure");
      }
    };
    const removePreviewImage = () => {
      image.value = null;
      previewImage.value = null;
      if (fileInput.value) fileInput.value.value = "";
      if (updateFileInput.value) updateFileInput.value.value = "";
    };
    const deleteImage = () => {
      showDeleteAlert.value = true;
      closePopover();
    };
    const closeUpdateModal = () => {
      showUpdateModal.value = false;
      removePreviewImage(); // Clear preview and file input
    };
    const navigateTo = (page) => {
      // This function is still useful for routing to Sales page if needed.
      // For 'purchase' and 'overview', we now directly update selectedSegment.
      if (page === "sales") {
        router.push({ name: "Sales", params: { date: date.value } });
      }
    };
    const openAddPurchaseModal = () => {
      showAddPurchaseModal.value = true;
    };
    const closeAddPurchaseModal = () => {
      showAddPurchaseModal.value = false;
      removePreviewImage();
    };

    return {
      companyId,
      date,
      formattedDate,
      companyName,
      image,
      previewImage,
      fileInput,
      updateFileInput,
      detailedViewImage,
      showImageModal, // Expose the new modal state
      openImageFullScreen, // Expose the new function
      closeImageModal, // Expose the new function
      showPopover,
      popoverEvent,
      showOptions,
      closePopover,
      deleteImage,
      ellipsisVertical,
      showUpdateModal,
      showDeleteAlert,
      closeUpdateModal,
      close,
      create,
      trash,
      onUpdateFileChange,
      onFileChange,
      removePreviewImage,
      selectedImage,
      navigateTo,
      cart,
      cash,
      cloudUpload,
      closeCircle,
      add,
      format,
      parseISO,
      showAddPurchaseModal,
      openAddPurchaseModal,
      closeAddPurchaseModal,
      eyeOutline,
    };
  },
  computed: {
    ...mapState("bill", ["PurchaseList"]),
    ...mapState("company", ["CompanyList"]),
    ...mapState("purchase", ["PurchaseData"]),
    ...mapState("sales", ["SaleList"]),
    // Map the 'vendors' getter from the 'vendors' module
    ...mapGetters("vendors", ["vendors", "getVendorById"]),
    selectedDate() {
      return this.formattedDate;
    },
    selectedCompany() {
      return this.companyName;
    },
    filteredPurchaseData() {
      const urlDate = this.date;
      if (!this.PurchaseData || !this.PurchaseData.data) return [];

      return this.PurchaseData.data.filter((purchase) => {
        if (!purchase.date) return false;
        const purchaseDate = format(parseISO(purchase.date), "yyyy-MM-dd");
        return (
          purchase.companyId?.toString() === this.companyId?.toString() &&
          purchaseDate === urlDate
        );
      });
    },
    isDataLoaded() {
      // You might want to add vendors.loading state here too
      return this.PurchaseList && this.PurchaseList.data && this.isSalesDataLoaded && this.vendors.length > 0;
    },
    currentCompany() {
      return this.CompanyList.find(
        (company) => company.id.toString() === this.companyId.toString()
      );
    },
    currentPeriod() {
      if (!this.currentCompany || !this.currentCompany.ved) return null;
      const vedDate = startOfDay(parseISO(this.currentCompany.ved));
      const now = new Date();
      const monthsSinceVed = Math.floor(
        (now - vedDate) / (1000 * 60 * 60 * 24 * 30.44)
      );
      const periodNumber = Math.floor(monthsSinceVed / 3);
      const periodStart = addMonths(vedDate, periodNumber * 3);
      const periodEnd = endOfDay(addMonths(periodStart, 3));
      return { start: periodStart, end: periodEnd };
    },
    currentDate() {
      return new Date(this.date);
    },
    currentMonth() {
      return {
        start: startOfMonth(this.currentDate),
        end: endOfMonth(this.currentDate)
      };
    },
    currentMonthFormatted() {
      return format(this.currentDate, "MMMM yyyy");
    },
    dayPurchaseTax() {
      if (!this.PurchaseData || !this.PurchaseData.data) return 0;
      return this.PurchaseData.data
        .filter((purchase) => {
          const purchaseDate = parseISO(purchase.date);
          return (
            purchase.companyId.toString() === this.companyId.toString() &&
            isSameDay(purchaseDate, this.currentDate)
          );
        })
        .reduce((total, purchase) => total + (parseFloat(purchase.purchase_tax_amount) || 0), 0);
    },
    daySalesTax() {
      if (!this.SaleList || !this.SaleList.data) return 0;
      return this.SaleList.data
        .filter((sale) => {
          const saleDate = parseISO(sale.date);
          return (
            sale.companyId.toString() === this.companyId.toString() &&
            isSameDay(saleDate, this.currentDate)
          );
        })
        .reduce((total, sale) => {
          const taxAmount = parseFloat(sale.sale_tax_amount) || 0;
          return total + taxAmount;
        }, 0);
    },
    monthPurchaseTax() {
      if (!this.PurchaseData || !this.PurchaseData.data) return 0;
      return this.PurchaseData.data
        .filter((purchase) => {
          const purchaseDate = parseISO(purchase.date);
          return (
            purchase.companyId.toString() === this.companyId.toString() &&
            isSameMonth(purchaseDate, this.currentDate)
          );
        })
        .reduce((total, purchase) => total + (parseFloat(purchase.purchase_tax_amount) || 0), 0);
    },
    monthSalesTax() {
      if (!this.SaleList || !this.SaleList.data) return 0;
      return this.SaleList.data
        .filter((sale) => {
          const saleDate = parseISO(sale.date);
          return (
            sale.companyId.toString() === this.companyId.toString() &&
            isSameMonth(saleDate, this.currentDate)
          );
        })
        .reduce((total, sale) => {
          const taxAmount = parseFloat(sale.sale_tax_amount) || 0;
          return total + taxAmount;
        }, 0);
    },
    purchaseTax() {
      if (!this.PurchaseData || !this.PurchaseData.data || !this.currentPeriod) return 0;
      return this.PurchaseData.data
        .filter((purchase) => {
          const purchaseDate = parseISO(purchase.date);
          return (
            purchase.companyId.toString() === this.companyId.toString() &&
            isWithinInterval(purchaseDate, this.currentPeriod)
          );
        })
        .reduce((total, purchase) => total + (parseFloat(purchase.purchase_tax_amount) || 0), 0);
    },
    salesTax() {
      if (!this.SaleList || !this.SaleList.data || !this.currentPeriod) return 0;
      return this.SaleList.data
        .filter((sale) => {
          const saleDate = parseISO(sale.date);
          return (
            sale.companyId.toString() === this.companyId.toString() &&
            isWithinInterval(saleDate, this.currentPeriod)
          );
        })
        .reduce((total, sale) => {
          const taxAmount = parseFloat(sale.sale_tax_amount) || 0;
          return total + taxAmount;
        }, 0);
    },
    displayPurchaseTax() {
      switch (this.taxFilterType) {
        case 'day':
          return this.dayPurchaseTax;
        case 'month':
          return this.monthPurchaseTax;
        case 'period':
          return this.purchaseTax;
        default:
          return this.dayPurchaseTax;
      }
    },
    displaySalesTax() {
      switch (this.taxFilterType) {
        case 'day':
          return this.daySalesTax;
        case 'month':
          return this.monthSalesTax;
        case 'period':
          return this.salesTax;
        default:
          return this.daySalesTax;
      }
    },
    displayTotalTax() {
      return this.displayPurchaseTax + this.displaySalesTax;
    },
    formattedPeriod() {
      if (!this.currentPeriod) return "N/A";
      return `${format(this.currentPeriod.start, "MMM d, yyyy")} - ${format(
        this.currentPeriod.end,
        "MMM d, yyyy"
      )}`;
    },
    taxPaymentDate() {
      if (!this.currentPeriod) return "N/A";
      return format(this.currentPeriod.end, "MMM d, yyyy");
    },
    // Computed properties for Overview section totals
    totalPurchaseAmount() {
      if (!this.PurchaseData || !this.PurchaseData.data) return 0;
      let purchasesToSum = [];
      switch (this.taxFilterType) {
        case 'day':
          purchasesToSum = this.PurchaseData.data.filter(purchase =>
            purchase.companyId.toString() === this.companyId.toString() &&
            isSameDay(parseISO(purchase.date), this.currentDate)
          );
          break;
        case 'month':
          purchasesToSum = this.PurchaseData.data.filter(purchase =>
            purchase.companyId.toString() === this.companyId.toString() &&
            isSameMonth(parseISO(purchase.date), this.currentDate)
          );
          break;
        case 'period':
          purchasesToSum = this.PurchaseData.data.filter(purchase =>
            purchase.companyId.toString() === this.companyId.toString() &&
            this.currentPeriod && isWithinInterval(parseISO(purchase.date), this.currentPeriod)
          );
          break;
        default:
          purchasesToSum = this.PurchaseData.data.filter(purchase =>
            purchase.companyId.toString() === this.companyId.toString() &&
            isSameDay(parseISO(purchase.date), this.currentDate)
          );
      }
      return purchasesToSum.reduce((total, purchase) => total + (parseFloat(purchase.amount) || 0), 0);
    },
    totalSalesAmount() {
      if (!this.SaleList || !this.SaleList.data) return 0;
      let salesToSum = [];
      switch (this.taxFilterType) {
        case 'day':
          salesToSum = this.SaleList.data.filter(sale =>
            sale.companyId.toString() === this.companyId.toString() &&
            isSameDay(parseISO(sale.date), this.currentDate)
          );
          break;
        case 'month':
          salesToSum = this.SaleList.data.filter(sale =>
            sale.companyId.toString() === this.companyId.toString() &&
            isSameMonth(parseISO(sale.date), this.currentDate)
          );
          break;
        case 'period':
          salesToSum = this.SaleList.data.filter(sale =>
            sale.companyId.toString() === this.companyId.toString() &&
            this.currentPeriod && isWithinInterval(parseISO(sale.date), this.currentPeriod)
          );
          break;
        default:
          salesToSum = this.SaleList.data.filter(sale =>
            sale.companyId.toString() === this.companyId.toString() &&
            isSameDay(parseISO(sale.date), this.currentDate)
          );
      }
      return salesToSum.reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);
    },
    displayTotalPurchaseAmount() {
        return this.totalPurchaseAmount;
    },
    displayTotalSalesAmount() {
        return this.totalSalesAmount;
    },
    overviewPeriodLabel() {
        switch (this.taxFilterType) {
            case 'day': return 'Daily';
            case 'month': return 'Monthly';
            case 'period': return 'Tax Period';
            default: return 'Daily';
        }
    },
    overviewPeriodDate() {
        switch (this.taxFilterType) {
            case 'day': return this.formattedDate;
            case 'month': return this.currentMonthFormatted;
            case 'period': return this.formattedPeriod;
            default: return this.formattedDate;
        }
    }
  },
  methods: {
    ...mapActions("bill", ["GET_PURCHASE_LIST", "ADD_BILL", "UPDATE_BILL", "DELETE_BILL"]),
    ...mapActions("company", ["GET_COMPANY_LIST"]),
    ...mapActions('purchase', [
      'GET_PURCHASE_LISTS',
      'CREATE_PURCHASE',
      'UPDATE_PURCHASE',
      'DELETE_PURCHASE',
      'GET_PURCHASE_BY_ID',
      'GET_PURCHASE_AMOUNT',
      'CLEAR_ERROR',
      'CLEAR_CURRENT_PURCHASE'
    ]),
    ...mapActions("sales", ["GET_SALE_LIST"]),
    ...mapActions("vendors", ["GET_VENDOR_LIST", "CREATE_VENDOR"]),
    async presentToast(message, color = 'success') {
      const toast = await toastController.create({
        message: message,
        duration: 2000,
        color: color,
        position: 'bottom',
      });
      await toast.present();
    },
    fetchCompanyName() {
      const company = this.CompanyList.find(
        (c) => c.id.toString() === this.companyId.toString()
      );
      this.companyName = company ? company.name : `Company ${this.companyId}`;
    },
    getCompanyName(companyId) {
      const company = this.CompanyList.find(
        (c) => c.id.toString() === companyId.toString()
      );
      return company ? company.name : `Company ${companyId}`;
    },
    // Helper method to get vendor name by ID
    getVendorName(vendorId) {
      const vendor = this.getVendorById(vendorId); // Use the getter from vendors module
      return vendor ? vendor.vendor_name : 'N/A';
    },
    async loadPurchaseData() {
      try {
        await Promise.all([
          this.GET_PURCHASE_LIST(), // This should fetch bill images
          this.GET_SALE_LIST({ companyId: this.companyId }),
          this.GET_PURCHASE_LISTS(), // This should fetch purchase data
          this.GET_VENDOR_LIST(), // Ensure vendor list is loaded
        ]);
        this.isSalesDataLoaded = true;
      } catch (error) {
        console.error("Failed to load data:", error);
        this.presentToast('Failed to load data. Please try again.', 'danger');
      }
    },
    calculatePurchaseTax() {
      const amount = parseFloat(this.addPurchaseForm.amount) || 0;
      const vatRate = 5;
      this.calculatedPurchaseTax = amount * (vatRate / 100);
    },
    async submitAddPurchaseForm() {
      try {
        if (!this.addPurchaseForm.amount || !this.addPurchaseForm.vendorId) {
          throw new Error("Amount and vendor are required");
        }
        const amount = parseFloat(this.addPurchaseForm.amount);
        const vatRate = 5;
        const purchaseTaxAmount = amount * (vatRate / 100);

        const purchasePayload = {
          date: this.date,
          vendorId: parseInt(this.addPurchaseForm.vendorId),
          companyId: parseInt(this.companyId),
          amount: amount,
          purchase_tax_amount: purchaseTaxAmount,
          status: parseInt(this.addPurchaseForm.status),
        };

        const selectedVendor = this.getVendorById(this.addPurchaseForm.vendorId);
        if (selectedVendor) {
            purchasePayload.name = selectedVendor.vendor_name;
        }

        await this.CREATE_PURCHASE(purchasePayload);

        if (this.image) {
          const billPayload = {
            date: this.date,
            companyId: this.companyId,
            image: [this.image],
          };
          await this.ADD_BILL(billPayload);
        }

        this.closeAddPurchaseModal();
        await this.loadPurchaseData(); // Reload all data to refresh lists
        this.presentToast('Purchase and bill added successfully!', 'success');
      } catch (error) {
        console.error("Error adding purchase and bill:", error);
        this.presentToast('Failed to add purchase and bill.', 'danger');
      }
    },
    async submitUpdateForm() {
      try {
        if (!this.updateForm.id || !this.updateForm.date || !this.updateForm.companyId) {
          throw new Error("Missing required fields for bill image update");
        }

        const payload = {
          id: this.updateForm.id,
          date: this.updateForm.date,
          companyId: this.updateForm.companyId,
        };

        // Only include the image in the payload if a new image was selected
        if (this.image && this.previewImage !== this.updateForm.imageUrl) {
            payload.image = [this.image];
        } else {
            payload.image = []; // No new image selected, send empty array or omit
        }

        await this.UPDATE_BILL(payload);
        this.closeUpdateModal();
        await this.GET_PURCHASE_LIST(); // Reload bill images
        this.presentToast('Bill image updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating bill:", error);
        this.presentToast('Failed to update bill image.', 'danger');
      }
    },
    async confirmDelete() {
      try {
        await this.DELETE_BILL(this.selectedImage.id);
        this.showDeleteAlert = false;
        await this.GET_PURCHASE_LIST(); // Reload bill images
        this.presentToast('Bill image deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting bill:", error);
        this.presentToast('Failed to delete bill image.', 'danger');
      }
    },
    handleReset() {
      this.image = null;
      this.previewImage = null;
      if (this.fileInput) this.fileInput.value = "";
    },
    // This function is for editing purchase data (now called from popover)
    editPurchaseData(purchase) {
      const formattedDate = format(parseISO(purchase.date), "yyyy-MM-dd");
      this.editPurchaseForm = {
        id: purchase.id,
        vendorId: purchase.vendorId || "", // Set vendorId from purchase data
        date: formattedDate,
        companyId: purchase.companyId,
        amount: purchase.amount.toString(),
        purchase_tax_amount: purchase.purchase_tax_amount.toString(),
        status: purchase.status ? purchase.status.toString() : "1",
      };
      this.showEditPurchaseDataModal = true;
      this.closeDetailedPurchaseView();
    },
    closeEditPurchaseDataModal() {
      this.showEditPurchaseDataModal = false;
      this.editPurchaseForm = {
        id: null,
        vendorId: "",
        date: "",
        companyId: "",
        amount: "",
        purchase_tax_amount: "",
        status: "1",
      };
    },
    async submitEditPurchaseDataForm() {
      try {
        if (!this.editPurchaseForm.amount || !this.editPurchaseForm.purchase_tax_amount || !this.editPurchaseForm.id || !this.editPurchaseForm.vendorId) {
          throw new Error("Missing required fields for purchase update");
        }
        if (!this.editPurchaseForm.status || !["0", "1"].includes(this.editPurchaseForm.status)) {
          this.editPurchaseForm.status = "1";
        }

        const purchaseData = {
          date: this.editPurchaseForm.date,
          vendorId: parseInt(this.editPurchaseForm.vendorId), // Send vendorId
          companyId: parseInt(this.editPurchaseForm.companyId),
          amount: parseFloat(this.editPurchaseForm.amount),
          purchase_tax_amount: parseFloat(this.editPurchaseForm.purchase_tax_amount),
          status: parseInt(this.editPurchaseForm.status),
        };

        const selectedVendor = this.getVendorById(this.editPurchaseForm.vendorId);
        if (selectedVendor) {
            purchaseData.name = selectedVendor.vendor_name;
        }

        await this.UPDATE_PURCHASE({
          id: parseInt(this.editPurchaseForm.id),
          purchaseData,
        });
        this.closeEditPurchaseDataModal();
        await this.loadPurchaseData(); // Reload all data to refresh lists
        this.presentToast('Purchase data updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating purchase data:", error);
        this.presentToast('Failed to update purchase data.', 'danger');
      }
    },
    deletePurchaseData(id) {
      this.purchaseDataToDeleteId = id;
      this.showDeletePurchaseDataAlert = true;
    },
    async confirmDeletePurchaseData() {
      try {
        await this.DELETE_PURCHASE(this.purchaseDataToDeleteId);
        this.showDeletePurchaseDataAlert = false;
        await this.loadPurchaseData(); // Reload all data to refresh lists
        this.presentToast('Purchase data deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting purchase data:", error);
        this.presentToast('Failed to delete purchase data.', 'danger');
      }
    },
    updateImage() {
      if (!this.selectedImage) return;
      let selectedImageDate = this.selectedImage.date;
      if (typeof selectedImageDate === "string") {
        selectedImageDate = new Date(selectedImageDate);
      }
      const formattedDate = format(selectedImageDate, "yyyy-MM-dd");
      this.updateForm = {
        id: this.selectedImage.id,
        date: formattedDate,
        companyId: this.selectedImage.companyId,
        image: null, // Reset image file when opening, it will be set by onUpdateFileChange
        imageUrl: this.selectedImage.image, // Keep existing image URL for display
      };
      this.previewImage = this.selectedImage.image; // Set preview to current image
      this.showUpdateModal = true;
      this.closePopover(); // Close popover when opening update modal
    },
    openAddVendorModal() {
      this.showAddVendorModal = true;
    },
    closeAddVendorModal() {
      this.showAddVendorModal = false;
      this.addVendorForm.vendor_name = "";
    },
    async submitAddVendorForm() {
      try {
        if (!this.addVendorForm.vendor_name.trim()) {
          throw new Error("Vendor name is required");
        }
        const vendorData = {
          vendor_name: this.addVendorForm.vendor_name.trim(),
        };
        // Call CREATE_VENDOR action
        const response = await this.CREATE_VENDOR(vendorData);
        // After successful creation, refresh the vendor list
        await this.GET_VENDOR_LIST();
        // Set the newly created vendor's ID in the addPurchaseForm
        if (response && response.data && response.data.data && response.data.data.id) {
            this.addPurchaseForm.vendorId = response.data.data.id;
        } else if (response && response.data && response.data.id) { // Fallback if API response structure differs slightly
            this.addPurchaseForm.vendorId = response.data.id;
        }
        this.closeAddVendorModal();
        this.presentToast('Vendor created successfully!', 'success');
      } catch (error) {
        console.error("Error creating vendor:", error);
        this.presentToast('Failed to create vendor.', 'danger');
      }
    },
    openDetailedPurchaseView(purchase) {
      this.selectedPurchaseForDetail = purchase;
      // Filter PurchaseList to find images matching the selected purchase's date and companyId
      const purchaseDate = format(parseISO(purchase.date), "yyyy-MM-dd");
      this.imagesForDetailedPurchase = this.PurchaseList.data.filter((bill) => {
        const billDate = format(parseISO(bill.date), "yyyy-MM-dd");
        return (
          bill.companyId.toString() === purchase.companyId.toString() &&
          billDate === purchaseDate
        );
      });
      this.showDetailedPurchaseModal = true;
    },
    closeDetailedPurchaseView() {
      this.showDetailedPurchaseModal = false;
      this.selectedPurchaseForDetail = null;
      this.imagesForDetailedPurchase = []; // Clear images when closing
    },
    togglePurchaseDetails(purchaseId) {
      if (this.expandedPurchaseId === purchaseId) {
        this.expandedPurchaseId = null; // Collapse if already expanded
      } else {
        this.expandedPurchaseId = purchaseId; // Expand the clicked item
      }
    },
  },
  watch: {
    CompanyList: {
      immediate: true,
      handler() {
        this.fetchCompanyName();
      },
    },
    // When selectedSegment changes, update the URL if navigating to 'sales'
    selectedSegment(newValue) {
      if (newValue === 'sales') {
        this.$router.push({ name: 'Sales', params: { date: this.date } });
      }
      // For 'purchase' and 'overview', we stay on the current route and just change the displayed content.
    }
  },
  mounted() {
    this.loadPurchaseData(); // This now includes GET_VENDOR_LIST
    this.GET_COMPANY_LIST();
    this.handleReset();
    // Ensure 'purchase' is selected by default on mount
    this.selectedSegment = 'purchase';
  },
});
</script>


<style scoped>
/* Base styles for ion-content and other components */
ion-content {
  --background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding-bottom: 80px;
}
.selected-day {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 1rem 0;
  color: var(--ion-color-dark);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.segment-container {
  margin: 1rem 0;
  --background: var(--ion-color-light);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
ion-segment-button {
  --indicator-color: var(--ion-color-primary);
  --color: var(--ion-color-medium);
  --color-checked: var(--ion-color-primary);
  font-weight: 500;
}
ion-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}
.image-grid {
  padding: 0.5rem;
}
.image-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #ffffff;
  margin: 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
}
.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.image-container {
  width: 100%;
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}
.thumbnail-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
/* Enhanced Image Upload Styles */
.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.custom-upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 100%;
  text-align: center;
}
.custom-upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}
.custom-upload-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.upload-icon {
  font-size: 1.2rem;
}
.preview-container {
  position: relative;
  width: 100%;
  max-width: 200px;
  margin-top: 0.5rem;
}
.preview-image {
  width: 100%;
  height: auto;
  max-height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.remove-image-button {
  position: absolute;
  top: -10px;
  right: -10px;
  --background: rgba(255, 255, 255, 0.9);
  --color: var(--ion-color-danger);
  border-radius: 50%;
  padding: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.remove-image-button ion-icon {
  font-size: 1.2rem;
}

.dots-menu {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10; /* Ensure it's above the image */
  --color: #ffffff; /* White dots for visibility on image */
  --ripple-color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  --padding-start: 0;
  --padding-end: 0;
  width: 36px; /* Make the button clickable */
  height: 36px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3); /* Slightly transparent background */
}
.dots-menu ion-icon {
  margin-right: 0; /* Remove default margin from ion-icon within ion-button */
}

/* Fullscreen overlay for image */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.fullscreen-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.fullscreen-image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #fff;
  z-index: 10000;
}
.purchase-data-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  margin: 2rem 0;
  border: 1px solid rgba(79, 172, 254, 0.1);
  overflow: hidden;
  position: relative;
}
.purchase-data-card ion-card-header {
  color: white;
  padding: 1.5rem;
  border-radius: 20px 20px 0 0;
}

.purchase-data-card ion-card-title {
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Purchase item styling */
ion-item {
  --background: transparent;
  --border-color: rgba(0, 0, 0, 0.1);
  --padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 16px;
  transition: all 0.3s ease;
}



.tax-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tax-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.tax-card ion-card-header {

  color: white;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.tax-card ion-card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.tax-card ion-card-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.tax-card ion-card-subtitle {
  font-size: 16px;
  opacity: 0.9;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.tax-card ion-card-content {
  padding: 32px 24px;
  background: white;
}

.tax-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tax-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tax-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.05) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.tax-item:hover::before {
  transform: translateX(100%);
}

.tax-item:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.tax-item.total {

  color: rgb(0, 0, 0);
  border-left-color: #ffd700;
  font-weight: 600;
  margin-top: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}



.tax-label {
  font-size: 16px;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tax-item.total .tax-label {
  color: rgb(0, 0, 0);
}

.tax-label::before {
  content: '';
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.6;
}

.tax-value {
  font-size: 18px;
  font-weight: 700;
  color: #28a745;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: 0.5px;
}

.tax-item.total .tax-value {
color: #28a745;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.no-data-message {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-size: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  position: relative;
  overflow: hidden;
}

.no-data-message::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  border: 3px solid #667eea;
  border-radius: 50%;
  border-top-color: transparent;
  transform: translate(-50%, -50%);
  animation: spin 1s linear infinite;
}

.no-data-message p {
  margin: 0;
  margin-top: 40px;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Modal Container */
ion-modal {
  --backdrop-opacity: 0.4;
}

ion-modal .modal-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}


ion-modal ion-toolbar {

  --border-color: transparent;
  --color: white;
}

ion-modal ion-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

ion-modal ion-buttons ion-button {
  --color: white;
  --background-hover: rgba(255, 255, 255, 0.1);
  --border-radius: 8px;
}

/* Modal Content */
ion-modal ion-content {
  --background: #f8f9fa; /* Light background for modal content */
}

/* Form Items */
ion-modal ion-item {
  --background: white; /* White background for items in modals */
  --border-color: #e9ecef;
  --border-radius: 8px;
  --border-width: 1px;
  --inner-padding-top: 12px;
  --inner-padding-bottom: 12px;
  --inner-padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
ion-modal ion-label {
  --color: #495057; /* Darker text for labels */
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

ion-modal ion-input {
  --color: #212529; /* Dark text for input values */
  --background: transparent;
  --border-color: #dee2e6;
  --border-radius: 6px;
  --border-width: 1px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 12px;
  --padding-end: 12px;
  font-size: 16px;
  margin-top: 4px;
}
ion-modal ion-select {
  --color: #212529; /* Dark text for select values */
  --background: transparent;
  --border-color: #dee2e6;
  --border-radius: 6px;
  --border-width: 1px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 12px;
  --padding-end: 12px;
  font-size: 16px;
  margin-top: 4px;
  min-height: 44px;
}


/* Vendor Select Container */
.vendor-select-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}

.vendor-select-container ion-select {
  flex: 1;
  margin-top: 0;
}

.add-vendor-button {
  --background: #f8f9fa; /* Light background for add vendor button */
  --background-hover: #e9ecef;
  --border-radius: 6px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 10px;
  --padding-end: 10px;
  min-height: 44px;
  width: 44px;
  border: 1px solid #dee2e6;
}

.add-vendor-button ion-icon {
  font-size: 18px;
}

/* Update Button */
.update-button {
  --color: white;
  --border-radius: 8px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}




.select-popover {
  --background: white; /* White background for select popover */
  --border-radius: 8px;
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.select-popover ion-item {
  --background: transparent;
  --border-color: transparent;
  --color: #495057; /* Dark text for popover items */
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 44px;
}

.select-popover ion-item:hover {
  --background: #f8f9fa; /* Light hover background for popover items */
}

.select-popover ion-item.item-selected {
  --background: #e7f3ff; /* Light background for selected popover item */

  font-weight: 500;
}

@media (max-width: 768px) {
  ion-modal ion-content {
    --padding-start: 16px;
    --padding-end: 16px;
  }

  ion-modal ion-item {
    --inner-padding-start: 12px;
    --inner-padding-end: 12px;
  }

  ion-modal ion-title {
    font-size: 18px;
  }
}

/* Removed the @media (prefers-color-scheme: dark) block to force light mode */


.custom-edit-btn {
  --border-width: 1px;
  --border-radius: 8px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 12px;
  --padding-end: 12px;
}

.update-button {
  --border-width: 1px;
  --border-radius: 6px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 16px;
  --padding-end: 16px;
  --box-shadow: none;
}
.submit-button {
  --border-width: 1px;
  --border-radius: 6px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 14px;
  --padding-end: 14px;
  --box-shadow: none;
}
</style>