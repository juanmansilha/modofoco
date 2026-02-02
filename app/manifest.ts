import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ModoFoco',
        short_name: 'ModoFoco',
        description: 'Seu sistema de produtividade e foco.',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#050505',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
