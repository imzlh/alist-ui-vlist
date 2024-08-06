<script lang="ts" setup>
    import { ref, watch } from 'vue';
    import AList, { Alist_Task_Type, type Alist_Task_Item } from './alist';

    const taskName = ref<Alist_Task_Type>(Alist_Task_Type.offline_download_transfer),
        data = ref<Alist_Task_Item[] >();
    let timer: number | undefined;

    watch(taskName, () => {
        timer && clearInterval(timer);
        AList.get_tasks(taskName.value).then(res => data.value = res);
        timer = setInterval(() => AList.get_tasks(taskName.value).then(res => data.value = res), 3000);
    }, { immediate: true });
</script>

<template>
    <div class="task-container">
        <div class="tasks">
            <div v-for="item in data" :key="item.id">
                <h3>{{ item.name }}</h3>
                <div class="progress">
                    <div :style="{ width: `${item.progress}%` }"></div>
                </div>
                <span>{{ item.progress.toFixed(1) }}% / {{ item.status }}</span>
            </div>
        </div>
        <div class="t-tab">
            <template v-for="(val, key) in Alist_Task_Type">
                <div @click="taskName = val"
                    :active="taskName === val" v-if="isNaN(parseInt(key))"
                >{{ key }}</div>
            </template>
            
        </div>
    </div>
</template>

<style lang="scss">
    .task-container {
        display: flex;
        height: 100%;

        > .t-tab{
            width: 10rem;
            border-left: solid .1rem rgb(212, 212, 212);

            > div {
                cursor: pointer;
                padding: 0.5rem .75rem;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;

                &[active=true]{
                    margin-left: -.1rem;
                    background-color: rgb(236, 236, 236);
                    border-left: .2rem rgb(162, 168, 253) solid;
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
                }
            }
        }
    }
</style>