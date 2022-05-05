<template>
    <div class="recentBrowsing">
        <div class="main" v-if="data.list.length">
            <div class="singer" v-for="(item, index) in data.list" :key="index">
                <div class="smallbox">
                    <div class="left" @click="seeFile(item)">
                        <img :src="item.type == 1 ? require('@/assets/images/icon_wjj.png') : require('@/assets/images/icon_recent_wj.png')">
                        <div class="info">
                            <p class="title">{{item.name}}</p>
                            <p>
                                <span>{{item.uname}}创建</span>
                                <span>{{item.show_time}}浏览</span>
                            </p>
                        </div>
                    </div>
                    <div class="right">
                        <img src="@/assets/images/icon_operation.png" @click.stop="item.show = true">
                    </div>
                </div>
                <van-overlay :show="item.show" @click="item.show = false">
                    <div class="wrapper" @click.stop>
                        <div class="options">
                            <div 
                            class="option" 
                            v-for="val in item.btn_list" 
                            :key="val.key" 
                            @click="onSelect(val.key, item)"
                            >{{val.name}}</div>
                            <div class="cache" @click="item.show = false">取消</div>
                        </div>
                    </div>
                </van-overlay>
            </div>
        </div>
        <div class="noContent" v-else>
            <noContent></noContent>
        </div>
        <van-overlay :show="newFolderFlag" @click="newFolderFlag = false">
            <div class="wrapper" @click.stop>
                <div class="newFolder">
                    <div class="top">
                        <div class="title">重命名文件夹</div>
                        <div class="inp">
                            <input 
                            type="text" 
                            placeholder="请输入文件夹名称" 
                            v-model="newFolderName" 
                            ref="getFocus">
                        </div>
                    </div>
                    <div class="btnBox">
                        <button @click="cancelCreateFolder">取消</button>
                        <span></span>
                        <button @click="addFolder">确定</button>
                    </div>
                </div>
            </div>
        </van-overlay>
        <div class="btn" v-if="data.list.length">
            <button @click="closePage">关闭</button>
        </div>
        <div class="pic" 
        @click="backOff" 
        ref="backOff" 
        @touchstart.stop="touchstartHandle('backOff',$event, true)" 
        @touchmove.stop="touchmoveHandle('backOff',$event, true)">
            <img src="@/assets/images/icon_back.png">
        </div>
    </div>
</template>

