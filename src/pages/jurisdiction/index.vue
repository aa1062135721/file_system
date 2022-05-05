<template>
    <div class="jurisdictionIndex">
        <div class="main">
            <div class="section" v-for="item in data.group_list" :key="item.key">
                <p>{{item.key}}</p>
               <van-swipe-cell  v-for="it in item.list" :key="it.id" class="single">
                    <div class="box disAl" @click="setQx(it)">
                        <div class="left">
                            <img :src="it.oavatar" v-if="it.oavatar">
                            <span>{{it.oname}}</span>
                        </div>
                        <div class="right">
                            <span>
                                {{updateName(it.auth_name, it.auth)}}
                            </span>
                            <img src="@/assets/images/icon_qx_more.png">
                        </div>
                    </div>
                    <template #right>
                        <van-button 
                        square 
                        type="danger" 
                        text="删除" 
                        size="small" 
                        @click="deleteFileQx(it)"/>
                    </template>
                </van-swipe-cell>
            </div>
        </div>
        <div class="btn" v-if="data.auth_list">
            <button @click="goBack">返回</button>
            <button @click="goSet">设置</button>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant'
export default {
    data () {
        return {
            data: {},
            info: {}
        }
    },

    created () {
        this.info = JSON.parse(this.$route.query.data)
        this.getAuthGetInfo(this.info)
    },

    methods: {
        getAuthGetInfo (params) {
            this.Api.get('authGetInfo', params).then(res => {
                if (res.data.status) {
                    this.data = res.data.data
                    sessionStorage.setItem('config_list', JSON.stringify(this.data.config_list))
                } else {
                    Toast.fail(res.data.message);
                }
            })
        },

        // 删除权限
        deleteFileQx (item) {
            this.Api.post('authDeleteById', {id: item.id, type: this.info.type}).then(res => {
                if (res.data.status) {
                    this.getAuthGetInfo(this.info)
                }
                Toast('删除成功')
            })
        },

        // 设置权限
        setQx (item) {
            this.$router.push(`/jurisdiction/edit?options=${JSON.stringify(this.data.config_list)}&info=${JSON.stringify(item)}&type=${this.data.type}`)
        },

        goBack () {
            this.$router.go(-1)
        },

        goSet () {
            this.$router.push(`/jurisdiction/change?list=${JSON.stringify(this.data.tree_list)}&authList=${JSON.stringify(this.data.config_list)}&info=${JSON.stringify(this.info)}`)
        },

        updateName (name, auth) {
            if (auth == 'download') {
                name = '可查看&下载'
            } else if (auth == 'upload') {
                name = "可查看&上传"
            }
            return name
        }
    },
}
</script>

<style scoped lang="scss">
.jurisdictionIndex {
    min-height: 100%;
    width: 100%;
    box-sizing: border-box;
    background: #F5F5F5;
    .main {
        padding-bottom: 140px;
        .section {
            p {
                box-sizing: border-box;
                font-size: 24px;
                font-family: PingFang SC;
                font-weight: bold;
                color: #999999;
                padding: 15px 15px 15px 30px
            }
            .single {
                height: 120px;
                box-sizing: border-box;
                background: #fff;
                padding: 30px 0px 30px 25px;
                .box {
                    justify-content: space-between;
                    box-sizing: border-box;
                    padding-right: 30px;
                    .left {
                        display: flex;
                        align-items: center;
                        height: 70px;
                        img {
                            width: 70px;
                            height: 70px;
                            margin-right: 23px;
                            border-radius: 10px;
                        }
                    }
                    .right {
                        display: flex;
                        align-items: center;
                        font-size: 24px;
                        font-family: PingFang SC;
                        font-weight: 500;
                        color: #999999;
                        img {
                            width: 20px;
                            height: 13px;
                            margin-left: 12px;
                        }
                    }
                }
            }
        }
    }
    .btn {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        padding: 0px 30px;
        button {
            width: 334px;
            height: 88px;
            font-size: 36px;
            font-family: PingFang SC;
            font-weight: 500;
            border: none;
            border-radius: 10px;
            &:first-child {
                color: #3875C6;
                background: #F5F5F5;
                border: 1px solid #3875C6;
                margin-right: 23px;
            }
            &:last-child {
                color: #ffffff;
                background: #3875C6;
            }
        }
    }
}
</style>