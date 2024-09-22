<script lang="ts" setup>
    import AList, { Alist_Order_by, type AList_Driver_Config_Item, type Alist_Driver_Create_Param } from './alist';
    import { ref, shallowReactive, watch } from 'vue';
    import { _N, _T } from './translate';

    const STEP_TITLES = [
        "欢迎",
        "选择驱动",
        "配置驱动",
        "完成"
    ], atype2stype = {
        "string": "text",
        "number": "number",
        "bool": "check",
        "select": "select"
    };

    const CFG = shallowReactive({
        STEP: 0,
        DRV: null as null | string
    }), config = ref<HTMLElement>(),
    ev = defineEmits(['close']);

    const DRIVES = await AList.get_driver_template();

    function buildOpt(): Array<AList_Driver_Config_Item> {
        if(!CFG.DRV) return [];
        return DRIVES[CFG.DRV].additional.filter(opt => opt.required)
            .concat(DRIVES[CFG.DRV].common.filter(opt => opt.required));
    }

    watch(() => CFG.STEP, step => {
        if(step != 3) return;
        step = 2;   // 固定
        const data = {
                "addition": "",
                "driver": CFG.DRV!,
                "enable_sign": true,
                "extract_folder": "front",
                "mount_path": "/",
                "order_by": "name",
                "order_direction": "asc",
                "order": Alist_Order_by.名称,
                "web_proxy": false
            } satisfies Alist_Driver_Create_Param,
            addition = {} as Record<string, string | number | boolean>;
        const elements = config.value!.querySelectorAll('[data-key]');

        for(const el of elements){
            const key = el.getAttribute('data-key')!;
            const type = el.getAttribute('type') || el.tagName.toLowerCase();
            let val;
            if(type == 'checkbox'){
                val = (el as HTMLInputElement).checked;
            }else{
                val = (el as HTMLInputElement).value;
            }
            if(key in data)
                (data as any)[key] = val;
            else
                addition[key] = val;
        }

        data.addition = JSON.stringify(addition);
        AList.create_driver(CFG.DRV!, data)
            .then(() => {
                CFG.STEP = 3;
                setTimeout(() => ev('close'), 3000);
            })
            .catch(e => postMessage({
                "type": "error",
                "timeout": 10,
                "title": "aListMGR",
                "content": {
                    "title": "创建失败",
                    "content": e instanceof Error ? e.message : new String(e).toString()
                }
            }));
    }, {immediate: true});
</script>

<template>
    <div class="drv-create-container">
        <div class="head">
            <div class="step">
                <span class="current">{{ CFG.STEP + 1 }}</span> / 4
            </div>
            <div class="title">
                {{ STEP_TITLES[CFG.STEP] }}
            </div>
        </div>
        <div class="body">
            <!-- 引导 -->
            <div v-if="CFG.STEP == 0">
                <textarea>
欢迎使用avList 存储驱动创建工具
此工具将引导您快速创建，如果需要定制，请记住前往设置配置更多信息
那么，我们开始吧
                </textarea>
            </div>
            <!-- 选择 -->
            <div v-else-if="CFG.STEP == 1" class="selector">
                <div v-for="(drv, name) in DRIVES" @click="CFG.DRV = name" :active="CFG.DRV == name">
                    <div class="title">{{ _N(drv.config.name) }}</div>
                    <div class="info" v-if="drv.config.alert">{{ drv.config.alert }}</div>
                    <div class="tags">
                        <div v-if="drv.config.no_upload" warn>不能上传</div>
                        <div v-if="drv.config.local_sort" info>本地排序</div>
                        <div v-if="drv.config.only_proxy" info>本地代理</div>
                        <div v-if="drv.config.need_ms" info>需要交互</div>
                    </div>
                </div>
            </div>
            <!-- 设置 -->
            <div v-else-if="CFG.STEP == 2" class="config use_alist_ui" ref="config">
                <template v-if="CFG.DRV">
                    <template v-for="item in buildOpt()">
                        <span>{{ _T(CFG.DRV, item.name) }}</span>
                        <select v-if="item.type =='select'" :data-key="item.name" :required="item.required">
                            <option v-for="opt in item.options.split(',')" :value="opt">{{ opt }}</option>
                        </select>
                        <input type="number" v-else-if="item.type == 'number'" :required="item.required" :data-key="item.name">
                        <input type="checkbox" v-else-if="item.type == 'bool'" :data-key="item.name">
                        <input type="text" v-else :required="item.required" :data-key="item.name" />
                        <div>{{ item.help }}</div>
                    </template>
                </template>
                <div v-else style="text-align: center;">
                    请回退并选择驱动！
                </div>
            </div>
            <!-- 完成 -->
            <div v-else>
                <textarea>
