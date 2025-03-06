<template>
  <q-page class="row items-center justify-evenly">
    <example-component1
      title="Example component1"
      active
      :datas="datas"
      :meta="meta"
    ></example-component1>
  </q-page>
  <div class="q-pa-md">
    <q-table title="Treats" :rows="datas1" :columns="columns" row-key="id">
      <!-- 自訂 body-cell-actions 插槽 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <!-- 按鈕 -->
          <q-btn dense flat color="primary" icon="edit" @click="handleClickById(props.row)" />
        </q-td>
      </template>
    </q-table>
  </div>
  <div class="q-pa-md q-gutter-sm">
    <div class="q-gutter-md" style="max-width: 300px">
      <q-input v-model="text" label="Standard" />
    </div>
    <q-btn push color="white" text-color="primary" label="Push" @click="handleClick" />
  </div>
  {{ employee.title }}
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Meta, People, Employee, Employees } from 'components/models'
import ExampleComponent1 from 'components/ExampleComponent1.vue'
import { api } from 'src/boot/axios'

const meta = ref<Meta>({
  totalCount: 1200,
})

const datas = ref<People[]>([])
const datas1 = ref<Employees[]>([])
const text = ref<string>('')
const columns = ref([
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true },
  { name: 'idNo', label: 'ID No', field: 'idNo', align: 'left' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions' as const }, // 添加 actions 欄位
])
const employee = ref<Employee>({
  id: '',
  title: '',
})

const fetchData = async () => {
  try {
    const response = await api.get('announcements/?isActive=true')
    const response1 = await api.get('employees/?page=0&size=30')
    // const res = await axios.get('https://apidev.hiscloud.tw/api/reg/doctor-schedules/doctors')

    datas.value = await response.data.map(({ id, content }: People) => ({
      id,
      content,
    }))

    datas1.value = await response1.data.content.map(({ id, idNo }: Employees) => ({
      id,
      idNo,
    }))
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
const handleClickById = async (row: Employees) => {
  try {
    const getById = await api.get(`employees/${row.id}`)
    employee.value = { id: getById.data.id, title: getById.data.title }
  } catch (err) {
    console.error(err)
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
        idNumber: text.value,
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
// onMounted(() => {
//   // 獲取 Vue 實例並從全局屬性中獲取 $announcements
//   const instance = getCurrentInstance()
//   if (instance) {
//     const globalAnnouncements = instance.appContext.config.globalProperties.$announcements
//     if (globalAnnouncements) {
//       datas.value = globalAnnouncements
//     }
//   }
// })
onMounted(fetchData)
</script>
