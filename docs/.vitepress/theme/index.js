import DefaultTheme from 'vitepress/theme'
import AudioPlayer from './components/AudioPlayer.vue'
import { h } from 'vue'
// import './custom.css' 
// Actually I don't recall seeing custom.css in the file list, so I will omit it for now to avoid error.

export default {
    extends: DefaultTheme,
    Layout: () => {
        return h(DefaultTheme.Layout, null, {
            'doc-before': () => h(AudioPlayer)
        })
    },
    enhanceApp({ app }) {
        app.component('AudioPlayer', AudioPlayer)
    }
}
