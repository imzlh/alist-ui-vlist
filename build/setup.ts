import CC from './cc.ts';
import GOEnv from './goenv.ts';
import { cd, run, runWithOutput, wget } from './utils.ts';

cd('~');

run('mkdir -p ~/dist/');
run('mkdir -p ~/toolchain/');

// 克隆alist仓库
run(`git clone https://github.com/alist-org/alist.git`);
run(`cp -r ~/vlist_pkg/* alist/public/dist/`);

for(const arch in CC){
    const cc = (CC as Record<string, string>)[arch],
        env = (GOEnv as Record<string, Record<string, string>>)[arch];

    // 安装依赖
    cd('~/toolchain/');

    // 获取编辑工具包
    run(`rm -rf *`)
    await wget(cc, arch + '.tgz');
    run(`tar -xf ${arch}.tgz`);
    run(`cp -r *-cross/* ./`);
    run(`cp -r *-native/* ./`);
    run(`rm ${arch}.tgz`);

    // 复制
    cd('~/alist/');

    // 开始编译
    const addition = `-X 'github.com/alist-org/alist/v3/internal/conf.BuiltAt=${new Date().toISOString()}'
-X 'github.com/alist-org/alist/v3/internal/conf.GoVersion=${
    runWithOutput('go version').split('go version ')[1]
}'
-X 'github.com/alist-org/alist/v3/internal/conf.GitAuthor=${runWithOutput("git show -s --format='format:%aN <%ae>' HEAD")}'
-X 'github.com/alist-org/alist/v3/internal/conf.GitCommit=${runWithOutput('git log --pretty=format:"%h" -1')}'
-X 'github.com/alist-org/alist/v3/internal/conf.Version=${runWithOutput("git describe --long --tags --dirty --always")}' 
-X 'github.com/alist-org/alist/v3/internal/conf.WebVersion=5.6'`;
    run(`go build --ldflags="-s -w ${addition}" -o alist`, {
        ...env,
        'CGO_ENABLED': '1'
    });

    // 压缩
    run(`tar -zcf alist-${arch}.tgz alist`)
    run(`mv alist-${arch}.tgz ~/dist/alist-${arch}.tgz`);
    run(`rm -f alist`);
}