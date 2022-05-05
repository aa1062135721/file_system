<template>
    <div class="jurisdictionEdit">
        <div class="main">
            <div class="single" v-for="(item, index) in list" :key="index" @click="setting(item)">
                <div class="left">
                    <span>{{item.name}}</span>
                </div>
                <div class="right">
                    <img  v-if="item.checked" src="@/assets/images/icon_choose.png">
                </div>
            </div>
        </div>
        <div class="btn">
            <button @click="goBack">返回</button>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant';
export default {
    data () {
        return {
            list: [],
            info: {},
            type: 0,  // 类型（1：文件夹，2：文件）
        }
    },

    mounted () {
        this.list = JSON.parse(this.$route.query.options)
        this.info = JSON.parse(this.$route.query.info)
        this.type = this.$route.query.type
        this.list.map(res => {
            this.$set(res, 'checked', false)
            if (this.info.auth == res.id) {
                this.$set(res, 'checked', true)
            }
           if (res.name.indexOf('/') > -1) {
               res.name = res.name.replace(/\//g, '&')
           }
        })
    },

    methods: {
        setting (item) {
            this.clearAllChecked()
            item.checked = !item.checked
            this.Api.post("authEditAuthById", {id: this.info.id, type: this.type, auth: item.id}).then(res => {
                if (res.data.status) {
                    Toast(res.data.message)
                }
            })
        },

        goBack () {
            this.$router.go(-1)
        },

        clearAllChecked () {
            this.list.map(res => {
                res.checked = false
            })
        }
    },
}
</script>

<style lang="scss" scoped>
.jurisdictionEdit {
    width: 100%;
    min-height: calc(100vh - 140px);
    background: #f5f5f5;
    padding-bottom: 140px;
    .main {
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
</style>