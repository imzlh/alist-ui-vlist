<script lang="ts" setup>
    import { ref, watch, onUnmounted, reactive } from 'vue';
    import AList, { Alist_Task_Status, Alist_Task_Type, type Alist_Task_Item } from './alist';

    const taskName = ref<Alist_Task_Type>(Alist_Task_Type.offline_download_transfer),
        data = ref<Alist_Task_Item[] >(),
        task = reactive({
            url: '',
            type: '',
            display: false,
            path: '/',
        }),
        available_downloader = await AList.get_available_downloader(),
        _prop = defineProps(['visibility']);
    let timer: number | undefined;

    watch(taskName, () => {
        timer && clearInterval(timer);
        AList.get_tasks(taskName.value).then(res => data.value = res);
        timer = setInterval(() => _prop.visibility && AList.get_tasks(taskName.value).then(res => data.value = res), 3000);
    }, { immediate: true });

    onUnmounted(() => clearInterval(timer));
</script>

<template>
    <div class="task-container">
        <div class="tasks">
            <div v-for="item in data" :key="item.id">
                <h3>{{ item.name }}</h3>
                <div class="progress">
                    <div :style="{ width: `${item.progress}%` }"></div>
                </div>
                <span :error="!!item.error">{{ item.progress.toFixed(1) }}% / {{ Alist_Task_Status[item.state] }} {{ item.error }}</span>
                <div class="action">
                    <span v-if="!item.done" @click="AList.task_action('cancel', Alist_Task_Type[taskName], item.id)">取消</span>
                    <span v-if="item.done" @click="AList.task_action('delete', Alist_Task_Type[taskName], item.id)">删除</span>
                    <span v-if="item.done && item.state === Alist_Task_Status.失败" @click="AList.task_action('retry', Alist_Task_Type[taskName], item.id)">重试</span>
                </div>
            </div>
        </div>
        <div class="t-tab">
            <div
                @click="taskName = Alist_Task_Type.offline_download"
                :active="taskName === Alist_Task_Type.offline_download"
            >
                <svg viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.5a.5.5 0 0 1 1 0V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0zm-.354 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V11h-1v3.293l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z"/>
                </svg>
                <span>下载</span>
            </div>
            <div
                @click="taskName = Alist_Task_Type.offline_download_transfer"
                :active="taskName === Alist_Task_Type.offline_download_transfer"
            >
                <svg viewBox="0 0 16 16">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>                </svg>
                <span>下载后同步</span>
            </div>
            <div
                @click="taskName = Alist_Task_Type.copy"
                :active="taskName === Alist_Task_Type.copy"
            >
                <svg viewBox="0 0 16 16">
                    <path d="M16 7.5a2.5 2.5 0 0 1-1.456 2.272 3.513 3.513 0 0 0-.65-.824 1.5 1.5 0 0 0-.789-2.896.5.5 0 0 1-.627-.421 3 3 0 0 0-5.22-1.625 5.587 5.587 0 0 0-1.276.088 4.002 4.002 0 0 1 7.392.91A2.5 2.5 0 0 1 16 7.5z"/>
                    <path d="M7 5a4.5 4.5 0 0 1 4.473 4h.027a2.5 2.5 0 0 1 0 5H3a3 3 0 0 1-.247-5.99A4.502 4.502 0 0 1 7 5zm3.5 4.5a3.5 3.5 0 0 0-6.89-.873.5.5 0 0 1-.51.375A2 2 0 1 0 3 13h8.5a1.5 1.5 0 1 0-.376-2.953.5.5 0 0 1-.624-.492V9.5z"/>
                </svg>
                <span>复制</span>
            </div>
            <div
                @click="taskName = Alist_Task_Type.upload"
                :active="taskName === Alist_Task_Type.upload"
            >
                <svg viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0zm-.5 14.5V11h1v3.5a.5.5 0 0 1-1 0z"/>
                </svg>    
                <span>上传</span>
            </div>
            <span style="flex-grow: 1;"></span>
            <div @click="task.display = true">
                <svg viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                </svg>
                <span>新建下载任务</span>
            </div>
        </div>
        <div class="new-task use_alist_ui" v-show="task.display">
            <h3>添加任务</h3>
            <select v-model="task.type">
                <option :value="downloader" v-for="downloader of available_downloader">{{ downloader }}</option>
            </select>
            <textarea v-model="task.url" cols="5" placeholder="一行一个链接"></textarea>
            <span>下载位置</span>
            <input type="text" v-model="task.path">
            <div class="btns">
                <button @click="task.display = false">取消</button>
                <button info @click="
                    AList.download(task.url.split('\n'), task.path, 'delete_on_upload_succeed', task.type);
                    task.display = false;
                ">确定</button>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .task-container {
        display: flex;
        flex-direction: column;
        height: 100%;

        > .t-tab{
            height: 2rem;
            border-top: solid .1rem rgb(212, 212, 212);
            display: flex;

            > div {
                cursor: pointer;
                padding: 0.5rem .75rem;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                font-size: .85rem;

                display: flex;
                align-items: center;
                gap: .35rem;

                > svg{
                    height: 1rem;
                    width: 1rem;
                    fill: currentColor;
                }

                &[active=true]{
                    margin-top: -.1rem;
                    background-color: rgb(236, 236, 236);
                    border-top: .2rem rgb(162, 168, 253) solid;
                }

                &:hover{
                    background-color: rgb(234, 232, 255);
                }
            }
        }

        > .tasks{
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            flex-grow: 1;
            padding: 3rem 0;

            > div{
                margin: .5rem auto;
                padding: .75rem;
                border-radius: .5rem;
                width: 80%;
                border: solid .1rem #e5e5e5;

                > h3{
                    font-size: .85rem;
                    margin: 0;
                    font-weight: 400;
                    word-break: break-all;
                    max-height: 3rem;
                    overflow: hidden;
                    line-height: 1rem;
                }

                > .progress{
                    margin: .5rem 0;
                    height: .3rem;
                    border-radius: .2rem;
                    background-color: rgb(202, 223, 255);

                    > div{
                        background-color: rgb(84, 151, 252);
                        min-width: .3rem;
                        border-radius: .2rem;
                        height: .3rem;
                    }
                }

                > span{
                    font-size: .8rem;
                    color: #bfb8b8;
                    white-space: nowrap;
                    overflow: hidden;
                    width: 100%;
                    display: block;
                    text-overflow: ellipsis;

                    &[error=true]{
                        color: rgb(255, 176, 127);
                    }
                }

                > div.action{
                    font-size: .85rem;
                    height: 1rem;

                    > *{
                        float: right;
                        margin: 0.25rem;
                        padding: .2rem .5rem;
                        line-height: 1rem;
                        border-bottom: dotted 0.1rem rgb(198, 198, 198);
                        background-color: #f8fcff;
                        user-select: none;
                        cursor: pointer;
                    }
                }
            }
        }

        > .new-task{
            padding: 1rem;
            border-radius: .5rem;
            position: fixed;
            top: 3rem;
            left: 0;
            right: 0;
            max-width: 20rem;
            margin: auto;
            z-index: 50;

            > *{
                margin: .85rem 0;
            }

            > h3{
                font-weight: 400;
                margin: .25rem 0 1rem 0;
                font-size: 1rem;
            }

            > span{
                font-size: .8rem;
            }

            &::before{
                content: '';
                position: fixed;
                inset: 0;
                background-color: rgba(218, 218, 218, 0.4);
                z-index: -1;
            }

            &::after{
                content: '';
                position: absolute;
                inset: 0;
                border-radius: .5rem;
                background-color: white;
                z-index: -1;
            }

            > .btns > button{
                float: right;
            }
        }
    }
</style>