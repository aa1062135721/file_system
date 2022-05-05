<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      }
  },

  created() {
    if (this.$route.query.token) {
      localStorage.setItem('token', this.$route.query.token)
    }
    
  },

  mounted() {

  },
}
</script>

<style lang="scss" scoped>
html,body, #app {
  width: 100%;
  height: 100%;
}
</style>
