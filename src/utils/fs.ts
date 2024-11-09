/**
 * vList FileSystem API 2.0 for aList
 * @copyright 2024 izLab
 * @version 3
 */

import type { FileOrDir, vDir, vFile } from "@/env";
import { isReactive, reactive, ref, type Ref } from "vue";
import { APP_API, FILE_PROXY_SERVER } from "/config";

import I_DESKTOP from '/images/icon/desktop.webp';
import { getConfig } from "./config";
import { alert, getIcon, message } from "@/utils";
import AList from "@/alist/alist";

/**
 * 请求后端出现错误时抛出的错误
 */
class APIError extends Error{}

/**
 * 文件树结构
 */
export const TREE = reactive<vDir>({
    "type": "dir",
    "ctime": 0,
    "name": "/",
    "dispName": "此服务器",
    "url": FILE_PROXY_SERVER,
    "icon": I_DESKTOP,
    "path": "/",
    "mtime": 0,
    // 为了兼容性设置的虚拟父节点
    "parent": {
        "name": "__ROOT__",
        "path": "{vio:0}",
        "url": "",
        "type": "dir",
        "ctime": -1,
        "mtime": -1,
        "icon": "",
        "parent": null,
        "active": new Map()
    },
    "active": new Map()
});
(TREE.parent as vDir).child = [TREE];

/**
 * 清理路径，清除淤积的内容
 * @param path 路径
 * @returns 清理后的路径
 */
