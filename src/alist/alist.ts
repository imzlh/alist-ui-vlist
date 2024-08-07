import { Global, splitPath } from "@/utils";
import { getConfig, regConfig } from "../utils/config";
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

export enum Alist_ConfigGroup_Names{
    "基础",
    "站点",
    "样式",
    "预览",
    "全局",
    "其他",
    null,
    "单点登录",
    "LDAP登录",
    "对象存储"
}

export interface Alist_Config_Group{
    flag: number;
    group: number
    help: string;
    key: string;
    options: string;
    type: "string" | "number" | "bool" | "select";
    value: string;
}

export enum Alist_Order_by{
    "名称",
    "大小",
    "修改时间"
}

export interface Alist_Driver_Create_Param{
    "id"?: number,
    "mount_path": string,
    "order"?: Alist_Order_by,
    "remark"?: string,   // 备注名
    "cache_expiration"?: number,
    "web_proxy": boolean,
    "webdav_policy"?: '302_redirect' | 'use_proxy_url' | 'native_proxy',
    "down_proxy_url"?: string,
    "extract_folder": "front" | "back",
    "enable_sign": boolean,
    "driver": string,
    "order_by": "name" | "size" | "modified",
    "order_direction": "asc" | "desc",
    "addition": StringJSON
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

export enum Alist_Task_Status{
    "等待中",
    "进行中",
    "成功",
    "取消中",
    "已取消",
    "错误",
    "失败回滚中",
    "失败",
    "重试中",
    "重试回滚中",
}

export interface Alist_Task_Item{
    error: string;
    id: string;
    name: string
    progress: number;
    state: Alist_Task_Status
    status: string;
    done: boolean;
}

export enum Alist_Task_Type{
    "upload",
    "offline_download_transfer",
    "offline_download",
    "copy"
}

export enum UserRole {
    GENERAL,
    GUEST,
    ADMIN,
}

export interface Alist_User_Profile {
    id: number
    username: string
    password: string
    base_path: string
    role: UserRole
    permission: number
    sso_id: string
    disabled: boolean
}

export class Alist_User_Class{
    private user: Alist_User_Profile
    constructor(user: Alist_User_Profile){
        this.user = user
    }

    get raw(){
        return this.user;
    }

    get username(){
        return this.user.username
    }

    get base_path(){
        return this.user.base_path
    }

    get id(){
        return this.user.id
    }

    get disabled(){
        return this.user.disabled
    }

    get is_guest(){
        return this.user.role === UserRole.GUEST
    }

    get is_admin(){
        return this.user.role === UserRole.ADMIN
    }
    
    get is_general(){
        return this.user.role === UserRole.GENERAL
    }

    can(permission: number){
        return this.is_admin || ((this.user.permission >> permission) & 1) == 1
    }

    get can_see_hides(){
        return this.is_admin || (this.user.permission & 1) == 1
    }

    get can_access_without_password(){
        return this.is_admin || ((this.user.permission >> 1) & 1) == 1
    }

    get can_offline_download_tasks(){
        return this.is_admin || ((this.user.permission >> 2) & 1) == 1
    }

    get can_write(){
        return this.is_admin || ((this.user.permission >> 3) & 1) == 1
    }

    get can_rename(){
        return this.is_admin || ((this.user.permission >> 4) & 1) == 1
    }

    get can_move(){
        return this.is_admin || ((this.user.permission >> 5) & 1) == 1
    }

    get can_copy(){
        return this.is_admin || ((this.user.permission >> 6) & 1) == 1
    }

    get can_remove(){
        return this.is_admin || ((this.user.permission >> 7) & 1) == 1
    }

    get can_webdav_read(){
        return this.is_admin || ((this.user.permission >> 8) & 1) == 1
    }

    get can_webdav_manage(){
        return this.is_admin || ((this.user.permission >> 9) & 1) == 1
    }
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

    async create_driver(name: string, config: Alist_Driver_Create_Param): Promise<number>{
        return await this.__request('admin/storage/create', 'POST', config);
    },

    async update_driver(config: Alist_Driver_Create_Param): Promise<number>{
        return await this.__request('admin/storage/update', 'POST', config);
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

    async get_profile(user?: number): Promise<Alist_User_Class>{
        let res;
        if(user) res = await this.__request('admin/user/get?id=' + user, 'GET');
        else res = await this.__request('me', 'GET');
        return new Alist_User_Class(res);
    },

    update_self_profile(username: string, password: string): Promise<void>{
        return this.__request('me/update', 'POST', {
            password,
            sso_id: "",
            username
        });
    },

    update_profile(data: Alist_User_Profile): Promise<void>{
        return this.__request('admin/user/update', 'POST', data);
    },

    async get_all_profile(): Promise<Array<Alist_User_Class>>{
        const data = await this.__request('admin/user/list', 'GET');
        return data.content.map((item: Alist_User_Profile) => new Alist_User_Class(item));
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

    rename_all(source_dir: string, fileList: Record<string, string>){
        return this.__request('fs/batch_rename', 'POST', {
            rename_objects: Object.entries(fileList).map(([old_name, new_name]) => ({
                src_name: old_name,
                new_name: new_name
            })),
            src_dir: source_dir
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
    },

    rm_driver(id: number){
        return this.__request('admin/storage/delete?id=' + id, 'POST');
    },

    set_driver_state(id: number, enable = true){
        return this.__request('admin/storage/' + (enable? 'enable' : 'disable') + '?id=' + id, 'POST');
    },

    get_config_group(group: Alist_ConfigGroup_Names): Promise<Array<Alist_Config_Group>>{
        return this.__request('admin/setting/list?group=' + group, 'GET');
    },

    save_config_groups(data: Array<Alist_Config_Group>){
        return this.__request('admin/setting/save', 'POST', data);
    },

    get_available_downloader(): Promise<Array<string>>{
        return this.__request('public/offline_download_tools', 'GET');
    },

    download(urls: Array<string>, dir: string, delete_policy: 
        "delete_on_upload_succeed" |
        "delete_on_upload_failed" |
        "delete_never" |
        "delete_always" = "delete_on_upload_failed",
        tool: string | "SimpleHttp"
    ): Promise<Array<Alist_Config_Group>>{
        return this.__request('fs/add_offline_download', 'POST', {
            delete_policy,
            path: dir,
            tool,
            urls
        })
    },

    async get_tasks(type: Alist_Task_Type = Alist_Task_Type.offline_download_transfer): Promise<Array<Alist_Task_Item>>{
        return (await this.__request(`admin/task/${Alist_Task_Type[type]}/undone`, 'GET')).map((item: Object) => ({...item, done: false}))
            .concat((await this.__request(`admin/task/${Alist_Task_Type[type]}/done`, 'GET')).map((item: Object) => ({...item, done: true})));
    },

    task_action(action: "delete" | "cancel" | "retry", type: string, id: string){
        return this.__request(`admin/task/${type}/${action}?id=${id}`, 'POST');
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