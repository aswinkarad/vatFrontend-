<template>
  <ion-page>
    <Header />
    <ion-content class="ion-padding">
      <div class="calendar-container">
        <h2 class="month-year-title">{{ months[month].name }} {{ year }}</h2>
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day">{{ day }}</div>
        </div>
        <div class="days-grid">
          <div v-for="emptyDay in firstDayOfMonth" :key="'empty-' + emptyDay" class="empty-day"></div>
          <ion-button v-for="day in getDaysInMonth()" :key="day" fill="clear" shape="round" :class="{
          'current-day': isCurrentDay(day),
          'selected-day': isSelectedDay(day),
          'has-bill': hasImageForDay(day)
        }" @click="onDayClick(day)" aria-label="Select day {{ day }}">
            {{ day }}
          </ion-button>
        </div>
      </div>
      <!-- <div>
        <h3>Debug Info:</h3>
        <p>Days with bills: {{ daysWithBills }}</p>
      </div> -->
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { image } from 'ionicons/icons';
import Header from '../components/Header.vue';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
  name: 'DaysView',
  components: {
    IonPage, IonContent, IonButton, IonIcon, Header,
  },
  props: {
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const selectedDay = ref(null);
    const daysWithBills = ref([]);

    const months = [
      { name: 'January' }, { name: 'February' }, { name: 'March' },
      { name: 'April' }, { name: 'May' }, { name: 'June' },
      { name: 'July' }, { name: 'August' }, { name: 'September' },
      { name: 'October' }, { name: 'November' }, { name: 'December' },
    ];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const onDayClick = (day) => {
      const selectedDate = new Date(props.year, props.month, day);
      selectedDay.value = day;
      const adjustedMonth = props.month + 1;
      const dateString = `${props.year}-${String(adjustedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      router.push({
        name: 'DayDetails',
        params: {
          date: dateString
        }
      });
    };

    return {
      selectedDay,
      daysWithBills,
      months,
      weekdays,
      onDayClick,
      image,
    };
  },
  computed: {
    ...mapState('bill', ['PurchaseList']),
    getDaysInMonth() {
      return () => Array.from(
        { length: new Date(this.year, this.month + 1, 0).getDate() },
        (_, i) => i + 1
      );
    },
    firstDayOfMonth() {
      return new Date(this.year, this.month, 1).getDay();
    },
  },
  methods: {
    ...mapActions('bill', ['GET_PURCHASE_LIST']),
    isCurrentDay(day) {
      const today = new Date();
      return today.getDate() === day &&
        today.getMonth() === this.month &&
        today.getFullYear() === this.year;
    },
    isSelectedDay(day) {
      return this.selectedDay === day;
    },
    hasImageForDay(day) {
      const date = `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const result = this.daysWithBills.includes(date);
      // console.log(`Checking date ${date}: ${result}`);
      return result;
    },
    checkBillsForMonth() {
      // console.log('Checking bills for month:', this.month + 1, this.year);
      // console.log('PurchaseList:', this.PurchaseList);
      this.daysWithBills = [];
      if (this.PurchaseList && this.PurchaseList.data) {
        this.PurchaseList.data.forEach(purchase => {
          const purchaseDate = new Date(purchase.date);
          if (purchaseDate.getMonth() === this.month && purchaseDate.getFullYear() === this.year) {
            const dateString = `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(purchaseDate.getDate()).padStart(2, '0')}`;
            if (!this.daysWithBills.includes(dateString)) {
              this.daysWithBills.push(dateString);
              // console.log(`Added date with bill: ${dateString}`);
            }
          }
        });
      }
      //console.log('Days with bills:', this.daysWithBills);
    },
  },
  watch: {
    PurchaseList: {
      handler() {
        this.checkBillsForMonth();
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.GET_PURCHASE_LIST();
  },
});
</script>

<style scoped>
.calendar-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  background-color: #F4F4F4;
  border-radius: 10px;
  padding: 0.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.current-day {
  --background: #3880FF;
  --background-activated: #3171E0;
  --background-hover: #3171E0;
  --color: #FFFFFF;
}
.selected-day {
  --background: #FF0000;
  --background-activated: #CC0000;
  --background-hover: #CC0000;
  --color: #FFFFFF;
}

.month-year-title {
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.1rem;
  margin-bottom: 0.25rem;
  font-weight: bold;
  color: #666;
}

.weekdays div {
  text-align: center;
  padding: 0.25rem 0;
  font-size: 0.8rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.1rem;
}

.empty-day {
  aspect-ratio: 1;
}

ion-button {
  --background: #FFFFFF;
  --background-activated: #E0E0E0;
  --background-hover: #F0F0F0;
  --color: #333;
  --border-radius: 10%;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  font-size: 0.9rem;
  margin: 0;
  --padding-start: 0;
  --padding-end: 0;
  transition: background-color 0.3s, color 0.3s;
}

ion-button:hover {
  --background: #E0E0E0;
}

ion-button:active {
  --background: #D0D0D0;
}

.has-bill {
  --background: green !important; /* Green background for days with bills */
  --color: #FFFFFF; /* White text color */
}

.button-inner {
  border-radius: 12px;
}

ion-button::part(native) {
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-day {
  --background: #3880FF;
  --background-activated: #3171E0;
  --background-hover: #3171E0;
  --color: #FFFFFF;
}

.selected-day {
  --background: #FF0000;
  --background-activated: #CC0000;
  --background-hover: #CC0000;
  --color: #FFFFFF;
}

.has-image {
  --background: #197525;
  --background-activated: #CC0000;
  --background-hover: #CC0000;
  --color: #FFFFFF;
}

.image-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 12px;
}

@media (min-width: 360px) {
  .calendar-container {
    padding: 0.75rem;
  }

  .month-year-title {
    font-size: 1.2rem;
  }

  .weekdays div {
    font-size: 0.8rem;
    padding: 0.25rem 0;
  }

  .weekdays,
  .days-grid {
    gap: 0.15rem;
  }

  ion-button {
    font-size: 0.9rem;
  }
}

@media (min-width: 768px) {
  .calendar-container {
    max-width: 768px;
    padding: 1rem;
  }

  .month-year-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .weekdays div {
    font-size: 1rem;
    padding: 0.5rem 0;
  }

  .weekdays,
  .days-grid {
    gap: 0.5rem;
  }

  ion-button {
    font-size: 1rem;
  }
}
</style>