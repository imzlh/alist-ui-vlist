<script lang="ts" setup>
    import { onUnmounted, ref, watch } from 'vue';
    import AList, { Alist_ConfigGroup_Names } from './alist';
import { Global } from '@/utils';

    const config = ref(await Promise.all(
        [
            Alist_ConfigGroup_Names.站点,
            Alist_ConfigGroup_Names.全局,
            Alist_ConfigGroup_Names.其他
        ].map(item => AList.get_config_group(item))
    )), USE_TEXTAREA = [
        'privacy_regs',
        'customize_head',
        'customize_body',
        'hide_files',
        'announcement',
        'robots_txt'
    ];

    const changed = ref(false);
    watch(config, () => changed.value = true, { deep: true });

    onUnmounted(() => changed.value && (async function(){
        for(const item of config.value)
            await AList.save_config_groups(item);
        Global('ui.message').call({
            "type": "success",
            "title": "aList",
            "timeout": 5,
            "content": {
                "title": "保存成功",
                "content": "配置已同步到数据库"
            }
        });
    })());

</script>

<template>
    <div class="config-wrapper use_alist_ui">
        <template v-for="(data, i) in config">
            <h3>{{ Alist_ConfigGroup_Names[i] }}</h3>
            <template v-for="item in data">
                <div class="group" :data-group="item.group" :data-key="item.key">
                    <span>{{ item.key }}</span>
                    <select v-if="item.type == 'select'" v-model="item.value">
                        <option v-for="opt in item.options.split(',')" :value="opt">{{ opt }}</option>
                    </select>
                    <input type="number" v-else-if="item.type == 'number'" v-model="item.value">
                    <input type="checkbox" v-else-if="item.type == 'bool'" v-model="item.value">
                    <textarea rows="5" v-else-if="USE_TEXTAREA.includes(item.key)" v-model="item.value" />
                    <input type="text" v-else :disabled="item.key == 'version'" v-model="item.value" />
                    <div>{{ item.help }}</div>
                </div>
            </template>
        </template>
    </div>
</template>

<style lang="scss">
    .config-wrapper {
        margin: auto;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 2rem 3rem;
        box-sizing: border-box;

        > h3{
            margin-top: 2rem;
        }

        >div.group {
            padding: .35rem .5rem;

            >span {
                font-size: .85rem;
            }

            >div {
                font-size: .75rem;
                color: rgb(191 191 191);
            }
        }
        
    }
</style>