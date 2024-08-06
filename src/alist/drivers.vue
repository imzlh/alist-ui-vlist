<script lang="ts" setup>
    import { Global } from '@/utils';
    import AList, { type Alist_Driver_Current_Config } from '@/alist/alist';
    import { ref, shallowRef, type Component } from 'vue'
    import I_ALIST from '/images/app/alist.svg';
    import Create from './create.vue';
    import { alistDrvSetting } from './adc2sc';

    const drv = shallowRef(await AList.get_driver());

    function open(app: Component, name: string){
        Global('ui.window.add').call({
            name,
            "content": app,
            "icon": I_ALIST
        });
    }

    const reload = () => AList.get_driver().then(data => drv.value = data);
</script>

<template>
    <div class="alist-drvs-container">
        <div class="add" @click="open(Create, '创建存储')">
            <svg viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5a.5.5 0 0 0-1 0v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1Z"/>
                <path fill-rule="evenodd" d="M12.096 6.223A4.92 4.92 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.493 4.493 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.525 4.525 0 0 1-.813-.927C8.5 14.992 8.252 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.552 4.552 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10c.262 0 .52-.008.774-.024a4.525 4.525 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777ZM3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4Z"/>
            </svg>
        </div>
        <div class="drvlist">
            <div v-for="driver in drv" @click="alistDrvSetting(driver)">
                <h3>{{ driver.mount_path }}</h3>
                <div class="tags">
                    <div class="drv">{{ driver.driver }}</div>
                    <div class="status" :disabled="driver.disabled">
                        {{ driver.status }}
                    </div>
                    <div v-if="driver.enable_sign" class="sign">
                        需要签名
                    </div>
                </div>
                <div class="action" @click.stop>
                    <div class="enable" v-if="driver.disabled" @click="AList.set_driver_state(driver.id, true).then(() => reload())">
                        <svg fill="green" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                        </svg>
                    </div>
                    <div class="disable" v-else @click="AList.set_driver_state(driver.id, false).then(() => reload())">
                        <svg fill="#f6df81" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                        </svg>
                    </div>
                    <div class="edit" @click="alistDrvSetting(driver)">
                        <svg fill="#e793ea" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                        </svg>
                    </div>
                    <div class="delete" @click="AList.rm_driver(driver.id).then(() => reload())">
                        <svg fill="#fa8917" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .alist-drvs-container{
        background-color: whitesmoke;
        height: 100%;
        position: relative;

        > .add{
            position: absolute;
            right: 1rem;
            bottom: 1rem;
            cursor: pointer;
            background-color: white;
            box-shadow: 0 0 .55rem .1rem rgba(212, 212, 212, 0.5);
            border-radius: .35rem;
            padding: .35rem;

            > svg{
                display: block;
                fill: #52ce6a;
                width: 1.35rem;
                height: 1.35rem;
            }
        }

        > .drvlist {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            width: 100%;
            max-width: 25rem;
            min-height: 10rem;
            max-height: 20rem;
            padding: .35rem;
            border-radius: .45rem;

            display: flex;
            gap: .25rem;
            flex-wrap: wrap;

            > *{
                position: relative;
                padding: .9rem;
                border-radius: .5rem;

                > h3{
                    margin: 0.5rem .25rem;
                    font-size: 1rem;
                    font-weight: 400;
                    color: #1ba0d2;
                }

                &:hover > .action{
                    opacity: 1 !important;
                }

                > .action{
                    display: flex;
                    opacity: 0;
                    padding: .1rem;
                    gap: .1rem;
                    border-radius: .35rem;
                    background-color: white;
                    border: solid .1rem rgb(230, 230, 230);

                    position: absolute;
                    bottom: .35rem;
                    right: .35rem;

                    transition: all .2s;

                    > div{
                        padding: .3rem;
                        border-radius: .2rem;
                        transition: all .2s;

                        &:hover{
                            background-color: rgb(239, 239, 239);
                        }

                        > svg{
                            display: block;
                            width: 1rem;
                            height: 1rem;
                        }
                    }
                }

                > .tags{
                    display: flex;
                    gap: .3rem;
                    font-size: .7rem;

                    > div{
                        padding: 0.15rem .25rem;
                        min-width: 2.5rem;
                        text-align: center;
                        border-radius: 0.2rem;
                    }

                    > .drv{
                        background-color: rgb(100, 211, 244);
                        color: white;
                    }

                    > .status[disabled=true]{
                        background-color: rgb(252, 189, 72);
                        color: white;
                    }
                    
                    > .status[disabled=false]{
                        background-color: rgb(205, 248, 193);
                    }

                    > .sign{
                        background-color: rgb(254, 191, 254);
                    }
                }

                &:hover{
                    background-color: #fafafa;
                }
            }

            
        }
    }
</style>