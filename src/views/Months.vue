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
            backgroundColor: isCurrentMonth(index) ? '#2196F3' : isMonthGreen(index) ? 'green' : '#f3f7fa'
          }"
          :class="{ 'green-background': isMonthGreen(index), 'current-month': isCurrentMonth(index) }"
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

export default defineComponent({
  name: 'MonthList',
  components: {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    Header,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const currentYear = new Date().getFullYear();
    const companyId = Number(route.params.companyId);

    // Get the current month (0-based index, e.g., June 2025 is 5)
    const currentMonth = new Date().getMonth();

    const goToDaysPage = (index) => {
      router.push({ name: 'DaysView', params: { companyId, month: index, year: currentYear } });
    };

    const vatList = computed(() => store.state.vat.VATList?.data || []);

    const filteredVatList = computed(() =>
      vatList.value.filter(vat => vat.companyId === companyId)
    );

    const greenMonths = computed(() => {
      return filteredVatList.value.map(vat => {
        const vatDate = new Date(vat.createdAt);
        return vatDate.getMonth();
      });
    });

    const isMonthGreen = (monthIndex) => greenMonths.value.includes(monthIndex);

    // Function to check if the month is the current month
    const isCurrentMonth = (monthIndex) => monthIndex === currentMonth;

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
      isCurrentMonth,
    };
  },
  mounted() {
    this.$store.dispatch('vat/GET_VAT_LIST');
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

.current-month ion-card-title,
.current-month .month-icon,
.current-month .month-name {
  color: white !important;
}
</style>