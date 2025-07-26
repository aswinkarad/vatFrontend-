<template>
  <ion-page>
    <ion-header>
      <Header />
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">From Date</ion-label>
        <ion-input
          :value="formattedFromDateDisplay"
          id="from-date-picker"
          readonly
        ></ion-input>
        <ion-popover trigger="from-date-picker" :show-backdrop="true">
          <ion-datetime
            presentation="date"
            @ionChange="onFromDateChange($event)"
            :value="selectedFromDateInternal ? selectedFromDateInternal.toISOString() : ''"
          ></ion-datetime>
        </ion-popover>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">To Date</ion-label>
        <ion-input
          :value="formattedToDateDisplay"
          id="to-date-picker"
          readonly
        ></ion-input>
        <ion-popover trigger="to-date-picker" :show-backdrop="true">
          <ion-datetime
            presentation="date"
            @ionChange="onToDateChange($event)"
            :value="selectedToDateInternal ? selectedToDateInternal.toISOString() : ''"
          ></ion-datetime>
        </ion-popover>
      </ion-item>

      <h2 class="selected-day">{{ formattedDateRangeDisplay }}</h2>
      <ion-segment :value="selectedSegment" class="segment-container">
        <ion-segment-button value="overview" @click="selectedSegment = 'overview'">
          <ion-icon :icon="eyeOutline"></ion-icon>
          <ion-label>Overview</ion-label>
        </ion-segment-button>
        <ion-segment-button value="purchase" @click="selectedSegment = 'purchase'">
          <ion-icon :icon="cart"></ion-icon>
          <ion-label>Purchase</ion-label>
        </ion-segment-button>
        <ion-segment-button value="sales" @click="selectedSegment = 'sales'">
          <ion-icon :icon="cash"></ion-icon>
          <ion-label>Sales</ion-label>
        </ion-segment-button>
      </ion-segment>

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
          </div>
        </ion-card-content>
      </ion-card>

      <ion-grid v-if="selectedSegment === 'purchase' && isDataLoaded">
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="3" v-for="purchase in filteredPurchaseData" :key="purchase.id">
            <ion-card class="sales-card">
              <ion-card-content>
                <div class="card-header">
                  <ion-icon :icon="storefrontOutline" class="info-icon"></ion-icon>
                  <div class="product-name">Purchase Record</div>
                  <ion-button fill="clear" class="options-button" @click="openPurchasePopover($event, purchase)">
                    <ion-icon :icon="ellipsisVertical"></ion-icon>
                  </ion-button>
                </div>
                <div class="card-details">
                  <div class="info-item">
                    <ion-icon :icon="calendarNumberOutline" class="detail-icon"></ion-icon>
                    <span>Date: {{ format(parseISO(purchase.date), 'MMM d, yyyy') }}</span>
                  </div>
                  <div class="info-item">
                    <ion-icon :icon="pricetagOutline" class="detail-icon"></ion-icon>
                    <span>Category: {{ getCategoryName(purchase.categoryId) || 'N/A' }}</span>
                  </div>
                  <div class="info-item" v-if="purchase.subcategoryId">
                    <ion-icon :icon="pricetagsOutline" class="detail-icon"></ion-icon>
                    <span>Subcategory: {{ getSubcategoryName(purchase.subcategoryId) || 'N/A' }}</span>
                  </div>
                  <div class="info-item amount">
                    <ion-icon :icon="walletOutline" class="detail-icon"></ion-icon>
                    <span>Amount: ₹{{ purchase.amount.toFixed(2) }}</span>
                  </div>
                  <div class="info-item tax-amount">
                    <ion-icon :icon="receiptOutline" class="detail-icon"></ion-icon>
                    <span>Purchase Tax: ₹{{ purchase.purchase_tax_amount.toFixed(2) }}</span>
                  </div>
                  <div class="info-item">
                    <ion-icon :icon="timeOutline" class="detail-icon"></ion-icon>
                    <span>Created: {{ format(parseISO(purchase.createdAt), 'MMM d, yyyy HH:mm') }}</span>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div v-if="selectedSegment === 'sales'">
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
                    <ion-button fill="clear" class="options-button" @click="openSalePopover($event, item)">
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
                      <span>Amount: ₹{{ item.amount }}</span>
                    </div>
                    <div class="info-item tax-amount">
                      <ion-icon :icon="receiptOutline" class="detail-icon"></ion-icon>
                      <span>Sale Tax: ₹{{ item.sale_tax_amount }}</span>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <ion-popover :is-open="showPurchasePopover" @didDismiss="closePurchasePopover" :event="purchasePopoverEvent">
        <ion-content>
          <ion-list>
            <ion-item button @click="editPurchaseData(selectedPurchase)">
              <ion-icon :icon="create" slot="start"></ion-icon>
              <ion-label>Update</ion-label>
            </ion-item>
            <ion-item button @click="deletePurchaseData(selectedPurchase.id)">
              <ion-icon :icon="trash" slot="start"></ion-icon>
              <ion-label>Delete</ion-label>
            </ion-item>
            <ion-item button @click="openDetailedPurchaseView(selectedPurchase)">
              <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
              <ion-label>View Details</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>

      <ion-popover :is-open="showSalePopover" @didDismiss="closeSalePopover" :event="salePopoverEvent">
        <ion-content>
          <ion-list>
            <ion-item button @click="openUpdateSaleModal">
              <ion-icon :icon="create" slot="start"></ion-icon>
              <ion-label>Update</ion-label>
            </ion-item>
            <ion-item button @click="confirmDeleteSale">
              <ion-icon :icon="trash" slot="start"></ion-icon>
              <ion-label>Delete</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>

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
              <ion-text>{{ getCompanyName(selectedPurchaseForDetail.companyId) || 'N/A' }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Category:</ion-label>
              <ion-text>{{ getCategoryName(selectedPurchaseForDetail.categoryId) || 'N/A' }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Subcategory:</ion-label>
              <ion-text>{{ getSubcategoryName(selectedPurchaseForDetail.subcategoryId) || 'N/A' }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Tax Type:</ion-label>
              <ion-text>{{ getTaxTypeName(selectedPurchaseForDetail.taxTypeId) || 'N/A' }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Amount:</ion-label>
              <ion-text>₹{{ selectedPurchaseForDetail.amount.toFixed(2) }}</ion-text>
            </ion-item>
            <ion-item>
              <ion-label>Purchase Tax:</ion-label>
              <ion-text>₹{{ selectedPurchaseForDetail.purchase_tax_amount.toFixed(2) }}</ion-text>
            </ion-item>

            <ion-item-divider v-if="imagesForDetailedPurchase.length > 0">
              <ion-label>Associated Bills</ion-label>
            </ion-item-divider>
            <ion-grid v-if="imagesForDetailedPurchase.length > 0" class="image-grid">
              <ion-row>
                <ion-col size="4" v-for="image in imagesForDetailedPurchase" :key="image.id">
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

      <ion-modal :is-open="showUpdateModal" @didDismiss="closeUpdateModal" ion-color-scheme="light" class="light-theme">
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
          <ion-button expand="block" @click="submitUpdateForm" class="update-button" color="primary">
            Update
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showEditPurchaseDataModal" @didDismiss="closeEditPurchaseDataModal" ion-color-scheme="light" class="light-theme">
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
            <ion-label position="stacked">Category</ion-label>
            <div class="select-with-actions">
              <ion-select v-model="editPurchaseForm.categoryId" placeholder="Select Category">
                <ion-select-option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.cat_name }}
                </ion-select-option>
              </ion-select>
              <ion-button fill="clear" @click="openAddCategoryModal" class="action-button">
                <ion-icon :icon="add"></ion-icon>
              </ion-button>
              <ion-button fill="clear" @click="openEditCategoryModal" class="action-button">
                <ion-icon :icon="create"></ion-icon>
              </ion-button>
              <ion-button fill="clear" @click="confirmDeleteCategory" class="action-button">
                <ion-icon :icon="trash"></ion-icon>
              </ion-button>
            </div>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Subcategory</ion-label>
            <div class="select-with-actions">
              <ion-select v-model="editPurchaseForm.subcategoryId" placeholder="Select Subcategory">
                <ion-select-option v-for="subcategory in filteredSubcategories" :key="subcategory.id" :value="subcategory.id">
                  {{ subcategory.sub_name }}
                </ion-select-option>
              </ion-select>
              <ion-button fill="clear" @click="openAddSubcategoryModal" class="action-button">
                <ion-icon :icon="add"></ion-icon>
              </ion-button>
              <ion-button fill="clear" @click="openEditSubcategoryModal" class="action-button">
                <ion-icon :icon="create"></ion-icon>
              </ion-button>
              <ion-button fill="clear" @click="confirmDeleteSubcategory" class="action-button">
                <ion-icon :icon="trash"></ion-icon>
              </ion-button>
            </div>
          </ion-item>

          <ion-list>
            <ion-radio-group v-model="editPurchaseForm.taxType">
              <ion-list-header><ion-label>Tax Type</ion-label></ion-list-header>
              <ion-item>
                <ion-label>Inclusive</ion-label>
                <ion-radio slot="start" value="inclusive"></ion-radio>
              </ion-item>
              <ion-item>
                <ion-label>Exclusive</ion-label>
                <ion-radio slot="start" value="exclusive"></ion-radio>
              </ion-item>
              <ion-item>
                <ion-label>Zero Tax</ion-label>
                <ion-radio slot="start" value="zero_tax"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-list>

          <ion-item>
            <ion-label position="stacked">Amount</ion-label>
            <ion-input
              type="number"
              v-model="editPurchaseForm.amount"
              placeholder="Enter purchase amount"
              @ionInput="calculatePurchaseTaxEdit"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Purchase Tax Amount</ion-label>
            <ion-input
              type="number"
              :value="calculatedPurchaseTaxEdit"
              readonly
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

      <ion-alert :is-open="showDeleteSaleAlert" header="Confirm Delete" message="Are you sure you want to delete this sale?"
        :buttons="[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              showDeleteSaleAlert = false;
            },
          },
          {
            text: 'Yes',
            handler: () => {
              deleteSale();
            },
          },
        ]">
      </ion-alert>

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
            <ion-input :value="formattedFromDateDisplay" readonly></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Company</ion-label>
            <ion-input :value="selectedCompany" readonly></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Category</ion-label>
            <div class="select-with-actions">
              <ion-select v-model="addPurchaseForm.categoryId" placeholder="Select Category">
                <ion-select-option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.cat_name }}
                </ion-select-option>
              </ion-select>
              <ion-button fill="clear" @click="openAddCategoryModal" class="action-button">
                <ion-icon :icon="add"></ion-icon>
              </ion-button>
              <ion-button fill="clear" @click="openEditCategoryModal" class="action-button">
                <ion-icon :icon="create"></ion-icon>
              </ion-button>
              <ion-button fill="clear" @click="confirmDeleteCategory" class="action-button">
                <ion-icon :icon="trash"></ion-icon>
              </ion-button>
            </div>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Subcategory</ion-label>
            <div class="select-with-actions">
              <ion-select v-model="addPurchaseForm.subcategoryId" placeholder="Select Subcategory">
                <ion-select-option v-for="subcategory in filteredSubcategories" :key="subcategory.id" :value="subcategory.id">
                  {{ subcategory.sub_name }}
                </ion-select-option>
              </ion-select>
              <ion-button fill="clear" @click="openAddSubcategoryModal" class="action-button">
                <ion-icon :icon="add"></ion-icon>
              </ion-button>
              <ion-button fill="clear" @click="openEditSubcategoryModal" class="action-button">
                <ion-icon :icon="create"></ion-icon>
              </ion-button>
              <ion-button fill="clear" @click="confirmDeleteSubcategory" class="action-button">
                <ion-icon :icon="trash"></ion-icon>
              </ion-button>
            </div>
          </ion-item>

          <ion-list>
            <ion-radio-group v-model="addPurchaseForm.taxType">
              <ion-list-header><ion-label>Tax Type</ion-label></ion-list-header>
              <ion-item>
                <ion-label>Inclusive</ion-label>
                <ion-radio slot="start" value="inclusive" @ionChange="calculatePurchaseTax"></ion-radio>
              </ion-item>
              <ion-item>
                <ion-label>Exclusive</ion-label>
                <ion-radio slot="start" value="exclusive" @ionChange="calculatePurchaseTax"></ion-radio>
              </ion-item>
              <ion-item>
                <ion-label>Zero Tax</ion-label>
                <ion-radio slot="start" value="zero_tax" @ionChange="calculatePurchaseTax"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-list>

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
            <ion-label position="stacked">Calculated Purchase Tax</ion-label>
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

      <ion-modal :is-open="showUpdateSaleModal" @didDismiss="showUpdateSaleModal = false" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Update Sale</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showUpdateSaleModal = false">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Date</ion-label>
            <ion-input type="date" v-model="selectedSaleItem.date"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Company</ion-label>
            <ion-select v-model="selectedSaleItem.companyId">
              <ion-select-option v-for="company in CompanyList" :key="company.id" :value="company.id">
                {{ company.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Amount</ion-label>
            <ion-input v-model="selectedSaleItem.amount" type="number" @ionChange="updateSaleTaxAmount"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Sale Tax Amount</ion-label>
            <ion-input v-model="selectedSaleItem.sale_tax_amount" readonly></ion-input>
          </ion-item>
          <ion-button expand="block" @click="updateSale" class="update-button" color="primary">Update Sale</ion-button>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showAddSaleModal" @didDismiss="showAddSaleModal = false" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Add New Sale</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showAddSaleModal = false">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
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
            <ion-label position="stacked">Company</ion-label>
            <ion-select v-model="newSale.companyId">
              <ion-select-option v-for="company in CompanyList" :key="company.id" :value="company.id">
                {{ company.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Sale Tax Amount</ion-label>
            <ion-input v-model="newSale.sale_tax_amount" readonly></ion-input>
          </ion-item>
          <ion-button expand="block" @click="submitAddSaleForm" class="upload-button" color="primary">Add Sale</ion-button>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showAddCategoryModal" @didDismiss="closeAddCategoryModal" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Add Category</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddCategoryModal">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Category Name</ion-label>
            <ion-input v-model="addCategoryForm.cat_name" placeholder="Enter category name"></ion-input>
          </ion-item>
          <ion-button expand="block" @click="submitAddCategoryForm" class="submit-button" color="primary">
            Add Category
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showEditCategoryModal" @didDismiss="closeEditCategoryModal" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Edit Category</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeEditCategoryModal">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Category Name</ion-label>
            <ion-input v-model="editCategoryForm.cat_name" placeholder="Enter new category name"></ion-input>
          </ion-item>
          <ion-button expand="block" @click="submitEditCategoryForm" class="update-button" color="primary">
            Update Category
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-alert
        :is-open="showDeleteCategoryAlert"
        header="Confirm Delete"
        message="Are you sure you want to delete this category? This will also affect associated subcategories and purchases."
        :buttons="[
          { text: 'Cancel', role: 'cancel', handler: () => { showDeleteCategoryAlert = false; } },
          { text: 'Yes', handler: () => { deleteCategory(); } },
        ]"
      ></ion-alert>

      <ion-modal :is-open="showAddSubcategoryModal" @didDismiss="closeAddSubcategoryModal" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Add Subcategory</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddSubcategoryModal">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Parent Category</ion-label>
            <ion-select v-model="addSubcategoryForm.categoryId" placeholder="Select Parent Category">
              <ion-select-option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.cat_name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Subcategory Name</ion-label>
            <ion-input v-model="addSubcategoryForm.sub_name" placeholder="Enter subcategory name"></ion-input>
          </ion-item>
          <ion-button expand="block" @click="submitAddSubcategoryForm" class="submit-button" color="primary">
            Add Subcategory
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showEditSubcategoryModal" @didDismiss="closeEditSubcategoryModal" ion-color-scheme="light" class="light-theme">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color: black;">Edit Subcategory</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeEditSubcategoryModal">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Parent Category</ion-label>
            <ion-select v-model="editSubcategoryForm.categoryId" placeholder="Select Parent Category">
              <ion-select-option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.cat_name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Subcategory Name</ion-label>
            <ion-input v-model="editSubcategoryForm.sub_name" placeholder="Enter new subcategory name"></ion-input>
          </ion-item>
          <ion-button expand="block" @click="submitEditSubcategoryForm" class="update-button" color="primary">
            Update Subcategory
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-alert
        :is-open="showDeleteSubcategoryAlert"
        header="Confirm Delete"
        message="Are you sure you want to delete this subcategory? This will also affect associated purchases."
        :buttons="[
          { text: 'Cancel', role: 'cancel', handler: () => { showDeleteSubcategoryAlert = false; } },
          { text: 'Yes', handler: () => { deleteSubcategory(); } },
        ]"
      ></ion-alert>


      <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-show="selectedSegment !== 'overview'">
        <ion-fab-button class="action-fab-button" @click="handleFabClick">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import Header from '@/components/Header.vue';
import { defineComponent, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol,
  IonSearchbar, IonFab, IonFabButton, IonPopover, IonModal, IonToolbar,
  IonTitle, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonAlert, IonList,
  IonSelect, IonSelectOption, IonCardHeader, IonCardTitle, IonCardSubtitle, IonText,
  IonItemDivider, IonDatetime, toastController, IonSegment, IonSegmentButton,
  IonRadioGroup, IonRadio, IonListHeader
} from '@ionic/vue';
import {
  storefrontOutline, calendarNumberOutline, walletOutline, receiptOutline,
  add, ellipsisVertical, cart, cash, cloudUpload, closeCircle, close, create, trash,
  eyeOutline, timeOutline, pricetagOutline, pricetagsOutline
} from 'ionicons/icons';
import { mapActions, mapState, mapGetters } from 'vuex';
import { parseISO, addMonths, isWithinInterval, startOfDay, endOfDay, format, startOfMonth, endOfMonth, isSameDay, isSameMonth } from "date-fns";

export default defineComponent({
  name: 'DayDetails',
  components: {
    Header,
    IonPage, IonHeader, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol,
    IonSearchbar, IonFab, IonFabButton, IonPopover, IonModal, IonToolbar,
    IonTitle, IonButtons, IonButton, IonItem, IonLabel, IonInput,
    IonAlert, IonList, IonSelect, IonSelectOption, IonCardHeader, IonCardTitle,
    IonCardContent, IonCardSubtitle, IonText, IonItemDivider, IonDatetime,
    IonSegment, IonSegmentButton, IonRadioGroup, IonRadio, IonListHeader
  },
  data() {
    return {
      selectedFromDateInternal: null,
      selectedToDateInternal: null,
      selectedPurchase: null,
      showPurchasePopover: false,
      purchasePopoverEvent: null,
      showAddPurchaseModal: false,

      addPurchaseForm: {
        // expense_type: "", // Removed
        date: "",
        companyId: "",
        amount: "",
        purchase_tax_amount: 0,
        categoryId: null,
        subcategoryId: null,
        taxType: "exclusive",
        status: "1",
      },
      editPurchaseForm: {
        id: null,
        // expense_type: "", // Removed
        date: "",
        companyId: "",
        amount: "",
        purchase_tax_amount: "",
        categoryId: null,
        subcategoryId: null,
        taxType: "exclusive",
        status: "1",
      },
      calculatedPurchaseTax: 0,
      calculatedPurchaseTaxEdit: 0,

      // Category and Subcategory Management
      showAddCategoryModal: false,
      addCategoryForm: {
        cat_name: ""
      },
      showEditCategoryModal: false,
      editCategoryForm: {
        id: null,
        cat_name: ""
      },
      showDeleteCategoryAlert: false,
      categoryToDeleteId: null,

      showAddSubcategoryModal: false,
      addSubcategoryForm: {
        categoryId: null,
        sub_name: ""
      },
      showEditSubcategoryModal: false,
      editSubcategoryForm: {
        id: null,
        categoryId: null,
        sub_name: ""
      },
      showDeleteSubcategoryAlert: false,
      subcategoryToDeleteId: null,

      showDeletePurchaseDataAlert: false,
      purchaseDataToDeleteId: null,
      
      taxFilterType: "day",
      vatRate: 5, // Common VAT rate for both sales and purchases
      showDetailedPurchaseModal: false,
      selectedPurchaseForDetail: null,
      imagesForDetailedPurchase: [],
      expandedPurchaseId: null,
      selectedSegment: "overview",

      // Sales-specific reactive properties from original SalesPage
      searchQuery: '',
      showSalePopover: false,
      salePopoverEvent: null,
      showUpdateSaleModal: false,
      showDeleteSaleAlert: false,
      showAddSaleModal: false,
      selectedSaleItem: {},
      newSale: {
        date: '',
        companyId: '',
        amount: null,
        sale_tax_amount: null
      },

      updateForm: { // For bill image update
        id: null,
        date: "",
        companyId: "",
        image: null,
        imageUrl: "",
      },
      showUpdateModal: false, // For bill image update
      showDeleteAlert: false, // For bill image delete
    };
  },
  setup() {
    const route = useRoute();

    const companyId = computed(() => route.params.companyId);
    const companyName = ref("");
    const image = ref(null);
    const previewImage = ref(null);

    const detailedViewImage = ref(null);
    const showImageModal = ref(false);

    const showPopover = ref(false);
    const popoverEvent = ref(null);
    const selectedImage = ref(null);
    

    const fileInput = ref(null);
    const updateFileInput = ref(null);

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
    
    return {
      companyId,
      companyName,
      image,
      previewImage,
      fileInput,
      updateFileInput,
      detailedViewImage,
      showImageModal,
      openImageFullScreen,
      closeImageModal,
      showPopover,
      popoverEvent,
      showOptions,
      closePopover,
      ellipsisVertical,
      create,
      trash,
      onUpdateFileChange,
      onFileChange,
      removePreviewImage,
      selectedImage,
      cart,
      cash,
      cloudUpload,
      closeCircle,
      close,
      add,
      format,
      parseISO,
      eyeOutline,
      storefrontOutline,
      calendarNumberOutline,
      walletOutline,
      receiptOutline,
      timeOutline,
      pricetagOutline,
      pricetagsOutline
    };
  },
  computed: {
    ...mapState("bill", ["PurchaseList"]),
    ...mapState("company", ["CompanyList"]),
    ...mapState("purchase", ["PurchaseData"]),
    ...mapState("sales", ["SlaeList"]),
    ...mapGetters("categories", ["categories", "getCategoryById"]),
    ...mapGetters("subcategories", ["subcategories", "getSubcategoryById"]),
    // Assuming you have a taxTypes module similar to categories/subcategories
    // If not, you'd handle tax types directly in the component using a local array.
    // ...mapGetters("taxTypes", ["taxTypes", "getTaxTypeById"]),

    // Filter subcategories based on the selected category
    filteredSubcategories() {
      // Determine the category ID based on which modal is open
      const selectedCategoryId = this.showAddPurchaseModal
        ? this.addPurchaseForm.categoryId
        : this.showEditPurchaseDataModal
          ? this.editPurchaseForm.categoryId
          : null;

      if (!selectedCategoryId) {
        return []; // No category selected, so no subcategories to filter
      }
      return this.subcategories.filter(sub => sub.categoryId === selectedCategoryId);
    },

    formattedFromDateDisplay() {
      return this.selectedFromDateInternal ? format(this.selectedFromDateInternal, "MMMM d, yyyy") : '';
    },
    formattedToDateDisplay() {
      return this.selectedToDateInternal ? format(this.selectedToDateInternal, "MMMM d, yyyy") : '';
    },
    formattedDateRangeDisplay() {
      if (this.selectedFromDateInternal && this.selectedToDateInternal) {
        if (isSameDay(this.selectedFromDateInternal, this.selectedToDateInternal)) {
          return format(this.selectedFromDateInternal, "MMMM d, yyyy");
        }
        return `${format(this.selectedFromDateInternal, "MMM d, yyyy")} - ${format(this.selectedToDateInternal, "MMM d, yyyy")}`;
      } else if (this.selectedFromDateInternal) {
        return format(this.selectedFromDateInternal, "MMMM d, yyyy");
      } else if (this.selectedToDateInternal) {
        return format(this.selectedToDateInternal, "MMMM d, yyyy");
      }
      return '';
    },
    selectedCompany() {
      const company = this.CompanyList.find(
        (c) => c.id?.toString() === this.companyId?.toString()
      );
      return company ? company.name : `Company ${this.companyId}`;
    },

    filteredPurchaseData() {
      if (!this.PurchaseData || !this.PurchaseData.data) return [];

      const fromDate = this.selectedFromDateInternal ? startOfDay(this.selectedFromDateInternal) : null;
      const toDate = this.selectedToDateInternal ? endOfDay(this.selectedToDateInternal) : null;

      return this.PurchaseData.data.filter((purchase) => {
        if (!purchase.date) return false;
        const purchaseDate = parseISO(purchase.date);

        const matchesCompany = purchase.companyId?.toString() === this.companyId?.toString();
        
        let matchesDateRange = true;
        if (fromDate && toDate) {
          matchesDateRange = isWithinInterval(purchaseDate, { start: fromDate, end: toDate });
        } else if (fromDate) {
          matchesDateRange = isSameDay(purchaseDate, fromDate);
        } else if (toDate) {
          matchesDateRange = isSameDay(purchaseDate, toDate);
        }

        return matchesCompany && matchesDateRange;
      });
    },

    filteredSales() {
      if (!this.SlaeList || !this.SlaeList.data) {
        return [];
      }

      const fromDate = this.selectedFromDateInternal ? startOfDay(this.selectedFromDateInternal) : null;
      const toDate = this.selectedToDateInternal ? endOfDay(this.selectedToDateInternal) : null;

      return this.SlaeList.data.filter(item => {
        const matchesCompany = !this.companyId || (item.company && item.company.id?.toString() === this.companyId?.toString());
        const salesDate = parseISO(item.date);

        let matchesDateRange = true;
        if (fromDate && toDate) {
          matchesDateRange = isWithinInterval(salesDate, { start: fromDate, end: toDate });
        } else if (fromDate) {
          matchesDateRange = isSameDay(salesDate, fromDate);
        } else if (toDate) {
          matchesDateRange = isSameDay(salesDate, toDate);
        }

        const matchesSearch = this.searchQuery
          ? (item.company && item.company.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
            (item.amount && item.amount.toString().includes(this.searchQuery)) ||
            this.formatDate(item.date).includes(this.searchQuery)
          : true;
        return matchesCompany && matchesDateRange && matchesSearch;
      });
    },

    isDataLoaded() {
      return (
        this.PurchaseList && this.PurchaseList.data &&
        this.PurchaseData && this.PurchaseData.data &&
        this.SlaeList && this.SlaeList.data &&
        this.CompanyList && this.CompanyList.length > 0 &&
        this.categories && this.categories.length > 0 &&
        this.subcategories && this.subcategories.length > 0
      );
    },

    currentCompany() {
      return this.CompanyList.find(
        (company) => company.id?.toString() === this.companyId?.toString()
      );
    },
    currentPeriod() {
      if (!this.currentCompany || !this.currentCompany.ved || !this.selectedFromDateInternal) return null;
      const vedDate = startOfDay(parseISO(this.currentCompany.ved));
      const now = this.selectedFromDateInternal;
      const monthsSinceVed = Math.floor(
        (now.getTime() - vedDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );
      const periodNumber = Math.floor(monthsSinceVed / 3);
      const periodStart = addMonths(vedDate, periodNumber * 3);
      const periodEnd = endOfDay(addMonths(periodStart, 3));
      return { start: periodStart, end: periodEnd };
    },
    currentDate() {
      return this.selectedFromDateInternal;
    },
    currentMonth() {
      return {
        start: startOfMonth(this.currentDate),
        end: endOfMonth(this.currentDate)
      };
    },
    currentMonthFormatted() {
      return this.selectedFromDateInternal ? format(this.selectedFromDateInternal, "MMMM yyyy") : 'N/A';
    },

    dayPurchaseTax() {
      if (!this.PurchaseData || !this.PurchaseData.data || !this.selectedFromDateInternal) return 0;
      return this.PurchaseData.data
        .filter((purchase) => {
          const purchaseDate = parseISO(purchase.date);
          return (
            purchase.companyId?.toString() === this.companyId?.toString() &&
            isSameDay(purchaseDate, this.selectedFromDateInternal)
          );
        })
        .reduce((total, purchase) => total + (parseFloat(purchase.purchase_tax_amount) || 0), 0);
    },
    monthPurchaseTax() {
      if (!this.PurchaseData || !this.PurchaseData.data || !this.selectedFromDateInternal) return 0;
      return this.PurchaseData.data
        .filter((purchase) => {
          const purchaseDate = parseISO(purchase.date);
          return (
            purchase.companyId?.toString() === this.companyId?.toString() &&
            isSameMonth(purchaseDate, this.selectedFromDateInternal)
          );
        })
        .reduce((total, purchase) => total + (parseFloat(purchase.purchase_tax_amount) || 0), 0);
    },
    periodPurchaseTax() {
      if (!this.PurchaseData || !this.PurchaseData.data || !this.currentPeriod) return 0;
      return this.PurchaseData.data
        .filter((purchase) => {
          const purchaseDate = parseISO(purchase.date);
          return (
            purchase.companyId?.toString() === this.companyId?.toString() &&
            isWithinInterval(purchaseDate, this.currentPeriod)
          );
        })
        .reduce((total, purchase) => total + (parseFloat(purchase.purchase_tax_amount) || 0), 0);
    },

    daySalesTax() {
      if (!this.SlaeList || !this.SlaeList.data || !this.selectedFromDateInternal) return 0;
      return this.SlaeList.data
        .filter((sale) => {
          const saleDate = parseISO(sale.date);
          return (
            sale.companyId?.toString() === this.companyId?.toString() &&
            isSameDay(saleDate, this.selectedFromDateInternal)
          );
        })
        .reduce((total, sale) => {
          const taxAmount = parseFloat(sale.sale_tax_amount) || 0;
          return total + taxAmount;
        }, 0);
    },
    monthSalesTax() {
      if (!this.SlaeList || !this.SlaeList.data || !this.selectedFromDateInternal) return 0;
      return this.SlaeList.data
        .filter((sale) => {
          const saleDate = parseISO(sale.date);
          return (
            sale.companyId?.toString() === this.companyId?.toString() &&
            isSameMonth(saleDate, this.selectedFromDateInternal)
          );
        })
        .reduce((total, sale) => {
          const taxAmount = parseFloat(sale.sale_tax_amount) || 0;
          return total + taxAmount;
        }, 0);
    },
    periodSalesTax() {
      if (!this.SlaeList || !this.SlaeList.data || !this.currentPeriod) return 0;
      return this.SlaeList.data
        .filter((sale) => {
          const saleDate = parseISO(sale.date);
          return (
            sale.companyId?.toString() === this.companyId?.toString() &&
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
        case 'day': return this.dayPurchaseTax;
        case 'month': return this.monthPurchaseTax;
        case 'period': return this.periodPurchaseTax;
        default: return this.dayPurchaseTax;
      }
    },
    displaySalesTax() {
      switch (this.taxFilterType) {
        case 'day': return this.daySalesTax;
        case 'month': return this.monthSalesTax;
        case 'period': return this.periodSalesTax;
        default: return this.daySalesTax;
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

    totalPurchaseAmount() {
      if (!this.PurchaseData || !this.PurchaseData.data) return 0;
      let purchasesToSum = [];
      const fromDate = this.selectedFromDateInternal ? startOfDay(this.selectedFromDateInternal) : null;
      const toDate = this.selectedToDateInternal ? endOfDay(this.selectedToDateInternal) : null;

      switch (this.taxFilterType) {
        case 'day':
          purchasesToSum = this.PurchaseData.data.filter(purchase =>
            purchase.companyId?.toString() === this.companyId?.toString() &&
            isSameDay(parseISO(purchase.date), this.selectedFromDateInternal)
          );
          break;
        case 'month':
          purchasesToSum = this.PurchaseData.data.filter(purchase =>
            purchase.companyId?.toString() === this.companyId?.toString() &&
            isSameMonth(parseISO(purchase.date), this.selectedFromDateInternal)
          );
          break;
        case 'period':
          purchasesToSum = this.PurchaseData.data.filter(purchase =>
            purchase.companyId?.toString() === this.companyId?.toString() &&
            this.currentPeriod && isWithinInterval(parseISO(purchase.date), this.currentPeriod)
          );
          break;
        default:
          purchasesToSum = this.PurchaseData.data.filter(purchase => {
            const purchaseDate = parseISO(purchase.date);
            const matchesCompany = purchase.companyId?.toString() === this.companyId?.toString();
            let matchesDateRange = true;
            if (fromDate && toDate) {
              matchesDateRange = isWithinInterval(purchaseDate, { start: fromDate, end: toDate });
            } else if (fromDate) {
              matchesDateRange = isSameDay(purchaseDate, fromDate);
            } else if (toDate) {
              matchesDateRange = isSameDay(purchaseDate, toDate);
            }
            return matchesCompany && matchesDateRange;
          });
      }
      return purchasesToSum.reduce((total, purchase) => total + (parseFloat(purchase.amount) || 0), 0);
    },

    totalSalesAmount() {
      if (!this.SlaeList || !this.SlaeList.data) return 0;
      let salesToSum = [];
      const fromDate = this.selectedFromDateInternal ? startOfDay(this.selectedFromDateInternal) : null;
      const toDate = this.selectedToDateInternal ? endOfDay(this.selectedToDateInternal) : null;

      switch (this.taxFilterType) {
        case 'day':
          salesToSum = this.SlaeList.data.filter(sale =>
            sale.companyId?.toString() === this.companyId?.toString() &&
            isSameDay(parseISO(sale.date), this.selectedFromDateInternal)
          );
          break;
        case 'month':
          salesToSum = this.SlaeList.data.filter(sale =>
            sale.companyId?.toString() === this.companyId?.toString() &&
            isSameMonth(parseISO(sale.date), this.selectedFromDateInternal)
          );
          break;
        case 'period':
          salesToSum = this.SlaeList.data.filter(sale =>
            sale.companyId?.toString() === this.companyId?.toString() &&
            this.currentPeriod && isWithinInterval(parseISO(sale.date), this.currentPeriod)
          );
          break;
        default:
          salesToSum = this.SlaeList.data.filter(sale => {
            const salesDate = parseISO(sale.date);
            const matchesCompany = sale.companyId?.toString() === this.companyId?.toString();
            let matchesDateRange = true;
            if (fromDate && toDate) {
              matchesDateRange = isWithinInterval(salesDate, { start: fromDate, end: toDate });
            } else if (fromDate) {
              matchesDateRange = isSameDay(salesDate, fromDate);
            } else if (toDate) {
              matchesDateRange = isSameDay(salesDate, toDate);
            }
            return matchesCompany && matchesDateRange;
          });
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
            case 'day': return this.formattedFromDateDisplay;
            case 'month': return this.currentMonthFormatted;
            case 'period': return this.formattedPeriod;
            default: return this.formattedFromDateDisplay;
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
    ...mapActions("sales", ["GET_SALE_LIST", "CREATE_SALES", "UPDATE_SALES", "DELETE_SALES"]),
    ...mapActions("categories", ["GET_CATEGORY_LIST", "CREATE_CATEGORY", "UPDATE_CATEGORY", "DELETE_CATEGORY"]),
    ...mapActions("subcategories", ["GET_SUBCATEGORY_LIST", "CREATE_SUBCATEGORY", "UPDATE_SUBCATEGORY", "DELETE_SUBCATEGORY"]),
    // ...mapActions("taxTypes", ["GET_TAX_TYPE_LIST", "CREATE_TAX_TYPE", "UPDATE_TAX_TYPE", "DELETE_TAX_TYPE"]),

    handleFabClick() {
      if (this.selectedSegment === 'purchase') {
        this.openAddPurchaseModal();
      } else if (this.selectedSegment === 'sales') {
        this.openAddSaleModal();
      }
    },

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
        (c) => c.id?.toString() === this.companyId?.toString()
      );
      this.companyName = company ? company.name : `Company ${this.companyId}`;
    },
    getCompanyName(companyId) {
      const company = this.CompanyList.find(
        (c) => c.id?.toString() === companyId?.toString()
      );
      return company ? company.name : `Company ${companyId}`;
    },
    getCategoryName(categoryId) {
      const category = this.getCategoryById(categoryId);
      return category ? category.cat_name : 'N/A';
    },
    getSubcategoryName(subcategoryId) {
      const subcategory = this.getSubcategoryById(subcategoryId);
      return subcategory ? subcategory.sub_name : 'N/A';
    },
    getTaxTypeName(taxTypeId) {
      // If you have a taxTypes module:
      // const taxType = this.getTaxTypeById(taxTypeId);
      // return taxType ? taxType.type_name : 'N/A';
      // Otherwise, map IDs to names directly if using fixed values
      switch(taxTypeId) {
        case 1: return 'Inclusive';
        case 2: return 'Exclusive';
        case 3: return 'Zero Tax';
        default: return 'N/A';
      }
    },

    onFromDateChange(event) {
      if (event.detail.value) {
        this.selectedFromDateInternal = parseISO(event.detail.value);
        if (!this.selectedToDateInternal || this.selectedToDateInternal < this.selectedFromDateInternal) {
          this.selectedToDateInternal = this.selectedFromDateInternal;
        }
        const popover = document.querySelector('#from-date-picker + ion-popover');
        if (popover) {
          popover.dismiss();
        }
        this.loadAllData();
      }
    },
    onToDateChange(event) {
      if (event.detail.value) {
        this.selectedToDateInternal = parseISO(event.detail.value);
        if (this.selectedFromDateInternal && this.selectedToDateInternal < this.selectedFromDateInternal) {
          this.selectedFromDateInternal = this.selectedToDateInternal;
        }
        const popover = document.querySelector('#to-date-picker + ion-popover');
        if (popover) {
          popover.dismiss();
        }
        this.loadAllData();
      }
    },

    async loadAllData() {
      try {
        await Promise.all([
          this.GET_PURCHASE_LIST(),
          this.GET_SALE_LIST(),
          this.GET_PURCHASE_LISTS(),
          this.GET_CATEGORY_LIST(),
          this.GET_SUBCATEGORY_LIST(),
          this.GET_COMPANY_LIST(),
          // this.GET_TAX_TYPE_LIST(), // Uncomment if you implement taxTypes module
        ]);
      } catch (error) {
        console.error("Failed to load data:", error);
        this.presentToast('Failed to load data. Please try again.', 'danger');
      }
    },
    
    // Calculates tax for the Add Purchase form
    calculatePurchaseTax() {
      const amount = parseFloat(this.addPurchaseForm.amount);
      if (isNaN(amount) || amount < 0) {
        this.calculatedPurchaseTax = 0;
        return;
      }
      
      let taxAmount = 0;
      if (this.addPurchaseForm.taxType === 'exclusive') {
        taxAmount = amount * (this.vatRate / 100);
      } else if (this.addPurchaseForm.taxType === 'inclusive') {
        // If amount is inclusive, calculate the tax component
        // Total = Base + Tax (Base * VAT_Rate) => Total = Base * (1 + VAT_Rate)
        // Base = Total / (1 + VAT_Rate)
        // Tax = Total - Base = Total - (Total / (1 + VAT_Rate))
        taxAmount = amount - (amount / (1 + (this.vatRate / 100)));
      }
      // If zero_tax, taxAmount remains 0
      this.calculatedPurchaseTax = taxAmount.toFixed(2);
    },

    // Calculates tax for the Edit Purchase form
    calculatePurchaseTaxEdit() {
      const amount = parseFloat(this.editPurchaseForm.amount);
      if (isNaN(amount) || amount < 0) {
        this.calculatedPurchaseTaxEdit = 0;
        return;
      }

      let taxAmount = 0;
      if (this.editPurchaseForm.taxType === 'exclusive') {
        taxAmount = amount * (this.vatRate / 100);
      } else if (this.editPurchaseForm.taxType === 'inclusive') {
        taxAmount = amount - (amount / (1 + (this.vatRate / 100)));
      }
      this.calculatedPurchaseTaxEdit = taxAmount.toFixed(2);
    },

    async submitAddPurchaseForm() {
      try {
        // Explicitly check for null/empty values for required fields
        if (
          !this.addPurchaseForm.amount ||
          isNaN(parseFloat(this.addPurchaseForm.amount)) ||
          parseFloat(this.addPurchaseForm.amount) < 0 ||
          this.addPurchaseForm.categoryId === null || // Ensure categoryId is selected
          this.addPurchaseForm.taxType === null // Ensure taxType is selected
        ) {
          throw new Error("Amount, category, and tax type are required and must be valid.");
        }
        
        const amount = parseFloat(this.addPurchaseForm.amount);
        const purchaseTaxAmount = parseFloat(this.calculatedPurchaseTax);

        const purchasePayload = {
          date: format(this.selectedFromDateInternal, "yyyy-MM-dd"),
          companyId: parseInt(this.companyId),
          amount: amount,
          purchase_tax_amount: purchaseTaxAmount,
          // expense_type: this.addPurchaseForm.expense_type, // Removed
          categoryId: parseInt(this.addPurchaseForm.categoryId),
          subcategoryId: this.addPurchaseForm.subcategoryId ? parseInt(this.addPurchaseForm.subcategoryId) : null,
          taxTypeId: this.getTaxTypeId(this.addPurchaseForm.taxType), // Convert string to ID
          status: parseInt(this.addPurchaseForm.status),
        };

        // --- Console log for purchasePayload ---
        console.log("Purchase Payload being sent:", purchasePayload);

        await this.CREATE_PURCHASE(purchasePayload);

        if (this.image) {
          const billPayload = {
            date: format(this.selectedFromDateInternal, "yyyy-MM-dd"),
            companyId: parseInt(this.companyId),
            image: [this.image],
          };
          // --- Console log for billPayload ---
          console.log("Bill Payload being sent:", billPayload);
          await this.ADD_BILL(billPayload);
        }

        this.closeAddPurchaseModal();
        await this.loadAllData();
        this.presentToast('Purchase and bill added successfully!', 'success');
      } catch (error) {
        console.error("Error adding purchase and bill:", error);
        this.presentToast('Failed to add purchase and bill: ' + error.message, 'danger');
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

        if (this.image && this.previewImage !== this.updateForm.imageUrl) {
            payload.image = [this.image];
        } else {
            payload.image = [];
        }

        await this.UPDATE_BILL(payload);
        this.closeUpdateModal();
        await this.loadAllData();
        this.presentToast('Bill image updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating bill:", error);
        this.presentToast('Failed to update bill image: ' + error.message, 'danger');
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
        await this.loadAllData();
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
      if (this.updateFileInput) this.updateFileInput.value = "";
    },
    editPurchaseData(purchase) {
      const formattedDate = format(parseISO(purchase.date), "yyyy-MM-dd");
      this.editPurchaseForm = {
        id: purchase.id,
        // expense_type: purchase.expense_type || "", // Removed
        date: formattedDate,
        companyId: purchase.companyId,
        amount: purchase.amount.toString(),
        purchase_tax_amount: purchase.purchase_tax_amount.toString(),
        categoryId: purchase.categoryId || null,
        subcategoryId: purchase.subcategoryId || null,
        taxType: this.getTaxTypeString(purchase.taxTypeId) || "exclusive", // Convert ID to string
        status: purchase.status ? purchase.status.toString() : "1",
      }; // Corrected: Removed the extra ')' here
      this.calculatePurchaseTaxEdit(); // Recalculate based on fetched data
      this.showEditPurchaseDataModal = true;
      this.closeDetailedPurchaseView();
      this.closePurchasePopover();
    },
    closeEditPurchaseDataModal() {
      this.showEditPurchaseDataModal = false;
      this.editPurchaseForm = {
        id: null,
        // expense_type: "", // Removed
        date: "",
        companyId: "",
        amount: "",
        purchase_tax_amount: "",
        categoryId: null,
        subcategoryId: null,
        taxType: "exclusive",
        status: "1",
      };
      this.calculatedPurchaseTaxEdit = 0;
    },
    async submitEditPurchaseDataForm() {
      try {
        if (
          !this.editPurchaseForm.amount ||
          isNaN(parseFloat(this.editPurchaseForm.amount)) ||
          parseFloat(this.editPurchaseForm.amount) < 0 ||
          !this.editPurchaseForm.id ||
          this.editPurchaseForm.categoryId === null ||
          this.editPurchaseForm.taxType === null
        ) {
          throw new Error("Missing required fields for purchase update and must be valid.");
        }
        if (!this.editPurchaseForm.status || !["0", "1"].includes(this.editPurchaseForm.status)) {
          this.editPurchaseForm.status = "1";
        }

        const purchaseData = {
          date: this.editPurchaseForm.date,
          companyId: parseInt(this.editPurchaseForm.companyId),
          amount: parseFloat(this.editPurchaseForm.amount),
          purchase_tax_amount: parseFloat(this.calculatedPurchaseTaxEdit),
          // expense_type: this.editPurchaseForm.expense_type, // Removed
          categoryId: parseInt(this.editPurchaseForm.categoryId),
          subcategoryId: this.editPurchaseForm.subcategoryId ? parseInt(this.editPurchaseForm.subcategoryId) : null,
          taxTypeId: this.getTaxTypeId(this.editPurchaseForm.taxType),
          status: parseInt(this.editPurchaseForm.status),
        };

        await this.UPDATE_PURCHASE({
          id: parseInt(this.editPurchaseForm.id),
          purchaseData,
        });
        this.closeEditPurchaseDataModal();
        await this.loadAllData();
        this.presentToast('Purchase data updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating purchase data:", error);
        this.presentToast('Failed to update purchase data: ' + error.message, 'danger');
      }
    },
    deletePurchaseData(id) {
      this.purchaseDataToDeleteId = id;
      this.showDeletePurchaseDataAlert = true;
      this.closePurchasePopover();
    },
    async confirmDeletePurchaseData() {
      try {
        await this.DELETE_PURCHASE(this.purchaseDataToDeleteId);
        this.showDeletePurchaseDataAlert = false;
        await this.loadAllData();
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
        image: null,
        imageUrl: this.selectedImage.image,
      };
      this.previewImage = this.selectedImage.image;
      this.showUpdateModal = true;
      this.closePopover();
    },

    openDetailedPurchaseView(purchase) {
      this.selectedPurchaseForDetail = purchase;
      const purchaseDate = format(parseISO(purchase.date), "yyyy-MM-dd");
      this.imagesForDetailedPurchase = this.PurchaseList.data.filter((bill) => {
        const billDate = format(parseISO(bill.date), "yyyy-MM-dd");
        return (
          bill.companyId?.toString() === purchase.companyId?.toString() &&
          billDate === purchaseDate
        );
      });
      this.showDetailedPurchaseModal = true;
      this.closePurchasePopover();
    },
    closeDetailedPurchaseView() {
      this.showDetailedPurchaseModal = false;
      this.selectedPurchaseForDetail = null;
      this.imagesForDetailedPurchase = [];
    },
    togglePurchaseDetails(purchaseId) {
      if (this.expandedPurchaseId === purchaseId) {
        this.expandedPurchaseId = null;
      } else {
        this.expandedPurchaseId = purchaseId;
      }
    },
    openPurchasePopover(event, purchase) {
      this.selectedPurchase = purchase;
      this.purchasePopoverEvent = event;
      this.showPurchasePopover = true;
    },
    closePurchasePopover() {
      this.showPurchasePopover = false;
      this.selectedPurchase = null;
      this.purchasePopoverEvent = null;
    },
    openAddPurchaseModal() {
      this.addPurchaseForm = {
        // expense_type: "", // Removed
        date: format(this.selectedFromDateInternal, "yyyy-MM-dd"),
        companyId: parseInt(this.companyId),
        amount: "",
        purchase_tax_amount: 0,
        categoryId: null, // Initialize as null
        subcategoryId: null, // Initialize as null
        taxType: "exclusive", // Default
        status: "1",
      };
      this.calculatedPurchaseTax = 0;
      this.handleReset();
      this.showAddPurchaseModal = true;
    },
    closeAddPurchaseModal() {
      this.showAddPurchaseModal = false;
      this.handleReset();
    },

    // Sales-specific methods
    openSalePopover(e, item) {
      this.salePopoverEvent = e;
      this.selectedSaleItem = { ...item, companyId: item.company.id };
      this.showSalePopover = true;
    },
    closeSalePopover() {
      this.showSalePopover = false;
    },
    openUpdateSaleModal() {
      this.closeSalePopover();
      this.selectedSaleItem.date = this.formatDateForInput(this.selectedSaleItem.date);
      this.showUpdateSaleModal = true;
    },
    updateSaleTaxAmount() {
      if (this.selectedSaleItem.amount) {
        this.selectedSaleItem.sale_tax_amount = Number((parseFloat(this.selectedSaleItem.amount) * (this.vatRate / 100)).toFixed(2));
      } else {
        this.selectedSaleItem.sale_tax_amount = null;
      }
    },
    openAddSaleModal() {
      this.newSale = {
        date: format(this.selectedFromDateInternal, "yyyy-MM-dd"),
        companyId: parseInt(this.companyId),
        amount: null,
        sale_tax_amount: null
      };
      this.showAddSaleModal = true;
    },
    updateNewSaleTaxAmount() {
      if (this.newSale.amount) {
        this.newSale.sale_tax_amount = Number((parseFloat(this.newSale.amount) * (this.vatRate / 100)).toFixed(2));
      } else {
        this.newSale.sale_tax_amount = null;
      }
    },
    formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    },
    confirmDeleteSale() {
      this.showSalePopover = false;
      this.showDeleteSaleAlert = true;
    },
    async submitAddSaleForm() {
      try {
        if (this.newSale.amount === null || this.newSale.amount === '' || isNaN(parseFloat(this.newSale.amount))) {
          throw new Error("Amount is required and must be a number.");
        }
        if (this.newSale.companyId === null || this.newSale.companyId === '' || isNaN(parseInt(this.newSale.companyId))) {
            throw new Error("Company must be selected.");
        }

        const payload = {
          date: this.newSale.date,
          companyId: parseInt(this.newSale.companyId),
          amount: Number(this.newSale.amount),
          sale_tax_amount: Number((parseFloat(this.newSale.amount) * (this.vatRate / 100)).toFixed(2))
        };
        await this.CREATE_SALES(payload);
        this.showAddSaleModal = false;
        await this.loadAllData();
        this.presentToast('Sale added successfully!', 'success');
      } catch (error) {
        console.error('Error adding sale:', error);
        this.presentToast('Failed to add sale: ' + error.message, 'danger');
      }
    },
    async updateSale() {
      try {
        if (!this.selectedSaleItem.id || !this.selectedSaleItem.date || !this.selectedSaleItem.companyId ||
            this.selectedSaleItem.amount === null || this.selectedSaleItem.amount === '' || isNaN(parseFloat(this.selectedSaleItem.amount))) {
          throw new Error("Missing required fields for sale update.");
        }

        const payload = {
            id: this.selectedSaleItem.id,
            date: this.selectedSaleItem.date,
            companyId: parseInt(this.selectedSaleItem.companyId),
            amount: Number(this.selectedSaleItem.amount),
            sale_tax_amount: Number((parseFloat(this.selectedSaleItem.amount) * (this.vatRate / 100)).toFixed(2))
        };

        await this.UPDATE_SALES(payload);
        this.showUpdateSaleModal = false;
        await this.loadAllData();
        this.presentToast('Sale updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating sale:', error);
        this.presentToast('Failed to update sale: ' + error.message, 'danger');
      }
    },
    async deleteSale() {
      try {
        if (!this.selectedSaleItem.id) {
            throw new Error("Sale ID is missing for deletion.");
        }
        await this.DELETE_SALES(this.selectedSaleItem.id);
        this.showDeleteSaleAlert = false;
        await this.loadAllData();
        this.presentToast('Sale deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting sale:', error);
        this.presentToast('Failed to delete sale.', 'danger');
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'yyyy-MM-dd');
    },

    // Category Methods
    openAddCategoryModal() {
      this.addCategoryForm.cat_name = "";
      this.showAddCategoryModal = true;
    },
    closeAddCategoryModal() {
      this.showAddCategoryModal = false;
    },
    async submitAddCategoryForm() {
      try {
        if (!this.addCategoryForm.cat_name.trim()) {
          throw new Error("Category name is required");
        }
        const categoryData = {
          cat_name: this.addCategoryForm.cat_name.trim(),
        };
        const response = await this.CREATE_CATEGORY(categoryData);
        await this.GET_CATEGORY_LIST();
        if (response && response.data && response.data.id) {
          // If response.data.id is available
          this.addPurchaseForm.categoryId = response.data.id;
        } else if (response && response.data && response.data.data && response.data.data.id) {
          // If response.data.data.id is available (for nested response)
          this.addPurchaseForm.categoryId = response.data.data.id;
        }
        this.closeAddCategoryModal();
        this.presentToast('Category created successfully!', 'success');
      } catch (error) {
        console.error("Error creating category:", error);
        this.presentToast('Failed to create category: ' + error.message, 'danger');
      }
    },
    openEditCategoryModal() {
      // Use the categoryId from the add/edit purchase form's current selection
      const categoryIdToEdit = this.showAddPurchaseModal
                                    ? this.addPurchaseForm.categoryId
                                    : this.editPurchaseForm.categoryId;

      if (!categoryIdToEdit) {
        this.presentToast('Please select a category to edit.', 'warning');
        return;
      }
      const category = this.getCategoryById(categoryIdToEdit);
      if (category) {
        this.editCategoryForm = { ...category };
        this.showEditCategoryModal = true;
      } else {
        this.presentToast('Selected category not found. Please refresh and try again.', 'danger');
      }
    },
    closeEditCategoryModal() {
      this.showEditCategoryModal = false;
      this.editCategoryForm = { id: null, cat_name: "" };
    },
    async submitEditCategoryForm() {
      try {
        if (!this.editCategoryForm.id || !this.editCategoryForm.cat_name.trim()) {
          throw new Error("Category ID and name are required");
        }
        const payload = {
          id: this.editCategoryForm.id,
          categoryData: { cat_name: this.editCategoryForm.cat_name.trim() }
        };
        await this.UPDATE_CATEGORY(payload);
        await this.GET_CATEGORY_LIST();
        this.closeEditCategoryModal();
        this.presentToast('Category updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating category:", error);
        this.presentToast('Failed to update category: ' + error.message, 'danger');
      }
    },
    confirmDeleteCategory() {
       const categoryIdToDelete = this.showAddPurchaseModal
                                   ? this.addPurchaseForm.categoryId
                                   : this.editPurchaseForm.categoryId;

      if (!categoryIdToDelete) {
        this.presentToast('Please select a category to delete.', 'warning');
        return;
      }
      this.categoryToDeleteId = categoryIdToDelete;
      this.showDeleteCategoryAlert = true;
    },
    async deleteCategory() {
      try {
        await this.DELETE_CATEGORY(this.categoryToDeleteId);
        this.showDeleteCategoryAlert = false;
        await this.loadAllData();
        // Clear selected category in forms if it was deleted
        if (this.addPurchaseForm.categoryId === this.categoryToDeleteId) {
          this.addPurchaseForm.categoryId = null;
          this.addPurchaseForm.subcategoryId = null;
        }
        if (this.editPurchaseForm.categoryId === this.categoryToDeleteId) {
          this.editPurchaseForm.categoryId = null;
          this.editPurchaseForm.subcategoryId = null;
        }
        this.presentToast('Category deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting category:", error);
        this.presentToast('Failed to delete category.', 'danger');
      }
    },

    // Subcategory Methods
    openAddSubcategoryModal() {
      // Determine the category ID based on which purchase modal is open
      let selectedCategoryId = null;
      if (this.showAddPurchaseModal) {
        selectedCategoryId = this.addPurchaseForm.categoryId;
      } else if (this.showEditPurchaseDataModal) {
        selectedCategoryId = this.editPurchaseForm.categoryId;
      }

      // Set the categoryId for the addSubcategoryForm
      this.addSubcategoryForm.categoryId = selectedCategoryId;
      this.addSubcategoryForm.sub_name = "";
      this.showAddSubcategoryModal = true;
    },
    closeAddSubcategoryModal() {
      this.showAddSubcategoryModal = false;
    },
    async submitAddSubcategoryForm() {
      try {
        if (!this.addSubcategoryForm.categoryId || !this.addSubcategoryForm.sub_name.trim()) {
          throw new Error("Parent category and subcategory name are required");
        }
        const subcategoryData = {
          categoryId: parseInt(this.addSubcategoryForm.categoryId),
          sub_name: this.addSubcategoryForm.sub_name.trim(),
        };
        const response = await this.CREATE_SUBCATEGORY(subcategoryData);
        await this.GET_SUBCATEGORY_LIST();
          if (response && response.data && response.data.id) {
            this.addPurchaseForm.subcategoryId = response.data.id;
          } else if (response && response.data && response.data.data && response.data.data.id) {
            this.addPurchaseForm.subcategoryId = response.data.data.id;
          }
        this.closeAddSubcategoryModal();
        this.presentToast('Subcategory created successfully!', 'success');
      } catch (error) {
        console.error("Error creating subcategory:", error);
        this.presentToast('Failed to create subcategory: ' + error.message, 'danger');
      }
    },
    openEditSubcategoryModal() {
      const subcategoryIdToEdit = this.showAddPurchaseModal
                                     ? this.addPurchaseForm.subcategoryId
                                     : this.editPurchaseForm.subcategoryId;

      if (!subcategoryIdToEdit) {
        this.presentToast('Please select a subcategory to edit.', 'warning');
        return;
      }
      const subcategory = this.getSubcategoryById(subcategoryIdToEdit);
      if (subcategory) {
        this.editSubcategoryForm = { ...subcategory };
        this.showEditSubcategoryModal = true;
      } else {
        this.presentToast('Selected subcategory not found. Please refresh and try again.', 'danger');
      }
    },
    closeEditSubcategoryModal() {
      this.showEditSubcategoryModal = false;
      this.editSubcategoryForm = { id: null, categoryId: null, sub_name: "" };
    },
    async submitEditSubcategoryForm() {
      try {
        if (!this.editSubcategoryForm.id || !this.editSubcategoryForm.categoryId || !this.editSubcategoryForm.sub_name.trim()) {
          throw new Error("Subcategory ID, parent category, and name are required");
        }
        const payload = {
          id: this.editSubcategoryForm.id,
          subcategoryData: { 
            categoryId: parseInt(this.editSubcategoryForm.categoryId),
            sub_name: this.editSubcategoryForm.sub_name.trim()  
          }
        };
        await this.UPDATE_SUBCATEGORY(payload);
        await this.GET_SUBCATEGORY_LIST();
        this.closeEditSubcategoryModal();
        this.presentToast('Subcategory updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating subcategory:", error);
        this.presentToast('Failed to update subcategory: ' + error.message, 'danger');
      }
    },
    confirmDeleteSubcategory() {
      const subcategoryIdToDelete = this.showAddPurchaseModal
                                       ? this.addPurchaseForm.subcategoryId
                                       : this.editPurchaseForm.subcategoryId;
      if (!subcategoryIdToDelete) {
        this.presentToast('Please select a subcategory to delete.', 'warning');
        return;
      }
      this.subcategoryToDeleteId = subcategoryIdToDelete;
      this.showDeleteSubcategoryAlert = true;
    },
    async deleteSubcategory() {
      try {
        await this.DELETE_SUBCATEGORY(this.subcategoryToDeleteId);
        this.showDeleteSubcategoryAlert = false;
        await this.loadAllData();
        // Clear selected subcategory in forms if it was deleted
        if (this.addPurchaseForm.subcategoryId === this.subcategoryToDeleteId) {
          this.addPurchaseForm.subcategoryId = null;
        }
        if (this.editPurchaseForm.subcategoryId === this.subcategoryToDeleteId) {
          this.editPurchaseForm.subcategoryId = null;
        }
        this.presentToast('Subcategory deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        this.presentToast('Failed to delete subcategory.', 'danger');
      }
    },
    // Maps taxType string to a numerical ID for backend
    getTaxTypeId(taxTypeString) {
      switch(taxTypeString) {
        case 'inclusive': return 1;
        case 'exclusive': return 2;
        case 'zero_tax': return 3;
        default: return null;
      }
    },
    // Maps numerical taxTypeId from backend to a string for UI
    getTaxTypeString(taxTypeId) {
      switch(taxTypeId) {
        case 1: return 'inclusive';
        case 2: return 'exclusive';
        case 3: return 'zero_tax';
        default: return null;
      }
    }
  },
  watch: {
    'companyId': {
        immediate: true,
        handler() {
            this.fetchCompanyName();
            this.loadAllData();
        }
    },
    selectedFromDateInternal: {
      handler(newDate, oldDate) {
        if (newDate && (!oldDate || newDate.toISOString().split('T')[0] !== oldDate.toISOString().split('T')[0])) {
          this.loadAllData();
        }
      }
    },
    selectedToDateInternal: {
      handler(newDate, oldDate) {
        if (newDate && (!oldDate || newDate.toISOString().split('T')[0] !== oldDate.toISOString().split('T')[0])) {
          this.loadAllData();
        }
      }
    },
    'addPurchaseForm.categoryId': {
      handler() {
        this.addPurchaseForm.subcategoryId = null; // Clear subcategory when category changes
      }
    },
    'editPurchaseForm.categoryId': {
      handler() {
        // Only clear if the previous subcategory is not valid for the new category
        const currentSubcategory = this.editPurchaseForm.subcategoryId;
        if (currentSubcategory) {
          const sub = this.getSubcategoryById(currentSubcategory);
          if (!sub || sub.categoryId !== this.editPurchaseForm.categoryId) {
            this.editPurchaseForm.subcategoryId = null;
          }
        }
      }
    },
    'addPurchaseForm.amount': 'calculatePurchaseTax',
    'addPurchaseForm.taxType': 'calculatePurchaseTax',
    'editPurchaseForm.amount': 'calculatePurchaseTaxEdit',
    'editPurchaseForm.taxType': 'calculatePurchaseTaxEdit',
  },
  mounted() {
    const today = new Date();
    this.selectedFromDateInternal = today;
    this.selectedToDateInternal = today;

    this.loadAllData();
    this.handleReset();
  }
});
</script>







<style scoped>
/* Add your existing styles here */
.select-with-actions {
  display: flex;
  align-items: center;
  width: 100%;
}

.select-with-actions ion-select {
  flex-grow: 1;
  margin-right: 8px; /* Space between select and buttons */
}

.select-with-actions .action-button {
  --padding-start: 4px;
  --padding-end: 4px;
  --min-width: 32px;
  height: 32px;
}

/* Optional: Styles for radio buttons if needed */
ion-list-header {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: bold;
}
</style>

<style scoped>
/* Add your existing styles here */
.select-with-actions {
  display: flex;
  align-items: center;
  width: 100%;
}

.select-with-actions ion-select {
  flex-grow: 1;
  margin-right: 8px; /* Space between select and buttons */
}

.select-with-actions .action-button {
  --padding-start: 4px;
  --padding-end: 4px;
  --min-width: 32px;
  height: 32px;
}

/* Optional: Styles for radio buttons if needed */
ion-list-header {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: bold;
}
</style>
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
  z-index: 10;
  --color: #ffffff;
  --ripple-color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  --padding-start: 0;
  --padding-end: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
}
.dots-menu ion-icon {
  margin-right: 0;
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
</style>