import type { SettingItem } from "@/env";
import Setting from "@/module/setting.vue";
import { Global, type SettingObject } from "@/utils";
import type { Alist_Driver_Config, Alist_Driver_Current_Config } from "@/utils/alist";
import I_ALIST from "/images/app/alist.svg";
import AList from "@/utils/alist";
import { computed, markRaw, reactive, ref } from "vue";

const atype2stype = {
    "string": "text",
    "number": "number",
    "bool": "check",
    "select": "select"
};

export async function alistDrvSetting(drv: Alist_Driver_Current_Config, template?: Alist_Driver_Config){
    const configs = [] as Array<SettingItem | string>;
    template = template || (await AList.get_driver_template())[drv.driver];
    
    const exports = reactive<Record<string, string | number | boolean>>({});


    configs.push('基础设置');
    for(const item of template.common){
        exports[item.name] = (drv as any)[item.name] || item.default;
        configs.push({
            "key": item.name,
            "type": atype2stype[item.type] as 'text'|'number'|'check'|'select',
            "name": item.name,
            "desc": item.help,
            "item": item.options.split(',').map((val, index) => ({
                display: index.toString(),
                value: val
            })),
            "value": computed({
                get: () => exports[item.name],
                set: (val) => exports[item.name] = val
            })
        } as any );
    }

    configs.push('高级设置');

    for(const item of template.additional){
        exports[item.name] = (drv as any)[item.name] || item.default;
        configs.push({
            "key": item.name,
            "type": atype2stype[item.type] as 'text'|'number'|'check'|'select',
            "name": item.name,
            "desc": item.help,
            "item": item.options.split(',').map((val, index) => ({
                display: index.toString(),
                value: val
            })),
            "value": computed({
                get: () => exports[item.name],
                set: (val) => exports[item.name] = val
            })
        } as any);
    }

    return {
        "key": "",
        "name": '#' + drv.id + "驱动设置",
        "type": "object",
        "child": markRaw(configs)
    } satisfies SettingObject
}