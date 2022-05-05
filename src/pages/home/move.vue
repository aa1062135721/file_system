<template>
  <div class="homeMove">
    <div class="top">
      <div class="t_left disCen">
        <img
          src="@/assets/images/icon_left_arrow.png"
          v-if="!this.$store.state.nodeInfo.moveNodeId.length"
          @click="backOff"
        />
        <div class="tl_text" v-if="data.path_list">
          <p>{{ data.path_list[data.path_list.length - 1].name }}</p>
          <p>{{ data.uauth_name }}</p>
        </div>
      </div>
      <div class="t_right" @click="goBack">
        <img src="@/assets/images/icon_move_close.png" />
      </div>
    </div>
    <div class="main" v-if="data.list.length">
      <div
        class="single"
        v-for="(item, index) in data.list"
        :key="index"
        @click="seeFile(item)"
      >
        <div class="left">
          <img
            :src="
              item.type == 1
                ? require('@/assets/images/icon_qx_wj.png')
                : require('@/assets/images/icon_wj.png')
            "
          />
          <span>{{ item.name }}</span>
        </div>
        <div class="right">
          <img src="@/assets/images/icon_right_arrow.png" />
        </div>
      </div>
    </div>
    <div v-else>
      <noContent></noContent>
    </div>
    <div class="btn">
      <button @click="goMove">移动到此处</button>
    </div>
    <div
      class="pic"
      @click="backOff"
      ref="backOff"
    >
      <!-- @touchstart.stop="touchstartHandle('backOff', $event, true)"
      @touchmove.stop="touchmoveHandle('backOff', $event, true)" -->
      <img src="@/assets/images/icon_back.png" />
    </div>
  </div>
</template>

<script>
import { Toast } from "vant";
export default {
  name: "homeMove",

  data() {
    return {
      data: {
        list: [],
      },
      fromData: {},
      coordinate: {
        client: {
          x: null,
          y: null,
        },
        elePosition: {
          left: null,
          top: null,
        },
      },
    };
  },

  created () {
    this.getIndexGetList();
    this.fromData = JSON.parse(this.$route.query.options);
  },

  methods: {
    // 获取资料列表
    getIndexGetList (id, searchVal, type) {
      this.Api.get("indexGetList", {
        is_page: 0,
        folder_id: id,
        keywords: searchVal,
      }).then((res) => {
        if (res.data.status) {
          res.data.data.list.map((item) => {
            this.$set(item, "show", false);
          });
          this.data = res.data.data;
          if (type == 1 ) {
            this.$store.commit("nodeInfo/addMoveId", id) 
          } else if (type == 2) {
            this.$store.commit("nodeInfo/reduceMoveId")
          } 
        }
      });
    },

    // 查看文件
    seeFile (item) {
      event.stopPropagation();
      if (item.type == 1) {
        this.getIndexGetList(item.id, "", item.type);
      } else {
        this.checkFileFileShow(item.id);
      }
    },

    goMove () {
      this.Api.post("folderBatchMoveFile", {
        ids: [{ id: this.fromData.id, type: this.fromData.type }],
        folder_id: this.data.path_list[this.data.path_list.length - 1].id,
      }).then((res) => {
        if (res.data.status) {
          Toast.success(res.data.message);
          setTimeout(() => {
            this.$router.push("/home");
          }, 1500);
        }
      });
    },

    // 预览文件
    checkFileFileShow (id) {
      this.Api.post("fileFileShow", { file_id: id }).then((res) => {
        window.open(res.data.data.url);
      });
    },

    // 回退
    backOff () {
      if (this.$store.state.nodeInfo.moveNodeId.length) {
        // this.$store.commit("nodeInfo/reduceMoveId");
        let id = this.$store.state.nodeInfo.moveNodeId[this.$store.state.nodeInfo.moveNodeId.length - 2];
        this.getIndexGetList(id, '', 2);
      } else {
        this.goBack();
      }
    },

    touchstartHandle (refName, e, flag) {
      // 传false不拖拽
      if (!flag) {
        return false;
      }
      let element = e.targetTouches[0];
      // 记录点击的坐标
      this.coordinate.client = {
        x: element.clientX,
        y: element.clientY,
      };
      // 记录需要移动的元素坐标
      this.coordinate.elePosition.left = this.$refs[refName].offsetLeft;
      this.coordinate.elePosition.top = this.$refs[refName].offsetTop;
    },

    touchmoveHandle (refName, e, flag) {
      if (!flag) {
        return false;
      }
      let element = e.targetTouches[0];
      // 根据初始 client 位置计算移动距离(元素移动位置=元素初始位置+光标移动后的位置-光标点击时的初始位置)
      let x = this.coordinate.elePosition.left + (element.clientX - this.coordinate.client.x);
      let y = this.coordinate.elePosition.top + (element.clientY - this.coordinate.client.y);
      // 限制可移动距离，不超出可视区域
      x = x <= 5 ? 5 : x >= innerWidth - 55 ? innerWidth - 55 : x;
      y = y <= 50 ? 50 : y >= innerHeight - 55 ? innerHeight - 55 : y;
      // 移动当前元素
      this.$refs[refName].style.left = x + "px";
      this.$refs[refName].style.top = y + "px";
    },

    goBack () {
      this.$router.go(-1);
    },
  },

  destroyed () {
    this.$store.commit("nodeInfo/clearMoveId");
  },
};
</script>

<style lang="scss" scoped>
.homeMove {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 91px 25px 0px 30px;
  > .top {
    position: fixed;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 91px;
    line-height: 91px;
    box-sizing: border-box;
    border-bottom: 1px solid #f5f5f5;
    background: #fff;
    img {
      width: 40px;
      height: 40px;
    }
    .t_left,
    .t_right {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .t_left {
      img {
        align-self: flex-start;
        width: 32px;
        height: 28px;
        margin-right: 15px;
      }
      .tl_text {
        line-height: 30px;
        P:first-child {
          font-size: 30px;
          font-family: PingFang SC;
          font-weight: bold;
          color: #333333;
          line-height: 30px;
          margin-bottom: 9px;
        }
        p:last-child {
          font-size: 22px;
          font-family: PingFang SC;
          font-weight: 500;
          color: #999999;
        }
      }
    }
    .t_right {
      img {
        width: 28px;
        height: 28px;
        margin-left: 30px;
      }
    }
  }
  .main {
    padding-bottom: 95px;
    .single {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f5f5f5;
      padding: 21px 0;
      .left {
        display: flex;
        align-items: center;
        img {
          width: 78px;
          height: 78px;
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
  .btn {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    button {
      width: 100%;
      height: 100px;
      color: #fff;
      background: #3875c6;
      border: none;
    }
  }
  .pic {
    position: fixed;
    bottom: 191px;
    right: 33px;
    width: 100px;
    height: 100px;
    img {
      width: 100px;
      height: 100px;
    }
  }
}
</style>