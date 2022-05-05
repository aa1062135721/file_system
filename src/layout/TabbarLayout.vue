<template>
   <div>
       <router-view></router-view>
       <tabBar/>
   </div>
</template>

<script>
import tabBar from "./common/tabBar.vue"
export default {
    components:{
        tabBar
    }
}
</script>

<style  scoped>
</style>