恭喜！驱动{{ _N(CFG.DRV || 'unknown') }}创建成功！
现在，请关闭这个页面，并在设置中完善吧！
感谢使用avList!
                </textarea>
            </div>
        </div>
        <div class="tail">
            <button :disabled="CFG.STEP == 3" @click="CFG.STEP++">下一步</button>
            <button :disabled="CFG.STEP == 0 || CFG.STEP == 3" @click="CFG.STEP--">上一步</button>
        </div>
    </div>
</template>

<style lang="scss" >
    .drv-create-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        display: flex;
        flex-direction: column;
        gap: 1rem;

        *{
            box-sizing: border-box;
        }

        > .head {
            display: flex;

            > .step{
                color: gray;

                > .current {
                    color: rgb(86, 109, 241);
                    font-size: 1.5rem;
                    font-style: italic;
                    font-family: Arial, Helvetica, sans-serif;
                }
            }

            > .title{
                flex-grow: 1;
                font-size: 1.2rem;
                margin-left: 1rem;
                line-height: 1.75rem;
            }
        }

        > .body{
            max-height: 80%;
            overflow: hidden;
            flex-grow: 1;

            > div{
                height: 100%;
                overflow-x: hidden;
                overflow-y: auto;

                > textarea{
                    resize: none;
                    padding: .5rem;
                    width: 100%;
                    height: 100%;
                    outline: none;
                }
            }

            > .selector {
                gap: .5rem;
                border: solid .1rem rgb(211, 211, 211);
                padding: .5rem;
                border-radius: .35rem;

                user-select: none;

                box-shadow: 0px 0px .65rem #dbdbdb inset;
                background-color: rgb(246 250 255);

                > *{
                    padding: .5rem;
                    border-radius: .25rem;
                    box-shadow:0 0 0.65rem rgb(229 229 229);
                    background-color: white;
                    transition: all .2s;
                    margin: .5rem 0;
                    border: solid .1rem transparent;

                    &[active=true]{
                        border-color: rgb(182, 252, 209);
                        background-color: rgb(238 255 251);
                    }

                    > .info{
                        font-size: 0.75rem;
                        color: #aec1df;
                        margin: .35rem 0;
                        border-left: solid .2rem #7092ff;
                        padding: .35rem 0 0 .6rem;
                        background-color: #f2ffff;
                        line-height: 1rem;
                    }

                    > .tags{
                        font-size: .7rem;
                        margin-top: .35rem;

                        > div{
                            padding: .2rem .5rem;
                            min-width: 3rem;
                            display: inline-block;
                            border-radius: .2rem;
                            margin: 0 .2rem;
                            
                            &[info]{
                                background-color: rgb(220, 242, 255);
                            }

                            &[warn]{
                                background-color: rgb(255, 238, 182);
                            }
                        }
                    }

                    &:active{
                        transform: scale(.95);
                    }
                }
            }

            > .config{
                padding: 0 .5rem;

                > span{
                    font-size: .85rem;
                }

                > div{
                    font-size: .75rem;
                    color: rgb(191 191 191);
                }
            }
        }

        > .tail{
            > button{
                float: right;
                min-width: 4rem;
                padding: .35rem .5rem;
                text-align: center;
                background-color: rgb(222 255 247);
                border-radius: .25rem;
                font-size: .8rem;
                margin: 0 .35rem;

                border: none;
                outline: none;
                cursor: pointer;

                &:disabled{
                    pointer-events: none;
                    opacity: .6;;
                }
            }
        }
    }
</style>