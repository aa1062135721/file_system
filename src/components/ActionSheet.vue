<template>
  <div>
    <van-overlay :show="show" >
      <div class="wrapper" @click.stop>
        <div class="options" v-if="data">
          <div class="option" v-for="(name, idx) in data" :key="idx" @click="onSelect(name)">{{name}}</div>
          <div class="cache" @click="cache" v-if="showCancel">取消</div>
        </div>
      </div>
    </van-overlay>
  </div>
</template>

<script>
import { Toast } from 'vant';
export default {
  name: 'ActionSheet',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: () => []
    },
    fatherData: {
      type: Object,
      default: () => {}
    },
    dataId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      
    };
  },

  mounted() {
    },

  methods: {
    onSelect (name) {
      switch (name) {
        case '权限管理':
          // 获取文件/文件夹权限
          this.Api.get('authGetInfo', {id: this.fatherData.id, type: this.fatherData.type}).then(res => {
            if (res.data.status) {
              this.$router.push('/jurisdiction/index')
            } else {
              Toast.fail(res.data.message);
            }
          })
          break
        case '删除':
          console.log(2)
          break
        case '重命名':
          this.Api.post('folderUpdateFolder', {parentid: id, name: this.newFolderName, }).then(res => {
            if (res.data.status) {
              Toast.success(res.data.message)
              this.getIndexGetList()
              this.newFolderFlag = false
              this.newFolderName = ''
            }
          })
          break
        case '收藏':
          console.log(4)
          break
        case '移动':
          this.$router.push(`/move?options=${JSON.stringify(this.fatherData)}`)
          break
      }
    },

    // 取消
    cache () {
      this.$emit('update:show', false)
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/css/com.scss';
</style>