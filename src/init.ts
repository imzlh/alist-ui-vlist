/**
 * vList5 Entry Script(Main Interface)
 * Copyright (c) 2024 izGroup
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * @version 5.5
 * @license MIT
 * @copyright izGroup
 * @author iz
 * @link https://hi.imzlh.top/2024/06/16.cgi
 */

import { createApp, ref, type Ref } from 'vue';

// PWA服务
// import './utils/pwa';

// 打开方式注册
import './opener';

// 主要的应用入口
import App from './App.vue';

interface Touch{
    x: number,
    y: number,
    mx: number,
    my: number,
    el: HTMLElement,
    time: number,
    prevent: boolean,
    lastClick: Ref<number | undefined>
}

// 触摸管理
let touch: undefined | Touch;
document.documentElement.addEventListener('contextmenu', el => el.preventDefault());
document.documentElement.addEventListener('touchmove', ev => {
    if(!touch) return;

    if(touch.prevent) ev.preventDefault();

    touch.mx = ev.touches[0].clientX,
    touch.my = ev.touches[0].clientY;
    touch.el.dispatchEvent(new PointerEvent('pointermove', {
        "clientX": ev.touches[0].clientX,
        "clientY": ev.touches[0].clientY,
        "cancelable": false
    }));
});
document.documentElement.addEventListener('touchend', ev => {
    if(!touch) return;
    if(touch.prevent) ev.preventDefault();

    const click = ref(0);

    touch.el.dispatchEvent(new MouseEvent('pointerup', {
        "clientX": touch.mx,
        "clientY": touch.my,
        "cancelable": false
    }));

    if(Math.abs(touch.mx - touch.x) > 10 || Math.abs(touch.my - touch.y) > 10) return;

    const now = new Date().getTime();
    if(now - touch.time > 500){
        touch.el.dispatchEvent(new MouseEvent('contextmenu', {
            "clientX": touch.mx,
            "clientY": touch.my,
            "cancelable": true
        }));
    }else{
        touch.el.dispatchEvent(new MouseEvent('click', {
            "clientX": touch.mx,
            "clientY": touch.my,
        "cancelable": true
        }));
        if(touch.lastClick.value && now - touch.lastClick.value < 600)
            touch.el.dispatchEvent(new MouseEvent('dblclick', {
                "clientX": touch.mx,
                "clientY": touch.my,
                "cancelable": true
            })),touch.lastClick.value = undefined;
        else
            touch.lastClick.value = now;
    }
    touch = undefined;
})

// 挂载应用
const app = createApp(App);
app.directive('touch', {
    mounted(el: HTMLElement, direct){
        const clickRef = ref();

        el.addEventListener('touchstart',ev => 
            touch = {
                x: ev.touches[0].clientX,
                y: ev.touches[0].clientY,
                mx: ev.touches[0].clientX,
                my: ev.touches[0].clientY,
                el,
                time: new Date().getTime(),
                prevent: !!direct.arg?.includes('prevent'),
                lastClick: clickRef
            }
        );
    },
    unmounted(){
        touch = undefined
    }
});

app.mount(document.body);