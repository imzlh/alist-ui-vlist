<script lang="ts" setup>
    import { reactive, ref, shallowRef } from 'vue';
    import AList, { Alist_User_Class, type Alist_User_Profile } from './alist';
    import { openSetting } from '@/utils';

    const me = await AList.get_profile(),
        permissions  = {
            '可以看到隐藏': me.can_see_hides,
            '无需密码访问': me.can_access_without_password,
            '添加离线下载任务': me.can_offline_download_tasks,
            '创建目录或上传': me.can_write,
            '重命名': me.can_rename,
            '移动': me.can_move,
            '复制': me.can_copy,
            '删除': me.can_remove,
            'Webdav 读取': me.can_webdav_read,
            'Webdav 管理': me.can_webdav_manage
        },
        users = shallowRef<Array<Alist_User_Class>>(),
        change_user = reactive({
            name: me.username,
            password: '',
            ensure_password: ''
        }),
        user_edit = ref<Alist_User_Profile>();

    const offset_map = [
        '可以看到隐藏',
        '添加离线下载任务',
        '创建目录或上传',
        '重命名',
        '移动',
        '复制',
        '删除',
        'Webdav 读取',
        'Webdav 管理'
    ]
        
    const refresh_users = () => AList.get_all_profile().then(data => users.value = data);
    if(me.is_admin) refresh_users();
</script>

