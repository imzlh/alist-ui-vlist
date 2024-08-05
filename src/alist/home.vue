<script lang="ts" setup>
    import { Global } from '@/utils';
    import type { Component } from 'vue';
    import I_ALIST from '/images/app/alist.svg';
    import Drivers from './drivers.vue';
    import Browser from '@/opener/browser.vue';
    
    function open(app: Component, name: string){
        Global('ui.window.add').call({
            name,
            "content": app,
            "icon": I_ALIST
        });
    }
</script>

<template>
    <div class="ahome-backdrop">
        <div class="bg-1">
            <svg height="1337" width="1337">
                <defs>
                    <path id="path-1" opacity="1" fill-rule="evenodd"
                        d="M1337,668.5 C1337,1037 1037,1337 668.5,1337 C523,1337 337,1236 370,1094 C434,824 6e-14,892 0,668 C0,299 299,1e-13 668,0 C1037,0 1337,299 1337,668.5Z">
                    </path>
                    <linearGradient id="linearGradient-2" x1="0.79" y1="0.62" x2="0.21" y2="0.86">
                        <stop offset="0" stop-opacity="1" stop-color="#28aff0"></stop>
                        <stop offset="1" stop-opacity="1" stop-color="#120fc4"></stop>
                    </linearGradient>
                </defs>
                <g opacity="1">
                    <use xlink:href="#path-1" fill="url(#linearGradient-2)" fill-opacity="1"></use>
                </g>
            </svg></div>
        <div class="bg-2">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" height="896" width="967">
                <defs>
                    <path id="path-2" opacity="1" fill-rule="evenodd"
                        d="M896,448 C1142,465 695,896 448,896 C200,896 5e-14,695 0,448 C0,200 200,5e-14 447,0 C695,0 475,418 896,448Z">
                    </path>
                    <linearGradient id="linearGradient-3" x1="0.5" y1="0" x2="0.5" y2="1">
                        <stop offset="0" stop-opacity="1" stop-color="#28aff0"></stop>
                        <stop offset="1" stop-opacity="1" stop-color="#120fc4"></stop>
                    </linearGradient>
                </defs>
                <g opacity="1">
                    <use xlink:href="#path-2" fill="url(#linearGradient-3)" fill-opacity="1"></use>
                </g>
            </svg>
        </div>
    </div>
    <div class="ahome">
        <div class="title">
            <h1>vList for aList3</h1>
        </div>
        <div class="action">
            <div @click="open(Drivers, '存储管理 - aList3')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-hdd-stack" viewBox="0 0 16 16">
                    <path
                        d="M14 10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h12zM2 9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H2z" />
                    <path
                        d="M5 11.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14 3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12zM2 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2z" />
                    <path d="M5 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
                </svg>
                <span>存储设置</span>
            </div>
            <div>
                <!-- todo -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-window-fullscreen" viewBox="0 0 16 16">
                    <path
                        d="M3 3.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm1.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
                    <path
                        d="M.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5H.5ZM1 5V2h14v3H1Zm0 1h14v8H1V6Z" />
                </svg>
                <span>页面设置</span>
            </div>
            <div @click="open(Browser, 'static/alist.html')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-cloud-download" viewBox="0 0 16 16">
                    <path
                        d="M4 1A5.53 5.53 0 0 1 8 0c2.69 0 4 2 5 4C14 4 16 6 16 7 16 9 14 11 12 11H10a.5.5 0 0 1 0-1h2C13 10 15 8 15 7c0-1-1.02-2-2-2h-.5v-.5C12 2 10 1 8 1a4.53 4.53 0 0 0-2 1.1c--1 1-1 2vl-C2 4 1 5 1 7 1 8 2.23 10 3 10H6a.5.5 0 0 1 0 1H3C1 11 0 9 0 7c0-1 1-3 2-3--1 1-2z" />
                    <path
                        d="M7 15a.5.5 0 0 0  0l3-3a.5.5 0 0 0--L8.5 14V5.5a.5.5 0 0 0-1 0v8l-2-2a.5.5 0 0 0-l3 3z" />
                </svg>
                <span>原aListUI</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .ahome-backdrop {
        position: absolute;
        inset: 0;
        background-color: rgb(169, 198, 255);
        overflow: hidden;
        z-index: -1;
        width: 100%;
        height: 100%;

        > *{
            position: absolute;
            width: 100%;
        }

        svg{
            display: block;
            max-width: 100% !important;
            max-height: 100%;
            width: unset !important;
        }

        > .bg-1{
            right: -300px;
            top: -900px;
        }

        > .bg-2{
            left: -200px;
            bottom: -400px;
        }
    }

    .ahome {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-color: rgb(253 253 253);
        height: auto;
        padding: 1rem;
        border-radius: .75rem;
        
        > .title {
            text-align: center;

            > h1{
                font-weight: 300;
                font-family: 'Comic Sans MS';
                margin-top: 0;
            }
        }


        > .action {
            display: flex;
            gap: 1rem;

            > div{
                padding: .5rem;
                border-radius: .35rem;
                transition: all .2s;
                min-width: 4rem;
                text-align: center;
                user-select: none;
                cursor: pointer;

                &:hover{
                    background-color: #f2f2f2;
                }

                > svg{
                    display: block;
                    width: 2rem;
                    height: 2rem;
                    margin: auto;
                    margin-bottom: .65rem;
                }

                > span{
                    line-height: 1.5rem;
                    font-size: 0.8rem;
                }
            }
        }
    }
</style>