const HOMEPATH = Deno.env.get('HOME') || Deno.env.get('USERPROFILE') || '/home/';

export default {
    'armv8': {
        'GOOS': 'linux',
        'GOARCH': 'arm64',
        'CC': HOMEPATH + '/toolchain/bin/aarch64-linux-musl-gcc'
    },
    'armv7l': {
        'GOOS': 'linux',
        'GOARCH': 'arm',
        'GOARM': '7',
        'CC': HOMEPATH + '/toolchain/bin/armv7l-linux-musleabihf-gcc'
    },
    'armv5': {
        'GOOS': 'linux',
        'GOARCH': 'arm',
        'GOARM': '5',
        'CC': HOMEPATH + '/toolchain/bin/arm-linux-musleabi-gcc'
    },
    'x86_64': {
        'GOOS': 'linux',
        'GOARCH': 'amd64',
        'CC': HOMEPATH + '/toolchain/bin/x86_64-linux-musl-gcc'
    },
    'windows': {
        'GOOS': 'windows',
        'GOARCH': 'amd64',
        'CC': HOMEPATH + '/toolchain/bin/x86_64-w64-mingw32-gcc'
    }
};