export function clearPath(path:string){
    return path.replace('\\','/')
        .replace(/\/+/,'/')
        .replace('/./','/')
        .replace(/\/[\w\W]+\/\.\.\//,'/');
}

/**
 * 分割路径
 * @param f 文件
 * @returns 文件信息
 */
export function splitPath(f: { path: string }){
    const path = clearPath(f.path),
        slash = path.lastIndexOf('/', path.length -2),
        dot = path.lastIndexOf('.');
    return {
        dir   : path.substring(0,slash +1) || '/',
        name  : path.substring(slash + 1, dot == -1 ? undefined : dot),
        ext   : path.substring(dot == -1 ? slash + 1 : dot + 1),
        fname : path.substring(slash + 1)
    }
}

/**
 * 裁剪文件名，方便输出
 * @param file 类文件 vFile
 * @param maxlen 最大长度
 * @returns 裁剪后的文件名
 */
export function clipFName(file:{name: string},maxlen = 20){
    if(file.name.length > maxlen){
        return file.name.substring(0,maxlen - 3) + '...'
    }else{
        return file.name;
    }
}

/**
 * 文件大小转换为字符串
 * @param size 文件大小
 * @returns 文件大小字符串
 */
export function size2str(size: number){
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    for (let i = 0; i < sizes.length; i++)
        if (size / 1024 ** i < 800)
            return (size / 1024 ** i).toFixed(1) + sizes[i];
}

/**
 * 向远程服务器上传文件
 * @param file 文件内容，一般为File对象或Blob对象
 * @param refl 引用文件对象
 * @param option 参数
 * @returns 当上传成功resolve，否则reject
 */
async function upload(file: Blob, refl: vFile, option?: {
    overwrite?: boolean,
    timeout?: number
}){
    AList.upload(file, refl.path, xhr => {
        xhr.addEventListener('load', () => Tree.load(refl.parent!));
        xhr.addEventListener('progress', prog => refl.upload = prog.loaded / prog.total);
        xhr.addEventListener('loadend', () => refl.upload = undefined);
    })
}
const upload_ = upload;

export const encodePath = (path: string) =>
    encodeURI(path).replace('#', '%23').replace('?', '%3F');

namespace Tree{
    /**
     * 加载文件夹
     * @param input 输入文件夹
     * @param quiet 静默模式，不弹出错误提示
     */
    export async function load(input: vDir, quiet = false){
        if(!isReactive(input)) throw new Error('Input is not reactive');
        try{
            // 加载父文件夹
            input.lock = true;
            const _item = (await AList.listdir(input.path)).content.map(item => ({
                    name: item.name,
                    type: item.is_dir ? 'dir' : 'file',
                    ctime: new Date(item.modified).getTime(),
                    icon: getIcon(item.name, !item.is_dir),
                    path: input.path + item.name + (item.is_dir ? '/' : ''),
                    url: input.url + item.name + (item.is_dir ? '/' : '?sign=' + item.sign),
                    parent: input,
                    active: new Map()
                })) as Array<FileOrDir>,
                // 排序
                item = _item.filter(item => item.type == 'dir').sort((a, b) => a.name.localeCompare(b.name))
                    .concat(_item.filter(item => item.type == 'file').sort((a, b) => a.name.localeCompare(b.name)) as any) as Array<FileOrDir>;
            // 变成响应式数据        
            input.child = reactive(item);
        }catch(e){
            quiet && message({
                "type": "error",
                "title": "文件资源管理器",
                "content":{
                    "title": '无法读取文件夹',
                    "content": (e instanceof Error ? e.message : new String(e).toString()) || '未知错误'
                },
                "timeout": 5
            });
        }
        input.lock = false;
    }

    /**
     * 将由服务端生成的数据转换为FileOrDir对象
     * @param input 输入对象
     * @param parent 父节点
     * @returns 转换后的对象
     */
    function compileObject(obj: FileOrDir, parent: vDir){
        obj.parent = parent;
        obj.path = parent.path + obj.name + (obj.type == 'dir' ? '/' : '');
        obj.url = FILE_PROXY_SERVER + encodePath(obj.path);
        obj.parent = parent;
        obj.type == 'dir' && (obj.active = new Map());
        obj.icon = getIcon(obj.name, obj.type == 'file');
        return isReactive(obj) ? obj : reactive(obj);
    }

    /**
     * 获取被选中的文件（夹）
     * @returns 被选中的文件（夹）
     */
    export function getActive(parent = TREE.parent): Array<FileOrDir>{
        const active = [] as Array<FileOrDir>;
        function traverse(tree: vDir){
            if(tree.child)
                for (const item of tree.child)
                    if(tree.active.has(item))
                        active.push(item);
                    else if(item.type == 'dir')
                        traverse(item);
        }
        parent && traverse(parent);
        return active;
    }

    /**
     * 取消所有选中的文件（夹）
     */
    export function clearActive(){
        function traverse(tree: vDir){
            tree.active.clear();
            if(tree.child)
                for (const item of tree.child)
                    if(item.type == 'dir')
                        traverse(item);
        }
        traverse(TREE.parent as vDir);
    }

    /**
     * 获取文件或文件夹信息
     * @param path 路径
     * @param parent 父节点
     * @returns 文件或文件夹信息
     */
    function stat(path: string, parent: vDir): Promise<vFile | vDir> {
        return AList.stat( path ).then(res => compileObject({
            ctime: new Date(res.created).getTime(),
            mtime: new Date(res.modified).getTime(),
            type: res.is_dir ? 'dir' : 'file',
            name: res.name,
            size: res.size,
            url: FILE_PROXY_SERVER + res.raw_url,
            path: clearPath(path),
            parent
        } as FileOrDir, parent));
    }

    /**
     * 补全预设，创建空文件或文件夹
     * @param preset 预设值
     * @returns 新对象
     */
    export function createObject(preset: Partial<FileOrDir> & { type: 'file' }): vFile;
    export function createObject(preset: Partial<FileOrDir> & { type: 'dir' }): vDir;
    export function createObject(preset: Partial<FileOrDir>): FileOrDir;
    export function createObject(preset: Partial<vFile | vDir>){
        // 生成路径
        const path = preset.path ?? (preset.parent
                ? preset.parent.path + preset.name + (preset.type == 'dir' ? '/' : '')
                : ''),
            url = path ? FILE_PROXY_SERVER + encodePath(path) : '';
        if(preset.type == 'dir'){
            var node: FileOrDir = reactive<vDir>({
                ctime: Date.now(),
                mtime: Date.now(),
                type: 'dir',
                name: '',
                parent: null,
                active: new Map(),
                icon: preset.name ? getIcon(preset.name, false) : '',
                ...preset,
                url,path
            });
        }else if(preset.type == 'file'){
            var node: FileOrDir = reactive<vFile>({
                type: 'file',
                ctime: Date.now(),
                mtime: Date.now(),
                name: '',
                parent: null,
                icon: preset.name ? getIcon(preset.name, true) : '',
                size: 0,
                ...preset,
                url, path
            });
        }else{
            throw new Error('Invalid object type (should be file or dir)');
        }

        if(import.meta.env.DEV && !node.parent)
            console.warn('Parent node is required');
        return node;
    }

    /**
     * 在远程服务器中创建文件夹
     * @param name 名称
     * @param parent 父节点
     * @returns 新文件夹
     */
    export async function createDir(name: string[], parent: vDir){
        // 创建文件夹
        for (const n of name)
            await AList.mkdir(parent.path + n);
        // 添加文件夹
        const exports: Array<vDir> = [];
        for(const n of name){
            const obj = createObject({
                type: 'dir',
                name: n,
                parent: parent
            });
            exports.push(obj);
            if(!parent.child) await Tree.load(parent);
            parent.child!.push(obj);
        }
        return exports;
    }

    /**
     * 查找文件或文件夹
     * 注意：有的时候目标同时是文件和文件夹，需要指定类型
     *  但是当指定类型不存在时，会返回第一个匹配的节点
     * @param path 路径
     * @param force 确保这个路径存在，只是被隐藏了
     * @param type 类型，默认为目录
     * @returns 节点信息
     */
    export async function find(
        path: string,
        force = false,                   // 确保这个路径存在，只是被隐藏了
        type: 'dir' | 'file' = 'dir',    // 有的时候目标同时是文件和文件夹
        create_on_miss = false           // 当找不到文件夹时，是否创建
    ) {
        const paths = clearPath(path).split('/').filter(Boolean),
            name = paths.pop()!;

        let node = TREE;
        if(paths.length == 0 && !name) return { parent: node.parent!, index: 0, file: node };

        for(const part of paths){
            // 刷新子节点
            if(!node.child)
                await load(node);

            // 找到目标节点
            const index = node.child!.findIndex(c => c.name == part && c.type == 'dir');
            if(index == -1){    // 找不到目录
                if(force) try{
                    const nd = await stat(node.path + part, node) as vDir;
                    node.child!.push(nd);
                    node = nd;
                }catch(e){
                    if(e instanceof APIError){
                        // --CODE1
                        if(create_on_miss)
                            node = (await createDir([part], node))[0];
                        else throw new Error(`Directory "${part}" not found`);
                    }
                    else throw e;
                }else{
                    // --CODE1
                    if(create_on_miss)
                        node = (await createDir([part], node))[0];
                    else throw new Error(`Directory "${part}" not found`);
                }
            }else{   // 找到目录
                node = node.child![index] as vDir;
            }
        }
        return {
            parent: node,
            get index(){
                let index = node.child!.findIndex(c => c.name == name && (type == 'dir' ? c.type == 'dir' : c.type == 'file'));
                if(index == -1) index = node.child!.findIndex(c => c.name == name);
                if(index == -1) throw new Error(`"${name}" not found in "${path}"`);
                return index;
            },
            get file(): FileOrDir{ return node.child![this.index] },
            set file(file: FileOrDir){ node.child![this.index] = file }
        };
    }
}

type IUploadArray = Array<{
    file: Blob,
    name: string,
    path: string
}>

/**
 * 上传函数的选项
 */
interface IUploadOption{
    /**
     * 是否覆盖已存在的文件
     */
    overwrite?: boolean,

    /**
     * XHR超时时间
     */
    timeout?: number,

    /**
     * 创建文件时触发的回调函数
     * @param file 文件引用
     */
    created?: (file: vFile) => any,

    /**
     * 上传完成后触发的回调
     * @param file 文件引用
     */
    uploaded?: (file: vFile) => any,

    /**
     * 处理线程数，即并发上传数量
     */
    thread_pool?: number
}

async function uploadArray(files: IUploadArray, option?: IUploadOption){
    type IUploadObj = IUploadArray[0] & { parent: vDir };

    const exists: Array<IUploadObj> = [],
        failed: Array<IUploadArray[0]> = [],
        promises: Array<Promise<void>> = [];

    async function up(file: Blob, name: string, parent: vDir){
        const newobj = Tree.createObject({
            type: 'file',
            name,
            parent,
            size: file.size,
            ctime: Date.now()
        });
        if(!parent.child) await Tree.load(parent);
        parent.child!.push(newobj);
        option?.created && option.created(newobj);
        await upload(file, newobj, option);
        option?.uploaded && option.uploaded(newobj);
    }

    for(const { file, path, name } of files){
        try{
            var node = await Tree.find(path, true, 'file', true);
        }catch(e){
            failed.push({ file, path, name });
            continue;
        }

        // 判断是否存在
        try{
            if(node.file.type == 'dir') throw 0;
            exists.push({ file, parent: node.parent, path, name });
            continue;
        }catch{}

        // 开始上传
        try{
            if(promises.length == (option?.thread_pool || 1))
                await Promise.race(promises);
            promises.push(up(file, name, node.parent));
        }catch(e){
            failed.push({ file, path, name });
        }
    }

    // 提示结果
    if(exists.length > 0){
        await new Promise(rs => alert({
            "type": "prompt",
            "title": "上传提示",
            "message": `您选中的这些文件已经存在\n\n${
                exists.map(item => ' ' + item.path).join('\n')
            }\n\n确定覆盖吗`,
            "callback": rs
        }));
        for(const item of exists)
            await up(item.file, item.name, item.parent);
    }

    // 显示错误
    if(failed.length > 0)
        message({
            "type": "error",
            "title": "文件资源管理器",
            "content":{
                "title": '上传失败',
                "content": `以下文件上传失败\n\n${
                    failed.map(item => ' ' + item.path).join('\n')
                }`
            },
            "timeout": 30
        });
}

export namespace FS{
    /**
     * 上传文件或文件夹
     *  - 参数为`DragEvent`时，会尝试读取拖放的文件列表
     *  - 参数为`FileList`时，会尝试读取文件列表
     *  - 参数为`null`时，会弹出文件选择框
     * 
     * @param e 事件或文件列表
     * @param to 目标文件夹
     * @param option 选项
     * @returns 上传结果
     */
    export async function upload(e: DragEvent | FileList | null, to: vDir, option?: IUploadOption){
        const files: IUploadArray = [];
        if(e instanceof DragEvent){
            if(!e.dataTransfer) throw new Error('Invalid drag event');

            // 初始化事件
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'copy';

            // 函数：递归添加
            async function add_to_tree(entry: FileSystemDirectoryEntry | FileSystemEntry, parent?: FileSystemDirectoryEntry) {
                // 文件：加入数组
                if (entry.isFile){ 
                    if(!parent) parent = await new Promise((rs, rj) => entry.getParent(rs as any, rj));
                    const file = await new Promise<File>((rs, rj) => (entry as FileSystemFileEntry).file(rs, rj));
                    if(!file) return;
                    files.push({ file, name: file.name, path: entry.fullPath });
                // 目录：递归
                }else {
                    const reader = (entry as FileSystemDirectoryEntry).createReader();

                    while (true) {
                        // 不断读取目录
                        const result: FileSystemEntry[] = await new Promise((rs, rj) => reader.readEntries(rs, rj));
                        if (result.length == 0) break;
                        else for (const item of result) {
                            // 读取文件(夹)
                            let fileordir: FileSystemDirectoryEntry | FileSystemEntry;
                            if (item.isDirectory)
                                fileordir = await new Promise((rs, rj) => (entry as FileSystemDirectoryEntry).getDirectory(item.fullPath, undefined, rs, rj));
                            else
                                fileordir = await new Promise((rs, rj) => (entry as FileSystemDirectoryEntry).getFile(item.fullPath, undefined, rs, rj));
                            // 添加到列表
                            add_to_tree(fileordir, entry as FileSystemDirectoryEntry);
                        }
                    }
                }
            }

            if(e.dataTransfer.items.length == 1){
                await add_to_tree(e.dataTransfer.items[0].webkitGetAsEntry()!);
            }else{
                // BUG: 经测试部分浏览器读取一个entry后变成空数组，因此需要遍历root
                const entry = e.dataTransfer.items[0].webkitGetAsEntry()!;
                const root = entry.filesystem.root;
                if(root) await add_to_tree(root, root);
                // 回退到遍历数组
                else for (const item of e.dataTransfer.items) {
                    const entry = item?.webkitGetAsEntry();
                    if(!entry) continue;
                    await add_to_tree(entry);
                }
            }
        }else if(e instanceof FileList){
            for(let i = 0; i < e.length; i++){
                const file = e.item(i) as File;
                files.push({ file, name: file.name, path: to.path + file.name });
            }
        }else{
            const input = await new Promise<FileList>((rs, rj) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = !!e;
                input.onchange = function(){
                    if(input.files && input.files.length > 0)
                        rs(input.files);
                    else
                        rj(new Error('User aborted'));
                }
                input.click();
            });
            for(const file of input){
                files.push({ file, name: file.name, path: to.path + file.name });
            }
        }

        return await uploadArray(files, option);
    }
    
    /**
     * 加载一个路径并返回目录节点
     * @param path 路径
     * @param reload 是否重新加载
     * @returns 目录节点
     */
    export async function loadPath(path: string, reload = false){
        const { file } = await Tree.find(path, true, 'dir', true);
        if(file.type != 'dir') throw new Error(`"${path}" is not a directory`);
        
        // 读取所有展开的文件夹，在重载后自动展开
        const opened_folders: Array<string> = [];
        function get_folders(node: vDir): number{
            let added = 0;  // 记录当前目录下添加的目录数量
            if(node.type == 'dir' && node.child)
                for(const child of node.child){
                    // 遍历所有文件夹
                    if(child.type != 'dir') continue;
                    // 没有展开或没有内容：作为末端节点
                    if(!child.child?.length){
                        opened_folders.push(child.path);
                        added++;
                    // 已经展开：递归处理
                    }else{
                        const added2 = get_folders(child);
                        // 子目录全部空白: 作为末端节点
                        if(added2 == 0){
                            opened_folders.push(child.path);
                            added++;
                        // 有内容：展开
                        }else added += added2;
                    }
                }
            return added;
        }
        get_folders(file);

        // 加载目录
        (file.child && !reload) || await Tree.load(file);
        // 展开所有文件夹
        for(const folder of opened_folders)
            loadPath(folder, true);
        return file;
    }

    /**
     * 加载多个路径，自动排重复项
     * @param dir 路径列表
     */
    export async function loadPaths(dir: string[]){
        dir = dir.filter(item => dir.every(item2 => item == item2 || !item.startsWith(item2)));
        for (const each of dir)
            await loadPath(each);
    }

    export async function list(path: string, create = false) {
        const { file } = await Tree.find(path, true, 'dir', create);
        if(file.type != 'dir') throw new Error(`"${path}" is not a directory`);
        return file.child || [];
    }

    async function __move(generator: () => Iterable<[string, string]>){
        // 移动元素
        for(const [source, target] of generator()){
            // 删除源
            const { parent, index } = await Tree.find(source, true, 'file');
            if(!parent.child) await Tree.load(parent);
            const node = parent.child!.splice(index, 1)[0];

            // 获取目标
            const tarobj = await Tree.find(target, true, 'file', true);
            try{
                // 如果不存在文件会报错，用此删除重复节点
                tarobj.index;
                tarobj.parent.child!.splice(tarobj.index, 1);
            }catch{}
            node.type == 'file'
                ? tarobj.parent.child!.push(node)
                : tarobj.parent.child!.unshift(node);

            // 修改目标
            node.path = clearPath(target);
            node.url = FILE_PROXY_SERVER + encodePath(node.path);
            node.parent = tarobj.parent;
            node.type == 'file' && (node.icon = getIcon(node.name, true));
            node.type == 'dir' && (node.active = new Map(), node.child = []);
            const inf = splitPath({ path: target });
            node.name = inf.fname;
        }
    }

    export async function rename(map: Record<string, string>){
        // 分析是否会交叉重命名造成覆盖
        // 如： 001 -> 002, 002 -> 003, 003 -> 001
        const files = Object.keys(map);
        for(let i = 0 ; i < files.length; i++){
            const source = files[i],
                target = map[source];
            if(files.includes(target))
                throw new Error(`conflict: ${source} -> ${target} while target already exists`);
            else
                files[i] = target;
        }

        // 重命名
        for(const [source, target] of Object.entries(map))
            await AList.rename(source, target);
        
        await __move(() => Object.entries(map))
    }

    export async function stat(path: string){
        const { file } = await Tree.find(path, true, 'file', false);
        return file;
    }

    export async function move(source: Array<string> | string, target: string, deep = false){
        if(source?.length == 0) return;
        const files = typeof source == 'string' ? [source] : source;
        await AList.move(files, target);
        await __move(() => files.map(item => [item, target + splitPath({ path: item }).name]));
    }

    export async function del(file: Array<string> | string){
        if(file?.length == 0) return;
        const files = typeof file == 'string' ? [file] : file;
        await AList.delete(files);
        // 删除节点
        for(const each of files){
            const { parent, index } = await Tree.find(each, true, 'file');
            if(!parent.child) await Tree.load(parent);
            parent.child!.splice(index, 1);
        }
    }

    export async function mkdir(dirs: string[] | string){
        if(typeof dirs == 'string') dirs = [dirs];
        for (const dir of dirs)
            await AList.mkdir(dir);
        // 创建节点
        for(const dir of dirs){
            const { parent } = await Tree.find(dir, true, 'dir', true);
            const inf = splitPath({ path: dir });
            const node = Tree.createObject({
                type: 'dir',
                name: inf.fname,
                parent,
                path: dir
            });
            parent.child || (await Tree.load(parent))
            parent.child!.push(node);
        }
    }

    export async function touch(files: string[] | string, mode = 0o755){
        if(typeof files == 'string') files = [files];
        console.debug('touch is not implemented in alist');
        // 创建节点
        for(const file of files){
            const { parent } = await Tree.find(file, true, 'file', true);
            const inf = splitPath({ path: file });
            const node = Tree.createObject({
                type: 'file',
                name: inf.fname,
                parent,
                path: file,
                size: 0,
                ctime: Date.now()
            });
            await AList.upload(new Blob(), file);
            parent.child || (await Tree.load(parent))
            parent.child!.push(node);
        }
    }

    export async function copy(source: Array<string> | string, target: string){
        if(source?.length == 0) return;
        const files = typeof source == 'string' ? [source] : source;
        await AList.copy(files, target);
        // 复制节点
        for(const each of files){
            const { parent, file } = await Tree.find(each, true, 'file');
            const node = Tree.createObject({
                type: file.type,
                name: splitPath({ path: each }).name,
                parent,
                path: target + splitPath({ path: each }).name,
                size: file.type == 'file' ? file.size : undefined,
                ctime: file.ctime
            });
            parent.child || (await Tree.load(parent))
            parent.child!.push(node);
        }
    }

    export async function write(
        file:string,
        content: Blob,
        overwrite = false,
        timeout?: number
    ){
        const info = await Tree.find(file, true, 'file', true);
        let f: vFile;
        // 错误处理
        try{
            if(info.file.type == 'dir') throw 0;
            f = info.file;
        }catch(e){
            if(e === 0)
                throw new Error('Attempt to write to a directory');
            f = Tree.createObject({
                type: 'file',
                name: splitPath({ path: file }).name,
                parent: info.parent,
                path: file,
                size: 0,
                ctime: Date.now()
            });
            info.parent.child || (await Tree.load(info.parent))
            info.parent.child!.push(f);
        }
        await upload_(content, f, { overwrite, timeout: timeout || 0 });
    }

    export const loadTree = Tree.load;
}

export const getActiveFile = Tree.getActive,
    clearActiveFile = Tree.clearActive;