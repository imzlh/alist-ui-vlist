import type { MessageOpinion, FileOrDir, vDir } from "@/env";
import { APP_API, FS, getActiveFile, Global, splitPath } from "@/utils";

// 文件操作
export const FACTION = {
    marked: [] as Array<FileOrDir>,
    action: 'copy' as 'copy' | 'move',
    async exec(dest: vDir): Promise<boolean | number> {
        try{
            if(this.action === 'copy')
                FS.copy(this.marked.map(item => item.path), dest.path);
            else if(this.action ==='move')
                FS.move(this.marked.map(item => item.path), dest.path);
        }catch(e){
            Global('ui.message').call({
                "type": "error",
                "title": "文件资源管理器",
                "content": {
                    "title": {
                        'copy': '复制',
                        'move': '剪切'
                    }[this.action] + '文件失败',
                    "content": (e as Error).message
                },
                "timeout": 5
            } satisfies MessageOpinion);
            return false;
        }
        return true;
    },

    mark(action: 'copy' | 'move') {
        this.marked = getActiveFile();
        this.action = action;
    }
}