<script setup lang="ts">
    import type { vFile } from '@/env';
    import { Global, splitPath } from '@/utils';
    import { reactive } from 'vue';
    import { OPENER } from '@/opener';

    const cfg = reactive({
        ext: '',
        display: false,
        opener: OPENER,
        selected: -1
    });

    let callback:undefined|Function;

    Global('opener.choose').data = function(file:vFile) {
        cfg.display = true;
        cfg.ext = splitPath(file)['ext'];
        return new Promise(rs => callback = rs);
    }
</script>

<template>
    <div :class="['opener-chooser',{display: cfg.display}]">
        <h3>你要如何打开 <b>{{ cfg.ext }}</b> ?</h3>
        <div class="list">
            <div v-for="(opener,i) in cfg.opener"
                @click.stop="cfg.selected = i" @dblclick="
                    () => {callback && callback(OPENER[cfg.selected]);cfg.display = false;}
                "
                :selected="i == cfg.selected"
            >
                <img :src="opener.icon || '/images/icon/app.webp'">
                <div>
                    <h4>{{ opener.name }}</h4>
                    <span >{{ opener.typeDesc }}</span>
                </div>
            </div>
        </div>
        <div class="btns" style="flex-direction: row-reverse;">
            <button @click="cfg.display = false;cfg.selected = -1;">取消</button>
            <button :disabled="-1 === cfg.selected" @click="callback && callback(OPENER[cfg.selected]);cfg.display = false;">确定</button>
        </div>
    </div>
    <div class="opener-cover" @click="cfg.display = false" v-show="cfg.display"></div>
</template>

<style lang="scss">
    .opener-chooser{
        position: fixed;
        top: -100vh;
        left: 50%;
        width: 100vw;
        max-width: 20rem;
        border-radius: .5rem;
        background-color: rgb(240 244 253 / 80%);
        overflow: hidden;
        z-index: 25;
        transform: translate(-50%,-50%);
        transition-timing-function: ease-out;
        opacity: 0;
        transition: opacity .2s,translate .35s;

        &.display{
            display: block;
            opacity: 1;
            top: 50vh;
            transition-timing-function: ease-in;
        }

        > h3{
            margin: 1.2rem 1rem .5rem 1rem;
            font-weight: 500;
        }

        .list{
            overflow-y: auto;
            overflow-x: hidden;
            max-height: 12rem;
            height: calc(100vh - 10rem);
            margin: .75rem;
            background-color: white;
            border-radius: .3rem;

            > div{
                padding: .45rem;
                border-radius: .3rem;
                transition: all .2s;
                display: flex;
                align-items: center;
                gap: .5rem;

                &:hover{
                    background-color: rgb(242 237 237);
                }

                &:active{
                    transform: scale(.95);
                }

                &[selected=true]{
                    background-color: rgb(221 225 237);
                }

                > img{
                    flex-shrink: 0;
                    height: 2rem;
                    width: 2rem;
                }

                > div{
                    > h4{
                        margin: .1rem;
                        font-size: .9rem;
                    }

                    > span{
                        color: rgb(134 131 131);
                        font-size: 0.75rem;
                    }
                }
            }
        }

        // 按钮组
        .btns{
            background-color: #efefef;
            padding: 0.5rem 0.85rem;
            display: flex;
            gap: .35rem;

            > *{
                flex-shrink: 0;
            }

            > button{
                padding: 0.35rem;
                margin: 0.1rem 0.25rem;
                border: solid 0.05rem transparent;
                border-radius: 0.3rem;
                font-size: 0.9rem;
                line-height: 1rem;
                min-width: 4.5rem;
                text-align: center;
                font-weight: 400;
                user-select: none;
                border: solid .1em rgb(212, 212, 212);

                &:not([disabled]):hover{
                    background-color: rgb(213, 204, 204);
                }

                &:not([disabled]):focus{
                    border-color: rgb(137,148,205);
                }

                &[disabled]{
                    pointer-events: none;
                    opacity: .6;
                }
            }
            
            > .gap{
                flex-grow: 1;
            }

            button{
                padding: .45rem;
                border: solid .1rem #dad7d7;
            }
        }
    }

    // 遮罩
	.opener-cover {
        content: '';
		position: fixed;
		inset: 0;
		background-color: rgba(210, 196, 196, 0.5);
		z-index: 24;
	}
</style>
