<template>
    <div class="home">
        <div class="top" :class="status == 2 ? 'searchShow' : ''">
            <div class="reveal" v-if="status == 1">
                <div class="t_left disCen">
                    <img 
                    src="@/assets/images/icon_left_arrow.png" 
                    @click="backOff" 
                    v-if="!this.$store.state.nodeInfo.nodeId.length"
                    >
                    <div class="tl_text" v-if="data.path_list">
                        <p>{{data.path_list[data.path_list.length - 1].name}}</p>
                        <p>{{data.uauth_name}}</p>
                    </div>
                </div>
                <div class="t_right">
                    <img src="@/assets/images/icon_search.png" @click="clickSearch">
                    <img src="@/assets/images/icon_more.png" @click="moreOption">
                    <van-overlay :show="showMore" @click="showMore = false">
                        <div class="wrapper" @click.stop>
                            <div class="options">
                                <div 
                                class="option" 
                                v-for="(val, idx) in moreMenu" 
                                :key="idx" 
                                @click="chooseOption(val.key)"
                                >
                                    <span v-if="val.key !== 'upload_file'">
                                        {{val.name}}
                                    </span>
                                    <van-uploader 
                                    :after-read="afterRead" 
                                    v-if="val.key === 'upload_file'" 
                                    accept="" class="updateFile">
                                        <div style="width: 100vw">{{val.name}}</div>
                                    </van-uploader>
                                </div>
                                <div class="cache" @click="showMore = false">取消</div>
                            </div>
                        </div>
                    </van-overlay>
                    <van-overlay :show="newFolderFlag" @click="newFolderFlag = false">
                        <div class="newFileBox" @click.stop>
                            <div class="newFolder">
                                <div class="top">
                                    <div class="title">
                                        {{ 
                                            addChangeFlag 
                                            ? '新建文件夹' 
                                            :  currentItem.type == 1 
                                            ? '重命名文件夹' 
                                            : '重命名文件'
                                        }}
                                    </div>
                                    <div class="inp">
                                        <input 
                                        type="text" 
                                        placeholder="请输入文件夹名称" 
                                        v-model="newFolderName" 
                                        ref="getFocus">
                                    </div>
                                </div>
                                <div class="btn">
                                    <button @click="cancelCreateFolder">取消</button>
                                    <span></span>
                                    <button @click="addFolder">确定</button>
                                </div>
                            </div>
                        </div>
                    </van-overlay>
                </div>
            </div>
            <div class="search" v-if="status == 2" >
                <input 
                v-model="searchVal"  
                placeholder="请输入搜索关键词" 
                ref="searchFocus">
                <div class="btn">
                    <van-button color="#3875C6" size="small" @click="searchFile">搜索</van-button>
                    <van-button 
                    plain 
                    color="#3875C6" 
                    size="small" 
                    @click="cancel"
                    >取消</van-button>
                </div>
            </div>
        </div>
        <div class="main">
            <van-collapse v-model="activeNames" :border="false" >
                <div  v-for="(item, index) in fileData" :key="index" >
                    <van-collapse-item 
                    :name="index" 
                    v-if="item.children.length"
                    :is-link="false" 
                    :border="false" 
                    label-class="content">
                        <template #title >
                            <div class="section" >
                                <img src="@/assets/images/icon_down_arrow.png">
                                <span>{{item.name}}</span>
                            </div>
                        </template>
                        <div class="single" v-for="(it, idx) in item.children" :key="idx" >
                            <div class="smallbox" @click="seeFile(it)">
                                <div class="s_left">
                                    <img :src="it.type == 1 ? require('@/assets/images/icon_wjj.png') : require('@/assets/images/icon_wj.png')">
                                    <span>{{it.name}}</span>
                                </div>
                                <img src="@/assets/images/icon_operation.png" @click.stop="it.show = true">
                            </div>
                            <van-overlay :show="it.show" @click="it.show = false">
                                <div class="wrapper" @click.stop>
                                    <div class="options">

                                        <div class="option" 
                                        v-for="val in it.btn_list" 
                                        :key="val.key" 
                                        @click="onSelect(val.key, it)"
                                        >{{val.name}}</div>

                                        <div class="cache" @click="it.show = false">取消</div>
                                    </div>
                                </div>
                            </van-overlay>
                        </div>
                    </van-collapse-item>
                </div>
            </van-collapse>
        </div>
        <div v-if="!fileData[0].children.length && !fileData[1].children.length">
            <noContent></noContent>
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
import { Toast, Dialog } from 'vant';
export default {
    data () {
        return {
            data: {},
            fileData: [
                {
                    name: '文件夹',
                    children: []
                },
                {
                    name: '文件',
                    children: []
                }
            ],
            activeNames: [0, 1], // 默认展开文件/文件夹
            searchVal: '',
            status: 1,  // 1 展示顶部导航栏 2 展示搜索框
            showMore: false, 
            moreMenu:  [],
            newFolderFlag: false,  // 新建文件夹
            newFolderName: '',  // 文件夹名称
            addChangeFlag: true,  // 修改或新增文件夹， true: 新增， false: 修改
            currentItem: {}, // 当前选中的文件或文件夹
            coordinate: { // 记录移动返回icon时所在位置
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
        // 点击文件预览时，跳转到该文件导致vuex里的节点信息清空， 利用sessionStorage存储节点信息，重新赋值给Vuex,并清空sessionStorage中的节点信息
        if (sessionStorage.getItem('nodeId')) {
            let list = JSON.parse(sessionStorage.getItem('nodeId'))
            this.$store.commit('nodeInfo/replaceNodeId', list)
            sessionStorage.removeItem('nodeId') 
        }
        let id = this.$store.state.nodeInfo.nodeId[this.$store.state.nodeInfo.nodeId.length - 1]
        this.getIndexGetList(id)
    },

    methods: {
        // 获取资料列表
        getIndexGetList (id, searchVal, type) {
            this.Api.get('indexGetList', {is_page: 0, folder_id: id, keywords: searchVal}).then(res => {
                if (res.data.status) {
                    this.data = res.data.data
                    res.data.data.list.map(item => {
                        this.$set(item, 'show', false)
                    })
                    this.fileData[0].children = res.data.data.list.filter(res => res.type == 1)
                    this.fileData[1].children = res.data.data.list.filter(res => res.type == 2)
                    this.moreMenu = res.data.data.btn_list
                    if (type == 1) {
                        this.$store.commit('nodeInfo/addId', id) 
                    }  else if (type == 2) {
                        this.$store.commit('nodeInfo/reduceId')
                    }
                } else if (!res.data.status && res.data.message == "文件夹信息未找到") {
                    this.getIndexGetList(0)
                }
            })
        },

        // 查看文件夹
        seeFile (item) {
             event.stopPropagation()
            if (item.type == 1) {
                this.getIndexGetList(item.id, this.searchVal, 1)
            } else {
                console.log(item)
                this.checkFileFileShow(item.id)
            }
        },

        // 预览文件
        checkFileFileShow (id) {
            this.Api.post('fileFileShow', {file_id: id}).then(res => {
                if (res.data.status) {
                    window.location.href = res.data.data.url
                    // window.open(res.data.data.url)
                    sessionStorage.setItem('nodeId', JSON.stringify(this.$store.state.nodeInfo.nodeId))
                }
            })
        },

        // 上传文件
         afterRead (file) {
            const formData = new FormData();  // 声明一个FormData对象
            formData.append("files[]", file.file);
            formData.append("folder_id", this.data.path_list[this.data.path_list.length - 1].id);
            this.Api.post("fileSaveInfo", formData, 
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            ).then(res => {
                if (res.data.status) {
                    Toast(res.data.message)
                    this.getIndexGetList(this.$store.state.nodeInfo.nodeId[this.$store.state.nodeInfo.nodeId.length - 1])
                    this.showMore = false
                }
                Toast(res.data.message)
            })
        },

        // 新建/重命名文件夹
        addFolder () {
            // type: 1 文件夹 2 文件
            if (this.currentItem.type == 2) {
                let params = {
                    file_id: this.currentItem.id,
                    name: this.newFolderName
                }
                this.Api.post('fileUpdateFile', params).then(res => {
                    if (res.data.status) {
                        this.newFolderFlag = false
                        this.newFolderName = ''
                        this.getIndexGetList(this.$store.state.nodeInfo.nodeId[this.$store.state.nodeInfo.nodeId.length - 1])
                    }
                    Toast(res.data.message)
                })
            } else {
                let subItems = {
                    parentid: this.data.path_list[this.data.path_list.length - 1].id,
                    name: this.newFolderName,
                    id: this.currentItem.id
                }
                // addChangeFlag: true: 新增文件夹， false: 重命名文件夹
                if (this.addChangeFlag) { 
                    delete subItems.id
                }
                this.Api.post('folderUpdateFolder', subItems).then(res => {
                   if (res.data.status) {
                       this.newFolderFlag = false
                       this.newFolderName = ''
                       this.getIndexGetList(this.$store.state.nodeInfo.nodeId[this.$store.state.nodeInfo.nodeId.length - 1])
                   }
                    Toast(res.data.message)
                })
            }
        },

        // 搜索文件/文件夹
        searchFile () {
            this.getIndexGetList('', this.searchVal)
        },

        // 取消搜索
        cancel () {
            let id = this.$store.state.nodeInfo.nodeId[this.$store.state.nodeInfo.nodeId.length - 1]
            this.searchVal = ''
            this.status = 1
            this.getIndexGetList(id)
        },

        // 更多
        moreOption () {
            this.showMore = true
        },

        // 选择菜单项
        chooseOption (key) {
            this.showMore = false
            switch (key) {
                // 最近浏览
                case 'view_list':   
                   this.$router.push('/recentBrowsing')
                    break
                // 新建文件夹
                case 'create_folder':  
                    this.newFolderFlag = true
                    this.addChangeFlag = true
                    break
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
                // 权限管理
                case 'auth_set':    
                    this.$router.push(`/jurisdiction/index?data=${JSON.stringify(options)}`)
                    break
                // 删除
                case 'delete_item':
                    Dialog.confirm({
                        title: '',
                        message: item.type == 1 ? '是否删除该文件夹？' : '是否删除该文件？',
                        confirmButtonColor: '#3875C6',
                        className: 'confirm'
                    }).then(() => {
                        if (item.type == 1) {
                            parmas.folder_ids.push(item.id)
                        } else {
                            parmas.file_ids.push(item.id)
                        }
                        this.Api.post('folderBatchDelFile', parmas).then(res => {
                            if (res.data.status) {
                                this.getIndexGetList(this.$store.state.nodeInfo.nodeId[this.$store.state.nodeInfo.nodeId.length - 1])
                            }
                            Toast(res.data.message)
                        })
                    }).catch(() => {
                        // on cancel
                    });
                    break
                // 重命名
                case 'rename_item':
                    this.currentItem = item // 赋值当前选中的文件或文件夹
                    this.addChangeFlag = false // 设置为重命名
                    this.newFolderFlag = true  // 显示弹窗
                    item.show = false // 关闭文件操作弹窗
                    this.newFolderName = item.short_name // 文件名回显
                    this.$nextTick(() => {
                        this.$refs.getFocus.focus()
                    })
                    break
                // 移动
                case 'remove_item':
                    this.$router.push(`/move?options=${JSON.stringify(item)}`)
                    break
            }
        },
        
        // 取消新建/重命名文件夹
        cancelCreateFolder () {
            this.newFolderName = ''
            this.newFolderFlag = false
        },

         // 回退
        backOff () {
            if (this.$store.state.nodeInfo.nodeId.length) {
                let id = this.$store.state.nodeInfo.nodeId[this.$store.state.nodeInfo.nodeId.length - 2]
                this.getIndexGetList(id, this.searchVal, 2)
            } else {
                if (this.searchVal) {
                    this.cancel()
                    return
                }
                this.$router.go(-1)
            }
        },

        // 点击搜索input框聚焦
        clickSearch () {
            this.status = 2
            this.$nextTick(() => {
                this.$refs.searchFocus.focus()
            })
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
        
        // 销毁vueX中的数据
        destroyed () {
            this.$store.commit('nodeInfo/reduceId')
        },
    },
}
</script>

<style lang="scss" scoped>
.home{
    box-sizing: border-box;
    padding-top: 91px;
    font-size: 30px;
    >.top {
        position: fixed;
        top: 0;
        width: 100%;
        height: 91px;
        line-height: 91px;
        padding: 16px 25px 14px 30px;
        border-bottom: 1px solid #eee;
        box-sizing: border-box;
        z-index: 99;
        background: #fff;
        .reveal {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            img {
                width: 40px;
                height: 40px;
            }
            .t_left, .t_right {
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
                        font-family: PingFang SC;
                        font-weight: bold;
                        color: #333333;
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
                    margin-left: 30px;
                }
                .van-overlay {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    .newFileBox {
                        background: #fff;
                        border-radius: 20px;
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
                                >.inp {
                                    input {
                                        width: 480px;
                                        color: #999999;
                                        background: #EEEEEE;
                                        border-radius: 10px;
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
                            >.btn {
                                width: 100%;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                border-top: 1px solid #e5e5e5;
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
        }
        .search {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            input {
                width: 434px;
                height: 60px;
                box-sizing: border-box;
                font-size: 26px;
                color: #333;
                padding: 25px 17px;
                border: 1px solid #EEEEEE;
                background: #EEEEEE;
                border-radius: 10px;
                &::-webkit-input-placeholder { /* WebKit browsers 适配谷歌 */
                   color: #999999;
                }
                &:-moz-placeholder { /* Mozilla Firefox 4 to 18 适配火狐 */
                   color: #999999;
                }
                &::-moz-placeholder { /* Mozilla Firefox 19+ 适配火狐 */
                   color: #999999;
                }
                &:-ms-input-placeholder { /* Internet Explorer 10+  适配ie*/
                   color: #999999;
                }
            }
            .btn {
                button {
                    width: 110px;
                    height: 60px;
                    margin-left: 18px;
                    border-radius: 10px;
                }
            }
        }
    }
    .searchShow {
        height: 110px;
        line-height: 110px;
    }
    .main {
        margin-top: 20px;
        .section {
            display: flex;
            align-items: center;
            font-size: 30px;
            font-family: PingFang SC;
            font-weight: bold;
            color: #333333;
            img {
                width: 23px;
                height: 14px;
                margin-right: 15px;
            }
        }
        ::v-deep .van-collapse-item__content {
            padding: 0;
            padding-top: 30px;
            .single {
                .smallbox {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0px 30px 50px 66px;
                    .s_left {
                        display: flex;
                        align-items: center;
                        img {
                            width: 40px;
                            height: 40px;
                            margin-right: 16px;
                        }
                        span {
                            display: inline-block;
                            max-width: 65vw;
                            overflow: hidden;
                            text-overflow:ellipsis;
                            white-space: nowrap;
                        }
                    }
                    img {
                        width: 60px;
                        height: 30px;
                    }
                }
            }
        }
    }
    .van-overlay {
        z-index: 99;
    }

    .pic {
        position: fixed;
        bottom: 191px;
        animation: entry 0.5s forwards;
        width: 100px;
        height: 100px;
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
}
@import '@/assets/css/com.scss';
</style>