import { defineConfig } from 'vitepress'

export default defineConfig({
    title: "OpsGuard Wiki",
    description: "Secure, Hardened, and Hybrid AI",
    srcExclude: ['design/**'],
    ignoreDeadLinks: true,
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Architecture', link: '/wiki/ARCHITECTURE_DEEP_DIVE' },
            { text: 'GitHub', link: 'https://github.com/ArielKaras/User-Ip-Viewer' }
        ],

        sidebar: [
            {
                text: 'Core Concepts',
                items: [
                    { text: 'Architecture Deep Dive', link: '/wiki/ARCHITECTURE_DEEP_DIVE' },
                    { text: 'Security Considerations', link: '/wiki/SECURITY_CONSIDERATIONS' },
                    { text: 'Hybrid AI Strategy', link: '/wiki/HYBRID_AI_ARCHITECTURE' },
                    { text: 'Observability Strategy', link: '/wiki/OBSERVABILITY_STRATEGY' },
                ]
            },
            {
                text: 'Developer Zone',
                items: [
                    { text: 'Developer Workflows', link: '/wiki/DEV_WORKFLOWS' },
                    { text: 'The Monolith Manifesto', link: '/wiki/ENGINEERING_PHILOSOPHY' },
                    { text: 'Decision Log', link: '/wiki/DECISION_LOG' },
                ]
            },
            {
                text: 'Resources',
                items: [
                    { text: 'Full Context (Podcast)', link: '/wiki/OPSGUARD_FULL_CONTEXT' }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/ArielKaras/User-Ip-Viewer' }
        ],

        footer: {
            message: 'Released under ISC License.',
            copyright: 'Copyright © 2025 OpsGuard Team'
        }
    }
})
