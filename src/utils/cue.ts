interface Node{
    tag: string,
    param: Array<string>,
    child: Array<Node>,
    parent: Node | null,
    indent: number
}

export class ParseError extends Error{};

function analysis(string: string, ignoreLowerTag: Array<string> = []):Array<Node>{
    let current: Node = {
            tag: 'root',
            parent: null,
            indent: -1,
            param: [],
            child: []
        };

    const root = current,
        lines = string.split(/[\r\n]+/);

    for(let i = 1 ; i <= lines.length ; i ++){
        const line = lines[i -1];
        if(line.trim() == '') continue;

        const match = line.match(/^(\s*)(\w+)\s+([\w\W]+)\s*$/);
        if(!match) throw new ParseError(`format error at line ${i}`);
        const indent = match[1].length;

        // 忽略的标签
        if(ignoreLowerTag.includes(match[2].toLowerCase()))
            continue;

        // 空格数量相同同级
        if(indent == current.indent){
            // 创建一个新元素
            const parent = current.parent;
            current = {
                tag: match[2],
                parent,
                indent: indent,
                param: parseParam(match[3]),
                child: []
            }
            // 加入树中
            parent && parent.child.push(current);
        // 子菜单
        }else if(indent > current.indent){
            const newnode = {
                tag: match[2],
                parent: current,
                indent: indent,
                param: parseParam(match[3]),
                child: []
            };
            current.child.push(newnode);
            current = newnode;
        // 父级遍历
        }else {
            let findin = current;
            while(true){
                // 已经是最后一个块了
                if(!findin.parent)
                    throw new ParseError('indent not matched in linee ' + i );
                // 同级
                if(findin.indent == indent){
                    const newnode = {
                        tag: match[2],
                        parent: findin.parent,
                        indent: indent,
                        param: parseParam(match[3]),
                        child: []
                    };
                    findin.parent.child.push(newnode);
                    current = newnode;
                    break;
                }else{
                    findin = findin.parent;
                }
            }
        }
    }

    return root.child;
}

/**
 * 将 时间字符串 转换为 时间
 * @param string 时间字符串
 * @param offset 偏移，如1表示偏移到msec行
 * @returns 
 */
export function parseTime(string:string,offset:number = 0):number{
    const times = string.split(':').reverse(),
        table = [.01, 1, 60, 60 * 60, 24 * 60 * 60];
    let sec = 0.0;

    for (let i = 0; i < times.length; i++)
        sec += parseInt(times[i]) * table[i];

    return sec;
}

function parseParam(param: string):Array<string>{
    const alias = [] as Array<string>;
    return param.replace(/\".+\"/g, item => '$.' + (alias.push(item.substring(1, item.length -1)) -1))
        .split(/[\s]+/)
        .map(item => item.startsWith('$.') ? alias[parseInt(item.substring(2))] : item);
}

export interface CueItem{
    file: string,
    start: number,
    title: string,
    performer: string,
    album: string
}

function cueTree(nodes: Array<Node>){
    let album = '',performer = '';
    const tracks = [] as Array<CueItem>;

    for (const item of nodes) {
        const tagName = item.tag.toLowerCase();

        // 专辑名称
        if(tagName == 'title')
            album = item.param[0];

        // 谱曲者名称
        if(tagName == 'performer')
            performer = item.param[0];

        // 新文件
        else if(tagName == 'file'){
            // 格式不受支持
            if(item.param[1].toUpperCase() != 'WAVE') continue;

            for (const track of item.child) {
                // 必须是音频轨道
                if(track.tag.toLowerCase() != 'track')
                    throw new SyntaxError('Tag <' + track.tag + '> shouldnot be in <file> tag');
                if(track.param[1].toLowerCase() != 'audio') continue;

                const trackItem = {
                    file: item.param[0],
                    start: 0,
                    title: '',
                    performer,
                    album
                } satisfies CueItem;
                tracks.push(trackItem);

                // 解析数据
                for (const item of track.child) {
                    const tag = item.tag.toLowerCase();

                    if(tag == 'title') trackItem.title = item.param[0];
                    else if(tag == 'performer') trackItem.performer = item.param[0];
                    else if(tag == 'index') trackItem.start = parseTime(item.param[1]);
                }
            }
        }
    }

    return tracks;
}

export default function parseCue(cue:string){
    return cueTree(analysis(cue ,[
        'rem'
    ]));
}