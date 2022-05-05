<template>
  <div class="footers">
      <div @click="checkPath('/tabHome/index')">
          <img :src="'tabHome'===$route.meta.tabKey?require('@/assets/images/tabBar/home_active.png'):require('@/assets/images/tabBar/home.png')" />
          <p :class="{check:'tabHome'===$route.meta.tabKey}">首页</p>
      </div>
      <div @click="checkPath('/tabTarget/index')">
          <img :src="'tabTarget'===$route.meta.tabKey?require('@/assets/images/tabBar/target_active.png'):require('@/assets/images/tabBar/target.png')" />
          <p :class="{check:'tabTarget'===$route.meta.tabKey}">目标</p>
      </div>
      <div @click="checkPath('/tabTask/index')">
          <img :src="'tabTask'===$route.meta.tabKey?require('@/assets/images/tabBar/task_active.png'):require('@/assets/images/tabBar/task.png')" />
          <p :class="{check:'tabTask'===$route.meta.tabKey}">任务</p>
      </div>
      <div @click="checkPath('/tabReport/index')">
          <img :src="'tabReport'===$route.meta.tabKey?require('@/assets/images/tabBar/report_active.png'):require('@/assets/images/tabBar/report.png')" />
          <p :class="{check:'tabReport'===$route.meta.tabKey}">汇报</p>
      </div>
  </div>
</template>

<script>
  export default{
    data(){
      return{

      }
    },
    methods:{
      checkPath(path){       //切换路由
        this.$router.replace(path)
      }
    }
  }
</script>

<style scoped="scoped" lang="scss">
  .footers{
    width: 100%;
    background-color: white;
    position:fixed;
    bottom: 0;
    left: 0;
    border: 1px solid #F5F5F5;
    z-index: 100;
    display:flex;
    height: 98px;
    align-items: center;
    justify-content:space-around;
    box-sizing: border-box;
    >div{
      display:flex;
      flex-direction:column;
      align-items:center;
      position: relative;
      >img{
        width: 50px;
        height: 50px;
        margin-bottom:7px;
      }
      >p{
        font-size: 24px;
        color: #999999;
        margin-top: -7px;
      }
    }
    .check{
      color: #3875C6;
      flex-wrap: 500;
    }
  }
</style>