import { Global, splitPath } from "@/utils";
import { getConfig, regConfig } from "./config";
import { APP_API } from "/config";
import jsSHA from "jssha";
import { Marked } from "marked";

type StringBool = "true" | "false";
type StringNumber = string;
type StringJSON = string;
type Driver = 'local';

export interface Alist_Setting {
    allow_indexed: StringBool;
    allow_mounted: StringBool;
    announcement: string;
    audio_autoplay: StringBool;
    audio_cover: string
    auto_update_index: StringBool;
    default_page_size: StringNumber;
    external_previews: StringJSON
    favicon: string
    filename_char_mapping: StringJSON
    forward_direct_link_params: StringBool;
    hide_files: string
    home_container: string
    home_icon: string
    iframe_previews: StringJSON;
    ignore_direct_link_params: string,
    ldap_login_enabled: StringBool;
    ldap_login_tips: string;
    logo: string;
    main_color: string;
    ocr_api: string;
    package_download: StringBool;
    pagination_type: "all" | "page" | "none";
    robots_txt: string;
    search_index: "none" | "all";
    settings_layout: "list" | "grid";
    site_title: string;
    sso_compatibility_mode: StringBool;
    sso_login_enabled: StringBool;
    sso_login_platform: string
    version: string;
    video_autoplay: StringBool;
    webauthn_login_enabled: StringBool;
}

export interface Alist_User {
    base_path: string;
    disabled: boolean;
    id: number;
    otp: number;
    password: string;
    permission: number;
    role: number;
    sso_id: string;
    username: string;
}

export interface Alist_Stat{
    created: string;
    hash_info: null | string;
    hashinfo: "null" | string;
    header: string;
    is_dir: boolean;
    modified: string;
    name: string;
    provider: 'unknown' | Driver;
    raw_url: string;
    readme: string;
    related: null | string;
    sign: string;
    size: number;
    thumb: string
    type: number;
}

export interface Alist_ListDir{
    content: Array<Alist_Stat>
    header: string
    provider: string
    readme: string
    total: number
    write: boolean
}

export interface AList_Driver_Config_Item {
    "name": string,
    "type": "string" | "number" | "bool" | "select",
    "default": StringBool | StringNumber | string,
    "options": string,  // only for select, dot separated
    "required": true,
    "help": string
}

export interface Alist_Driver_Config{
    "common": Array<AList_Driver_Config_Item>,
    "additional": Array<AList_Driver_Config_Item>,
    "config": {
        "name": string, // driver name
        "local_sort": boolean,
        "only_local": boolean,
        "only_proxy": boolean,
        "no_cache": boolean,
        "no_upload": boolean,
        "need_ms": boolean,
        "default_root": StringNumber,
        "alert": string
    }
}

export interface Alist_Driver_Current_Config{
    addition : string;
    cache_expiration: number;
    disabled: boolean;
    down_proxy_url: string; // for webdav_policy = use_proxy_url
    driver: string
    enable_sign: boolean;
    extract_folder: "front" | "back";
    id: number;
    modified: string;
    mount_path: string;
    order: string;
    order_by: "name" | "size" | "modified";
    order_direction: "asc" | "desc";
    proxy_range: boolean;
    remark: string;
    status: "work" | "disabled" | "error"
    web_proxy: boolean;
    webdav_policy:  "native_proxy" | "use_proxy_url"
}

