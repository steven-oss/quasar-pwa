<template>
  <q-page class="row items-center justify-evenly">
    <example-component
      title="Example component"
      active
      :todos="todos"
      :meta="meta"
    ></example-component>
  </q-page>
  <q-page class="row items-center justify-evenly">
    <example-component1
      title="Example component1"
      active
      :datas="datas"
      :meta="meta"
    ></example-component1>
  </q-page>
  <div class="q-pa-md q-gutter-sm">
    <q-btn push color="white" text-color="primary" label="Push" @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Todo, Meta, People } from 'components/models'
import ExampleComponent from 'components/ExampleComponent.vue'
import ExampleComponent1 from 'components/ExampleComponent1.vue'
import { api } from 'src/boot/axios'

const todos = ref<Todo[]>([
  {
    id: 1,
    content: 'ct1',
  },
  {
    id: 2,
    content: 'ct2',
  },
  {
    id: 3,
    content: 'ct3',
  },
  {
    id: 4,
    content: 'ct4',
  },
  {
    id: 5,
    content: 'ct5',
  },
])

const meta = ref<Meta>({
  totalCount: 1200,
})

const datas = ref<People[]>([])
// const datas1 = ref<Doctor[]>([])

const fetchData = async () => {
  try {
    const response = await api.get('/announcements/?isActive=true')
    // const res = await axios.get('https://apidev.hiscloud.tw/api/reg/doctor-schedules/doctors')

    datas.value = await response.data.map(({ id, content }: People) => ({
      id,
      content,
    }))

    // datas1.value = await res.data.map(({ title, chName }: Doctor) => ({
    //   title,
    //   chName,
    // }))
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const handleClick = async () => {
  try {
    const postRes = await api.post(
      '/rest/anonymous/web/registration/10000000-0000-0000-0000-000000000001/reg/patient/',
      {
        activeCode: null,
        address: null,
        areaCode: null,
        birthday: '2006-03-22',
        bloodType: null,
        chName: 'test',
        chartNo: null,
        cityCode: null,
        company: null,
        contactAddress: null,
        contactCityCode: null,
        contactCountry: null,
        contactMobilePhone: '0988765411',
        contactName: 'test',
        contactPhone: null,
        contactPostCode: null,
        contactRelation: null,
        countryCode: null,
        deathDate: null,
        disability: false,
        educateNo: null,
        emailAddress: null,
        employee: false,
        enName: null,
        firstVisitDate: null,
        foreign: false,
        genderCode: '1',
        idNumber: 'A122394093',
        languageCode: null,
        lastAppointmentDate: null,
        marriedType: null,
        mergeByCode: null,
        mobilePhone: '0988765411',
        nationality: null,
        occupationCode: null,
        organizationId: null,
        postCode: null,
        religionNo: null,
        residentAddress: null,
        residentCityCode: null,
        residentCountryCode: null,
        residentPostCode: null,
        stop: false,
        telExtension: null,
        telNumber: null,
        vipCode: null,
      },
    )
    console.log('res', postRes)
  } catch (err) {
    console.error(err)
  }
}
onMounted(fetchData)
</script>