<script>
import { Toast, Dialog } from 'vant'
export default {
    data () {
        return {
            data: {
                list: []
            },
            currentItem: 0, // 当前选中的文件或文件夹
            newFolderFlag: false,  // 新建文件夹
            newFolderName: '',
            coordinate: {
                client: {
                    x: null,
                    y: null
                },
                elePosition: {
                    left: null,
                    top: null
                }
            }
        }
    },

    created () {
        if (sessionStorage.getItem('recentNodeId')) {
            let list = JSON.parse(sessionStorage.getItem('recentNodeId'))
            this.$store.commit('nodeInfo/replaceRecentNodeId', list)
            sessionStorage.removeItem('recentNodeId') 
        }
        if (this.$store.state.nodeInfo.recentBrowsNodeId.length) {
            let id = this.$store.state.nodeInfo.recentBrowsNodeId[this.$store.state.nodeInfo.recentBrowsNodeId.length - 1]
            this.getIndexGetList(id)
        } else {
            this.getIndexViewList(1)
        }
    },

    methods: {
        // 浏览列表
        getIndexViewList (type) {
            this.Api.get('indexViewList', {is_page: 0, keywords: ''}).then(res => {
                if (res.data.status) {
                    res.data.data.list.map(item => {
                        this.$set(item, 'show', false)
                    })
                    this.data = res.data.data
                    if (type == 1) this.$store.commit('nodeInfo/clearReduceRecentBId')
                }
            })
        },

        // 查看列表
        getIndexGetList (id, type) {
            this.Api.get('indexGetList', {is_page: 0, folder_id: id, keywords: ''}).then(res => {
                if (res.data.status) {
                    this.data = res.data.data
                    res.data.data.list.map(item => {
                        this.$set(item, 'show', false)
                    })
                    if (type == 1) {
                        this.$store.commit('nodeInfo/addRecentBId', id) 
                    } else if ( type == 2) {
                        this.$store.commit('nodeInfo/reduceRecentBId')
                    }
                }
            })
        },

        // 查看文件
        seeFile (item) {
            if (item.type == 1) {
                this.getIndexGetList(item.id, 1)
            } else {
                this.checkFileFileShow(item.id)
            }
        },

        // 预览文件
        checkFileFileShow (id) {
            this.Api.post('fileFileShow', {file_id: id}).then(res => {
                if (res.data.status) {
                    window.location.href = res.data.data.url
                    sessionStorage.setItem('recentNodeId', JSON.stringify(this.$store.state.nodeInfo.recentBrowsNodeId)) 
                }
            })
        },

        // 重命名文件夹/文件
        addFolder () {
            if (this.currentItem.type == 2) {
                let params = {
                    file_id: this.currentItem.id,
                    name: this.newFolderName
                }
                this.Api.post('fileUpdateFile', params).then(res => {
                    if (res.data.status) {
                        this.newFolderFlag = false
                        this.newFolderName = ''
                         if (!this.$store.state.nodeInfo.recentBrowsNodeId.length) {
                             this.getIndexViewList()
                         } else {
                            let id = this.$store.state.nodeInfo.recentBrowsNodeId[this.$store.state.nodeInfo.recentBrowsNodeId.length - 1]
                            this.getIndexGetList(id)
                         }
                    }
                    Toast(res.data.message)
                })
            } else {
                let subItems = {
                    parentid: this.data.path_list[this.data.path_list.length - 1] ? this.data.path_list[this.data.path_list.length - 1].id : 0,
                    name: this.newFolderName,
                    id: this.currentItem.id
                }
                this.Api.post('folderUpdateFolder', subItems).then(res => {
                    if (res.data.status) {
                        this.newFolderFlag = false
                        this.newFolderName = ''
                        if (!this.$store.state.nodeInfo.recentBrowsNodeId.length) {
                            this.getIndexViewList()
                        } else {
                            let id = this.$store.state.nodeInfo.recentBrowsNodeId[this.$store.state.nodeInfo.recentBrowsNodeId.length - 1]
                            this.getIndexGetList(id)
                        }
                    }
                    Toast(res.data.message)
                })
            }
        },

       onSelect (key, item) {
           let options = {
                id: item.id,
                type: item.type
            }
            let parmas = {
                folder_ids: [],
                file_ids: []
            }
            switch (key) {
                case 'auth_set':
                    // 获取文件/文件夹权限
                    this.$router.push(`/jurisdiction/index?data=${JSON.stringify(options)}`)
                    break
                case 'delete_item':
                     Dialog.confirm({
                        title: '',
                        message: item.type == 1 ? '是否删除该文件夹？' : '是否删除该文件？',
                        confirmButtonColor: '#328CFF'
                    }).then(() => {
                        if (item.type == 1) {
                            parmas.folder_ids.push(item.id)
                        } else {
                            parmas.file_ids.push(item.id)
                        }
                        this.Api.post('folderBatchDelFile', parmas).then(res => {
                            if (res.data.status) {
                                if (!this.$store.state.nodeInfo.recentBrowsNodeId.length) {
                                    this.getIndexViewList()
                                } else {
                                    let id = this.$store.state.nodeInfo.recentBrowsNodeId[this.$store.state.nodeInfo.recentBrowsNodeId.length - 1]
                                    this.getIndexGetList(id)
                                }
                            }
                            Toast(res.data.message)
                        })
                    }).catch(() => {
                        // on cancel
                    });
                    break
                case 'rename_item':
                    this.currentItem = item // 赋值当前选中的文件或文件夹
                    this.newFolderFlag = true  // 显示弹窗
                    item.show = false // 关闭文件操作弹窗
                    this.newFolderName = item.short_name
                     this.$nextTick(() => {
                        this.$refs.getFocus.focus()
                    })
                    break
                case 'remove_item':
                    this.$router.push(`/move?options=${JSON.stringify(item)}`)
                    break
            }
        },

        cancelCreateFolder () {
            this.newFolderName = ''
            this.newFolderFlag = false
        },

        closePage () {
            if (sessionStorage.getItem('recentNodeId'))  sessionStorage.removeItem('recentNodeId') 
            this.$store.commit('nodeInfo/clearReduceRecentBId')
            this.$router.go(-1)
        },

         // 回退
        backOff () {
            if (this.$store.state.nodeInfo.recentBrowsNodeId.length == 1) {
                this.getIndexViewList(1)
                return
            }
            if (this.$store.state.nodeInfo.recentBrowsNodeId.length) {
                let id = this.$store.state.nodeInfo.recentBrowsNodeId[this.$store.state.nodeInfo.recentBrowsNodeId.length - 2]
                this.getIndexGetList(id, 2)
            }
        },

        touchstartHandle (refName, e, flag) { // 传false不拖拽
            if (!flag) {
                return false;
            }
            let element = e.targetTouches[0];
            // 记录点击的坐标
            this.coordinate.client = {
                x: element.clientX,
                y: element.clientY
            };
            // 记录需要移动的元素坐标
            this.coordinate.elePosition.left = this.$refs[refName].offsetLeft;
            this.coordinate.elePosition.top = this.$refs[refName].offsetTop;
        },

        touchmoveHandle (refName, e, flag) {
            e.preventDefault(); 
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
            this.$refs[refName].style.left = x + 'px';
            this.$refs[refName].style.top = y + 'px';
        },
    }
}
</script>

