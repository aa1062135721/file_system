<template>
  <div class="jurisdictionChange">
    <div class="main">
      <div class="single" v-for="(item, index) in list" :key="index" @click="nextFloor(item)">
        <div class="left">
          <img 
          :src="item.checked 
            ? require('@/assets/images/icon_choose.png') 
            : require('@/assets/images/icon_noChoose.png')" 
          class="pic1" 
          @click.stop="choose(item)">
          <img :src="item.type == 1 ? require('@/assets/images/icon_qx_wj.png') : item.avatar" class="pic2">
          <span>{{item.name}}</span>
        </div>
        <div class="right">
          <img src="@/assets/images/icon_right_arrow.png">
        </div>
      </div>
    </div>
    <div class="foot">
      <div class="Selected" v-if="resultList.length">
        <div 
        class="option" 
        v-for="(item, index) in resultList" 
        :key="index" 
        @click="deleteChoose(item)">
          <div class="all" v-if="item.type == 1">
            <span>{{item.name}}</span>
            <img src="@/assets/images/icon_qx_close.png">
          </div>
          <div class="pic" v-else>
            <img :src="item.avatar">
          </div>
        </div>
      </div>
      <div class="edit">
        <van-cell :title="title" @click="showAuthBox = true" is-link/>
      </div>
      <div class="bottom">
        <div class="b_left">
          <div v-if="cacheList.length">
            <img src="@/assets/images/icon__qx_left_arrow.png">
            <span @click="lastFloor">上一层</span>
          </div>
        </div>
        <div class="b_right">
          <button @click="goBack">取消</button>
          <button @click="submit">确定
            <span v-if="getAllChooesNum">
              ({{getAllChooesNum}})
            </span>
          </button>
        </div>
      </div>
    </div>
    <div class="authBox">
      <van-overlay :show="showAuthBox">
        <div class="wrapper" @click.stop>
          <div 
          class="single" 
          v-for="item in authList" 
          :key="item.id" 
          @click="setting(item)">
            <div class="left">
                <span>{{item.name}}</span>
            </div>
            <div class="right">
                <img  v-if="item.checked" src="@/assets/images/icon_choose.png">
            </div>
          </div>
        </div>
        <div class="btn">
            <button @click="showAuthBox = false">返回</button>
        </div>
      </van-overlay>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant';
