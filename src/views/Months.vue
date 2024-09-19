<!-- <template>
  <ion-page>
    <Header />
    <ion-content class="ion-padding">
      <div class="month-grid">
        <ion-card class="month-card" v-for="(month, index) in monthData" :key="index" @click="goToDaysPage(index)"
          :style="{
          backgroundColor: isMonthFullyBilled(index) ? 'green' : '#f3f7fa'
        }" :class="{ 'green-background': isMonthFullyBilled(index) }">
          <ion-card-header>
            <ion-card-title>
              <span class="material-icons month-icon">{{ month.icon }}</span>
              <span class="month-name">{{ month.name }}</span>
            </ion-card-title>
          </ion-card-header>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/vue';
import Header from '../components/Header.vue';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
  name: 'MonthList',
  components: {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, Header,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentYear = new Date().getFullYear();
    const companyId = route.params.companyId;

    // Remove 'companyId:' if present
    const formattedCompanyId = companyId && companyId.startsWith('companyId:') ? companyId.split(':')[1] : companyId;

    const goToDaysPage = (index) => {
      router.push({ name: 'DaysView', params: { companyId: formattedCompanyId, month: index, year: currentYear } });
    };

    return {
      currentYear,
      goToDaysPage,
      formattedCompanyId
    };
  },
  computed: {
    ...mapState('months', ['MonthList']),
    ...mapState('bill', ['PurchaseList']),
    ...mapState('vat',['VATList']),

    isMonthFullyBilled() {
      return (monthIndex) => {
        const daysInMonth = new Date(this.currentYear, monthIndex + 1, 0).getDate();
        let billedDays = [];

        // Check if the PurchaseList is available and has data
        if (this.PurchaseList && this.PurchaseList.data) {
          this.PurchaseList.data.forEach(purchase => {
            const purchaseDate = new Date(purchase.date);
            const purchaseMonth = purchaseDate.getMonth(); // 0-based index for months (0 = January)
            const purchaseYear = purchaseDate.getFullYear();

            // If the purchase date matches the current month and year, add the day to billedDays
            if (purchaseMonth === monthIndex && purchaseYear === this.currentYear) {
              const day = purchaseDate.getDate(); // Get day of the month (1-31)
              if (!billedDays.includes(day)) {
                billedDays.push(day); // Ensure no duplicates
              }
            }
          });
        }

        // Check if the number of billed days matches the total days in the month
        return billedDays.length === daysInMonth;
      };
    },

    // Create an array of month data with icons
    monthData() {
      return [
        { name: 'January', icon: 'ac_unit' },
        { name: 'February', icon: 'favorite' },
        { name: 'March', icon: 'wb_sunny' },
        { name: 'April', icon: 'cloud' },
        { name: 'May', icon: 'local_florist' },
        { name: 'June', icon: 'beach_access' },
        { name: 'July', icon: 'wb_sunny' },
        { name: 'August', icon: 'local_fire_department' },
        { name: 'September', icon: 'school' },
        { name: 'October', icon: 'local_cafe' },
        { name: 'November', icon: 'terrain' },
        { name: 'December', icon: 'ac_unit' },
      ];
    }
  },
  methods: {
    ...mapActions('months', ['GET_MONTH_LIST']),
    ...mapActions('bill', ['GET_PURCHASE_LIST']),
    ...mapActions('vat', ['GET_VAT_LIST'])
  },
  mounted() {
    this.GET_MONTH_LIST();
    this.GET_PURCHASE_LIST();
    this.GET_VAT_LIST();
  },
});
</script>

<style scoped>
.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.month-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 98px;
  width: 82%;
  padding: 0.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.month-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.month-icon {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

ion-card-title {
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.month-name {
  font-size: 0.9rem;
}
.green-background ion-card-title,
.green-background .month-icon,
.green-background .month-name {
  color: white !important;
}
</style> -->

<template>
  <ion-page>
    <Header />
    <ion-content class="ion-padding">
      <div class="month-grid">
        <ion-card 
          v-for="(month, index) in monthData" 
          :key="index" 
          @click="goToDaysPage(index)"
          :style="{
            backgroundColor: isMonthGreen(index) ? 'green' : '#f3f7fa'
          }" 
          :class="{ 'green-background': isMonthGreen(index) }"
          class="month-card"
        >
          <ion-card-header>
            <ion-card-title>
              <span class="material-icons month-icon">{{ month.icon }}</span>
              <span class="month-name">{{ month.name }}</span>
            </ion-card-title>
          </ion-card-header>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>
<script>
import { defineComponent, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/vue';
import Header from '../components/Header.vue';
import { useStore } from 'vuex';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
  name: 'MonthList',
  components: {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, Header,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const currentYear = new Date().getFullYear();
    const companyId = Number(route.params.companyId);

    const goToDaysPage = (index) => {
      router.push({ name: 'DaysView', params: { companyId, month: index, year: currentYear } });
    };

    const vatList = computed(() => store.state.vat.VATList?.data || []);

    const filteredVatList = computed(() => 
      vatList.value.filter(vat => vat.companyId === companyId)
    );

    const lastVatDate = computed(() => {
      if (filteredVatList.value.length === 0) return null;
      return new Date(Math.max(...filteredVatList.value.map(vat => new Date(vat.createdAt))));
    });

    const greenMonths = computed(() => {
      if (!lastVatDate.value) return [];
      const lastMonth = lastVatDate.value.getMonth();
      return [
        (lastMonth - 3 + 12) % 12,
        (lastMonth - 2 + 12) % 12,
        (lastMonth - 1 + 12) % 12
      ];
    });

    const isMonthGreen = (monthIndex) => greenMonths.value.includes(monthIndex);

    const monthData = [
      { name: 'January', icon: 'ac_unit' },
      { name: 'February', icon: 'favorite' },
      { name: 'March', icon: 'wb_sunny' },
      { name: 'April', icon: 'cloud' },
      { name: 'May', icon: 'local_florist' },
      { name: 'June', icon: 'beach_access' },
      { name: 'July', icon: 'wb_sunny' },
      { name: 'August', icon: 'local_fire_department' },
      { name: 'September', icon: 'school' },
      { name: 'October', icon: 'local_cafe' },
      { name: 'November', icon: 'terrain' },
      { name: 'December', icon: 'ac_unit' },
    ];

    return {
      currentYear,
      goToDaysPage,
      companyId,
      monthData,
      isMonthGreen,
    };
  },
  computed: {
    ...mapState('months', ['MonthList']),
    ...mapState('bill', ['PurchaseList']),
    ...mapState('vat',['VATList']),
  },
  methods: {
    ...mapActions('months', ['GET_MONTH_LIST']),
    ...mapActions('bill', ['GET_PURCHASE_LIST']),
    ...mapActions('vat', ['GET_VAT_LIST'])
  },
  mounted() {
    this.GET_MONTH_LIST();
    this.GET_PURCHASE_LIST();
    this.GET_VAT_LIST();
  },
});
</script>
<style scoped>
.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.month-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 98px;
  width: 82%;
  padding: 0.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.month-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.month-icon {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

ion-card-title {
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.month-name {
  font-size: 0.9rem;
}
.green-background ion-card-title,
.green-background .month-icon,
.green-background .month-name {
  color: white !important;
}
</style>