<template>
    <div class="user-wrapper">
        <div class="cover">
            <div class="info">
                <div class="avatar">
                    <svg viewBox="0 0 16 16">
                        <path d="M14 9.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-6 5.7c0 .8.8.8.8.8h6.4s.8 0 .8-.8-.8-3.2-4-3.2-4 2.4-4 3.2Z"/>
                        <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5.243c.122-.326.295-.668.526-1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7.81c.353.23.656.496.91.783.059-.187.09-.386.09-.593V4a2 2 0 0 0-2-2H2Z"/>
                    </svg>
                </div>
                <span class="name">{{ me.username }}</span>
                <span class="ban">{{ me.is_admin ? '管理员' : '普通用户' }}</span>
            </div>
        </div>
        <div class="body">
            <div class="permissions">
                <h3>权限</h3>
                <blockquote>
                    <template v-if="me.is_admin">
                        你是管理员，拥有所有权限
                    </template>
                    <template v-else>
                        你不是管理员，拥有以下权限
                    </template>
                </blockquote>
                <table>
                    <tr v-for="(value, key) in permissions">
                        <td><input type="checkbox" :checked="value"></td>
                        <td>{{ key }}</td>
                    </tr>
                </table>
            </div>
            <div class="user-actions use_alist_ui">
                <h3>用户操作</h3>
                <div>
                    <header>修改密码</header>
                    <div>
                        <span class="label">修改用户名</span>
                        <input type="text" v-model="change_user.name">
                        <span class="label">新密码</span>
                        <input type="password" v-model="change_user.password" placeholder="如果您不想更改密码，请保持为空">
                        <span class="label">确认密码</span>
                        <input type="password" v-model="change_user.ensure_password" placeholder="请再次输入新密码">
                        <div>
                            <button :disabled="change_user.password !== change_user.ensure_password"
                                @click="AList.update_self_profile(change_user.name, change_user.password)"
                                danger inline
                            >修改</button>
                            <button @click="$emit('close'); openSetting('alist');" inline>前往登录</button>
                        </div>
                        
                    </div>
                </div>
                <div v-if="me.is_admin">
                    <header>管理用户</header>
                    <div v-if="users">
                        <div class="btn-group">
                            <button inline>添加用户</button>
                            <button inline @click="refresh_users">刷新</button>
                        </div>
                        <ul>
                            <li v-for="user in users" :disabled="user.disabled"
                                @click="user_edit = user.raw" :noclick="user.is_admin"
                            >
                                {{ user.username }}
                                <span class="ban" style="float: right">
                                    {{ user.is_admin ? '管理员' : '用户' }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="uedit-mask" v-show="user_edit"></div>
        <div class="user-edit use_alist_ui" v-if="user_edit">
            <h3>编辑用户{{ user_edit.username }}</h3>
            <span>用户名</span>
            <input type="text" v-model="user_edit.username">
            <span>密码</span>
            <input type="password" v-model="user_edit.password">
            <span>基本路径</span>
            <input type="text" v-model="user_edit.base_path">
            <span>权限</span>
            <div class="word-cloud">
                <span v-for="(desc, offset) in offset_map" 
                    :active="((user_edit.permission >> offset) & 1) == 1"
                    @click="user_edit.permission ^= 1 << offset"    
                >
                    {{ desc }}
                </span>
            </div>
            <span>是否停用</span>
            <input type="checkbox" v-model="user_edit.disabled">
            <div>
                <button info @click="AList.update_profile(user_edit); user_edit = undefined;" inline>提交</button>
                <button danger @click="user_edit = undefined;" inline>取消</button>    
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .user-wrapper {
        height: 100%;

        .ban {
            font-size: .8rem;
            padding: .1rem .35rem;
            border-radius: .15rem;
            color: white;
            background-color: rgb(101, 231, 157)
        }

        > .cover{
            height: 40%;
            width: 100%;
            display: block;
            background-image: linear-gradient(45deg, rgb(175, 159, 255), rgb(120, 226, 255));
            position: relative;

            > .info{
                position: absolute;
                bottom: 0;
                left: 50%;
                width: 80%;
                transform: translateX(-50%);
                max-width: 40rem;
                z-index: 1;

                > .avatar{
                    display: inline-block;
                    border: solid .2rem rgb(160, 223, 245);
                    border-radius: 2rem;
                    box-shadow: 0 0 .5rem rgba(0, 0, 0, .3);
                    margin-right: 1rem;
                    color: white;
                    overflow: hidden;
                    background-color: black;
                    margin-bottom: -1.5rem;

                    > svg{
                        display: block;
                        fill: currentColor;
                        width: 4rem;
                        height: 4rem;
                    }
                }

                > .name{
                    color: #edffff;
                }

                > .name, >.ban{
                    font-size: .9rem;
                    display: inline-block;
                    margin-left: .5rem;
                }
            }
        }

        > .body{
            height: 60%;
            padding: 1rem 2rem;
            box-sizing: border-box;
            overflow-y: auto;
            gap: 1rem;
            max-width: 40rem;
            margin: auto;

            > div{
                flex-grow: 1;
            }

            > .permissions{
                width: 40%;
                float: left;

                > h3{
                    margin-bottom: .5rem;
                }

                > blockquote{
                    margin: 0;
                    padding: 0.35rem 0.25rem 0.35rem 0.5rem;
                    border-left: solid 0.3rem rgb(92, 152, 255);
                    font-size: 0.85rem;
                    background-color: #eff9ff;
                    color: #3a5dbc;
                }

                > table{
                    width: 100%;
                    border-collapse: collapse;
                    font-size: .8rem;

                    > tr{

                        &:not(:last-child){
                            border-bottom: solid .1rem #ccc;
                        }

                        > td{
                            padding: .45rem .25rem;
                            text-align: left;

                            > input[type="checkbox"]{
                                transform: scale(1.1);
                                pointer-events: none;
                            }
                        }
                    }
                }
            }

            > .user-actions{
                padding: 0 0 1rem 1rem;
                box-sizing: border-box;
                width: 60%;
                float: right;

                > h3{
                    margin-bottom: .5rem;
                }

                > div{

                    > header{
                        margin: .35rem 0;
                        padding: .3rem .25rem;
                        font-size: .9rem;
                        border-bottom: solid .1rem rgb(198, 197, 197);
                    }

                    > div{
                        margin-bottom: 1rem;
                        padding-left: .5rem;

                        .label{
                            font-size: .8rem;
                        }

                        > ul{
                            padding: .35rem 0;

                            > li{
                                list-style: none;
                                padding: .35rem .75rem;
                                margin: .25rem 0;
                                border-left: solid .2rem transparent;
                                font-size: .85rem;
                                user-select: none;
                                cursor: pointer;

                                &[disabled=false]{
                                    border-left-color: rgb(60, 193, 60);
                                    --hover: rgb(225, 255, 241);
                                }

                                &[disabled=true]{
                                    border-left-color: rgb(255, 155, 105);
                                    --hover: rgb(255, 242, 242);
                                }

                                &[noclick=true]{
                                    pointer-events: none;
                                    border-left-color: rgb(219, 36, 192);
                                }

                                &:hover{
                                    background-color: var(--hover);
                                }
                            }
                        }
                    }
                }
            }
        }

        > .uedit-mask{
            position: absolute;
            inset: 0;
            background-color: #d8d8d8da;
            z-index: 18;
        }

        > .user-edit{
            position: absolute;
            top: 50%;
            left: 50%;
            max-width: 20rem;
            width: 90%;
            transform: translate(-50%, -50%);
            padding: 1.75rem;
            background-color: white;
            border-radius: .75rem;
            font-size: .85rem;
            z-index: 19;

            > h3{
                font-size: 1.25rem;
                font-weight: 500;
                color: #4428ff;
                margin: 0 0 .75rem 0;
            }

            > .word-cloud{
                > *{
                    padding: .25rem .5rem;
                    display: inline-block;
                    margin: .15rem;
                    box-shadow: .1rem .2rem .35rem #e9e9e9;
                    border-radius: .3rem;
                    color: #b0b0b0;
                    user-select: none;
                    cursor: pointer;
                    transition: all .1s;

                    &[active=true]{
                        background-color: #c2ffe7;
                        box-shadow: none;
                        transform: translate(.1rem, .1rem);
                        color: black;
                    }
                }
            }
        }
    }
</style>