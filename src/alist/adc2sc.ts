import type { SettingItem } from "@/env";
import Setting from "@/module/setting.vue";
import { Global, type SettingObject } from "@/utils";
import type { Alist_Driver_Config, AList_Driver_Config_Item, Alist_Driver_Current_Config } from "@/alist/alist";
import I_ALIST from "/images/app/alist.svg";
import AList from "@/alist/alist";
import { computed, markRaw, reactive, ref, type Ref } from "vue";
import { _T } from "./translate";

const atype2stype = {
    "string": "text",
    "number": "number",
    "bool": "check",
    "select": "select"
};

function getItem(
    item: AList_Driver_Config_Item,
    exports: { [key: string]: any, addition: Record<string, any> },
    additional: boolean,
    modified: Ref<boolean>
){
    if(
        (additional && !(item.name in exports.addition)) || 
        (!additional && !(item.name in exports)) 
    ){
        let val;
        if(item.type === 'bool') val = false;
        else if(item.type === 'number') val = 0;
        else if(item.type ==='select') val = item.options.split(',')[0];
        else val = "";
        additional ? (exports.addition[item.name] = val) : (exports[item.name] = val);
    }

    return {
        "key": item.name,
        "type": atype2stype[item.type] as 'text'|'number'|'check'|'select',
        "name": _T(item.name, item.name),
        "desc": item.help,
        "item": item.options.split(',').map(val => ({
            display: _T(item.name, val),
            value: val
        })),
        "step": 1,
        "value": computed({
            get: () => additional ? exports.addition[item.name] : exports[item.name],
            set: (val) => {
                if(item.type == 'number' && typeof val != 'number') val = Number
                additional ? (exports.addition[item.name] = val) : (exports[item.name] = val)
                modified.value = true;
            }
        })
    } as any;
}

export async function alistDrvSetting(drv: Alist_Driver_Current_Config, template?: Alist_Driver_Config){
    const configs = [] as Array<SettingItem | string>;
    template = template || (await AList.get_driver_template())[drv.driver];
    
    const exports = reactive({addition: {}} as any),
        modified = ref(false);

    configs.push('基础设置');
    for(const item of template.common){
        if(item.name == 'mount_path') continue;
        exports[item.name] = (drv as any)[item.name] || item.default;
        configs.push(getItem(item, exports, false, modified));
    }

    configs.push('高级设置');

    exports.addition = JSON.parse(drv.addition || '{}');
    for(const item of template.additional){
        configs.push(getItem(item, exports, true, modified));
    }

    Global('ui.window.add').call({
        "name": "AList驱动配置",
        "icon": I_ALIST,
        "content": Setting,
        "option": {
            "key": "",
            "name": '#' + drv.id + "驱动设置",
            "type": "object",
            "child": markRaw(configs)
        },
        onDestroy(){
            if(!modified.value) return;
            exports.id = drv.id;
            exports.driver = drv.driver;
            exports.mount_path = drv.mount_path;
            exports.addition = JSON.stringify(exports.addition);
            AList.update_driver(exports);
        }
    });
}