<style scoped lang="scss">
.recentBrowsing {
    box-sizing: border-box;
    padding-bottom: 140px;
    .main {
        .singer {
            .smallbox {
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 100%;
                box-sizing: border-box;
                padding: 42px 30px;
                border-bottom: 1px solid #EEEEEE;
                .left {
                    display: flex;
                    align-items: center;
                    img {
                        width: 68px;
                        height: 75px;
                        margin-right: 22px;
                    }
                    .info {
                        .title {
                            font-size: 30px;
                            font-family: PingFang SC;
                            font-weight: 500;
                            color: #333333;
                            margin-bottom: 20px;
                            max-width: 65vw;
                            overflow: hidden;
                            text-overflow:ellipsis;
                            white-space: nowrap;
                        }
                        p:last-child {
                            font-size: 24px;
                            font-family: PingFang SC;
                            font-weight: 500;
                            color: #999999;
                            span:first-child {
                                margin-right: 20px;
                            }
                        }
                    }
                }
                .right {
                    align-self: flex-start;
                    img {
                        width: 60px;
                        height: 30px;
                    }
                }
            }
        }
    }
    .btn {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        button {
            width: 690px;
            height: 88px;
            font-size: 36px;
            font-family: PingFang SC;
            font-weight: 500;
            color: #FFFFFF;
            background: #3875C6;
            border-radius: 10px;
            border: none;
        }
    }
    .pic {
        position: fixed;
        bottom: 191px;
        right: 33px;
         animation: entry 0.5s forwards;
        img {
            width: 100px;
            height: 100px;
        }
    }

     @keyframes entry {
        from {
            right: -100px
        }
        to {
            right: 33px;
        }
    }
    .van-overlay {
        display: flex;
        justify-content: center;
        align-items: center;
        .wrapper {
            background: #fff;
            border-radius: 10px;
            .newFolder {
                .top {
                    box-sizing: border-box;
                    padding: 42px 35px 0px;
                    text-align: center;
                    .title {
                        font-size: 36px;
                        font-family: PingFang SC;
                        font-weight: bold;
                        color: #333333;
                    }
                    .inp {
                        input {
                            width: 480px;
                            color: #999999;
                            background: #EEEEEE;
                            border-radius: 10px;
                            box-sizing: border-box;
                            padding: 23px 31px;
                            margin-top: 65px;
                            margin-bottom: 71px;
                        }
                        /* WebKit browsers */ 
                        input::-webkit-input-placeholder { 
                            color: #999999; 
                        } 
                        /* Mozilla Firefox 4 to 18 */ 
                        input:-moz-placeholder { 
                            color: #999999; 
                        } 
                        /* Mozilla Firefox 19+ */ 
                        input::-moz-placeholder { 
                            color: #999999; 
                        } 
                        /* Internet Explorer 10+ */ 
                        input:-ms-input-placeholder { 
                            color: #999999; 
                        }
                    }
                }
                >.btnBox {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    span {
                        display: inline-block;
                        width: 2px;
                        height: 40px;
                        background: #E5E5E5;
                    }
                    button {
                        font-size: 32px;
                        font-family: PingFang SC;
                        font-weight: 500;
                        color: #999999;
                        box-sizing: border-box;
                        padding: 43px 106px 44px;
                        border: none;
                        background: none;
                        &:last-child {
                            color: #3875C6;
                        }
                    }
                }
            }
        }
    }
}
@import '@/assets/css/com.scss';
</style>>