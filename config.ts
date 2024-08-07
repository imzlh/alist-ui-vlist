import I_File from '/images/icon/file.webp';
import I_DIR from '/images/icon/dir.webp';

export const APP_NAME = 'izCloud';
export const DEFAULT_FILE_ICON = I_File;
export const DEFAULT_DIR_ICON = I_DIR;
export const APP_API = import.meta.env.DEV
    ? 'http://localhost:5244/api/' 
    : import.meta.env.VLIST_API || location.protocol + '//' + location.host + '/api/';
export const FILE_PROXY_SERVER = import.meta.env.DEV 
    ? 'http://localhost:5244/d/' 
    : import.meta.env.VLIST_FILE_SERVER || location.protocol + '//' + location.host + '/d/';
export const APP_ROOT = location.protocol + '//' + location.host + location.pathname;