export default {
  name: 'jurisdictionChange',

  data () {
    return {
      list: [],
      originalList: [], //保存最初的list
      resultList: [],  //已选中
      cacheList: [],  // 保存层级
      authList: [],  // 权限列表
      showAuthBox: false, // 控制编辑列表
      fileInfo: {},  // 文件类型，文件ID
      title: '',
      getAllChooesNum: 0
    };
  },

  created () {
    this.list = JSON.parse(this.$route.query.list)
    this.authList = JSON.parse(sessionStorage.getItem('config_list'))
    this.fileInfo = JSON.parse(this.$route.query.info)
    this.authList.map(res => {
      this.$set(res, 'checked', false)
      if (res.id == 'edit') {
        this.$set(res, 'checked', true)
      }
      if (res.name.indexOf('/') > -1) {
        res.name = res.name.replace(/\//g, '&')
      }
    })
    this.title = this.authList.filter(res=> res.checked)[0].name
    this.setChecked()
    this.originalList = this.list
  },

  methods: {
    // 选中当前部门或人员
    choose (item) {
      item.checked = !item.checked
      this.selectedList(item)
      // 统计已选人数
      this.filterChoose()
    },

    // 进入下一层
    nextFloor (item) {
      this.cacheList.push(this.list)
      if (item.clist.length) this.list = item.clist
    },

    // 返回上一层
    lastFloor () {
      if (this.cacheList.length) this.list = this.cacheList[this.cacheList.length - 1]
      this.cacheList.pop()
    },

    goBack () {
      this.$router.go(-1)
    },

    // 给所有选项添加checked属性
    setChecked () {
      this.chunkList(this.list)
    },

    // 筛选已选中的人员或部门
    selectedList (item) {
      if (item.checked) {
        this.resultList.push(item) 
      } else {
        this.resultList = this.resultList.filter(res => res.key !== item.key )
      }

      if (item.clist.length) {
        // 部门下面的所有全部选中
        let _this = this
        let chunk = function (list) {
          list.map(res => {
            _this.$set(res, 'checked', item.checked)
            if (res.clist.length) {
              chunk(res.clist)
            }
          })
        }
        chunk(item.clist)
      }
      console.log(this.resultList)
    },

    // 删除已选中
    deleteChoose (item) {
      item.checked = false
      // 过滤掉部门下的所有人员
      if (item.clist.length) {
        this.chunkList(item.clist, false)
      } 
      this.resultList = this.resultList.filter(res => res.checked)
      this.filterChoose()
    },

    // 递归部门
    chunkList (list, type) {
      let _this = this
      list.map(res => {
        _this.$set(res, 'checked', type)
        if (res.clist.length) {
          this.chunkList(res.clist)
        }
      })
    },
    
    // 确定
    submit () {
      let arr = []
      this.resultList.map(res => {
        let obj = {
          id: res.id,
          type: res.type
        }
        arr.push(obj)
      })
      let auth = this.authList.filter(res => res.checked)

      if (!arr.length) {
        Toast('请选择部门人员')
        return
      } else if (!auth.length) {
        Toast ('请设置权限')
        return
      }
      let subItems = {
        id: this.fileInfo.id,
        type: this.fileInfo.type,
        auth: auth[0].id,
        olist: arr
      }
      this.Api.post('authCreateAuthInfo', subItems).then(res => {
        if (res.data.status) {
          this.$router.go(-1)
        }
        Toast(res.data.message)
      })
    },

    // 过滤所有选中的人员数量
    filterChoose () {
      let _this = this
      let num = 0
      let chunk = function (list) {
        list.map(res => {
          if (!res.clist.length && res.checked) {
            num++
          }
          if (res.clist.length) {
            chunk(res.clist)
          }
        })
        _this.getAllChooesNum = num
      }
      chunk(this.originalList)
    },

    // 设置权限
    setting (item) {
      this.authList.map(res => res.checked = false)
      item.checked = !item.checked
      this.title = item.name
    },
  },
};
</script>

<style lang="scss" scoped>
.jurisdictionChange {
  .main {
    max-height: calc(100vh - 290px);
    box-sizing: border-box;
    padding: 0 29px;
    overflow-y: auto;
    .single {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f5f5f5;
      padding: 21px 0;
      .left {
        display: flex;
        align-items: center;
        .pic1 {
          width: 40px;
          height: 40px;
        }
        .span1 {
          display: inline-block;
          width: 40px;
          height: 40px;
        }
        .pic2 {
          width: 78px;
          height: 78px;
          margin-left: 42px;
          margin-right: 18px;
        }
      }
      .right {
        img {
          width: 15px;
          height: 26px;
        }
      }
    }
  }
  .foot {
    position: absolute;
    bottom: 0;
    width: 100%;
    .Selected {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      box-sizing: border-box;
      padding: 25px 30px 0px;
      background: #f5f5f5;
      overflow-x: auto;
      .option {
        margin-bottom: 25px;
        .all {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 150px;
          white-space: nowrap;
          flex-wrap: nowrap;
          height: 50px;
          box-sizing: border-box;
          font-size: 24px;
          font-family: PingFang SC;
          font-weight: 500;
          color: #FFFFFF;
          padding: 14px 16px 13px 15px;
          background: #ababab;
          border-radius: 5px;
          margin-right: 16px;
          img {
            width: 18px;
            height: 18px;
            margin-left: 5px;
          }
        }
        .pic {
          margin-right: 18px;
          img {
            width: 50px;
            height: 50px;
          }
        }
      }
    }
    .edit {
      border-bottom: 1px solid #f0f0f0;
      border-top: 1px solid #f0f0f0;
      ::v-deep .van-cell--clickable {
        font-size: 30px;
        font-family: PingFang SC;
        font-weight: 500;
        color: #333333;
        background: #f5f5f5;
      }
    }
    .bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 20px 31px;
      background: #f5f5f5;
      .b_left {
        >div {
          display: flex;
          align-items: center;
          font-size: 24px;
          font-family: PingFang SC;
          font-weight: bold;
          color: #3875C6;
          img {
            width: 13px;
            height: 24px;
            margin-right: 13px;
          }
        }
      }
      .b_right {
        button {
          width: 150px;
          height: 60px;
          border-radius: 5px;
          border: none;
          &:first-child {
            color: #3875C6;
            border: 1px solid #3875C6;
            background: #f5f5f5;
          }
          &:last-child {
            color: #FFFFFF;
            background: #3875C6;
            margin-left: 15px;
          }
        }
      }
    }
  }
  .authBox {
    width: 100%;
    height: 100%;
    .van-overlay {
      background: #f5f5f5;
      .wrapper {
        
        .single {
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          height: 120px;
          padding: 46px 30px;
          border-bottom: 1px solid #f5f5f5;
          background: #ffffff;
          .left {
            font-size: 30px;
            font-family: PingFang SC;
            font-weight: 500;
            color: #333333;
          }
          .right {
            img {
              width: 36px;
              height: 36px;
            }
          }
        }
      }
    }
    .btn {
      position: fixed;
      bottom: 24px;
      width: 100%;
      box-sizing: border-box;
      padding: 0px 30px;
      button {
        width: 100%;
        height: 88px;
        color: #ffffff;
        font-size: 36px;
        font-family: PingFang SC;
        font-weight: 500;
        background: #3875C6;
        border: none;
        border-radius: 10px;
      }
    }
  }
}
</style>