const AList ={

    /**
     * @private
     */
    jwt_key: '',

    /**
     * @private
     */
    config: {} as Alist_Setting,

    async __request(path: string, method: 'GET' | 'POST', data?: Object){
        const json = await (await fetch(APP_API + path, {
            method,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": this.jwt_key
            },
            body: data? JSON.stringify(data) : null
        })).json();
        if(json.code != 200)
            throw new Error(json.message);
        return json.data;
    },

    get_setting(): Promise<Alist_Setting>{
        return this.__request('public/settings', 'GET');
    },

    get_user(): Promise<Alist_User>{
        return this.__request('me', 'GET');
    },

    get_downloader(): Promise<Array<string>>{
        return this.__request('public/offline_download_tools', 'GET');
    },

    get_driver_names():Promise<string>{
        return this.__request('admin/driver/names', 'GET');
    },

    drv_templates: null as null | Record<string, Alist_Driver_Config>,

    async get_driver_template():Promise<Record<string, Alist_Driver_Config>>{
        if(!this.drv_templates) this.drv_templates = await this.__request('admin/driver/list', 'GET');
        return this.drv_templates as Record<string, Alist_Driver_Config>;
    },

    async add_driver(name: string, config: Record<string, string | number | boolean>): Promise<number>{
        return (await this.__request('admin/driver/add', 'POST', config)).id;
    },

    async get_driver(): Promise<Array<Alist_Driver_Current_Config>>{
        return (await this.__request('admin/storage/list', 'GET')).content;
    },

    stat(path: string): Promise<Alist_Stat>{
        return this.__request('public/stat', 'GET');
    },

    listdir(path: string, password?: string, refresh = false): Promise<Alist_ListDir>{
        return this.__request('fs/list', 'POST', {
            page: 1,
            password,
            path,
            per_page: 1000,
            refresh
        });
    },

    async login(username: string, password: string): Promise<void>{
        // sha256加密
        const sha = new jsSHA("SHA-256", "TEXT");
        sha.update(password + '-https://github.com/alist-org/alist');
        this.jwt_key = (await this.__request('auth/login/hash', 'POST', {
            username,
            password: sha.getHash("HEX")
        })).token;
    },

    async delete(paths: Array<string>){
        // 寻找dir相同的路径
        const path_prefix = {} as Record<string, Array<string>>;
        for(const path of paths){
            const { dir, fname } = splitPath({ path });
            if(dir in path_prefix)
                path_prefix[dir].push(fname);
            else
                path_prefix[dir] = [fname];
        }
        // 执行
        for(const [dir, names] of Object.entries(path_prefix)){
            await this.__request('fs/remove', 'POST', {
                dir,
                names
            });
        }
    },

    mkdir(path: string){
        return this.__request('fs/mkdir', 'POST', {
            path
        });
    },

    rename(path: string, new_fname: string){
        return this.__request('fs/rename', 'POST', {
            path,
            name: new_fname
        });
    },

    async move(src: Array<string>, dst_dir: string){
        // 提取src目录一致的

        const src_prefix = {} as Record<string, Array<string>>;
        for(const path of src){
            const { dir, fname } = splitPath({ path });
            if(dir in src_prefix)
                src_prefix[dir].push(fname);
            else
                src_prefix[dir] = [fname];
        }
        // 执行
        for(const [dir, names] of Object.entries(src_prefix)){
            await this.__request('fs/move', 'POST', {
                src_dir: dir,
                dst_dir,
                names
            });
        }
    },

    /**
     * 聚合移动
     * @link https://alist.nn.ci/zh/config/side.html
     * @param src_dir 
     * @param dst_dir 
     */
    move_files(src_dir: string, dst_dir: string){
        return this.__request('fs/recursive_move', 'POST', {
            src_dir,
            dst_dir
        });
    },

    copy(src: Array<string>, dst_dir: string){
        // 提取src目录一致的
        const src_prefix = {} as Record<string, Array<string>>;
        for(const path of src){
            const { dir, fname } = splitPath({ path });
            if(dir in src_prefix)
                src_prefix[dir].push(fname);
            else
                src_prefix[dir] = [fname];
        }
        // 执行
        for(const [dir, names] of Object.entries(src_prefix)){
            this.__request('fs/copy', 'POST', {
                src_dir: dir,
                dst_dir,
                names
            });
        }
    },

    rm_empty_dir(src_dir: string){
        return this.__request('fs/remove_empty_directory', 'POST', {
            src_dir
        });
    }
};
export default AList;

regConfig('alist', [
    {
        "name": "账户名",
        "type": "text",
        "default": "",
        "key": "username",
        "desc": "登录Alist账户名"
    },{
        "name": "密码",
        "type": "text",
        "default": "",
        "key": "password",
        "desc": "登录Alist密码"
    }
]);
// 自启动
window.addEventListener('load', async function() {
    const CONFIG = getConfig('alist');
    // 1.获取配置
    AList.config = await AList.get_setting();
    if(AList.config.announcement)
        Global('ui.message').call({
            title: '欢迎来到' + AList.config.site_title,
            content: {
                title: '',
                content: await new Marked().parse(AList.config.announcement)
            },
            type: 'info',
            timeout: 10
        });
    // 2.登录
    if(CONFIG.username.value && CONFIG.password.value) try{
        await AList.login(CONFIG.username.value, CONFIG.password.value);
    }catch(e){
        Global('ui.message').call({
            title: '登录失败',
            content: {
                title: '登录失败',
                content: (e as Error).message
            },
            type: 'error',
            timeout: 5
        });
    }
});