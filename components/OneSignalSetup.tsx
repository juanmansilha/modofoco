"use client";

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalSetup() {
    useEffect(() => {
        const runOneSignal = async () => {
            try {
                await OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "b07caf1d-c550-4072-8f07-7cd960fa45c1",
                    // allowLocalhostAsSecureOrigin: true, // Only for dev, comment out for prod if needed but useful for testing
                    notifyButton: {
                        enable: true,
                        size: 'medium',
                        theme: 'default',
                        position: 'bottom-right',
                        showCredit: false,
                        text: {
                            'tip.state.unsubscribed': 'Inscrever-se em notificações',
                            'tip.state.subscribed': 'Você está inscrito em notificações',
                            'tip.state.blocked': 'Você bloqueou notificações',
                            'message.action.subscribed': 'Obrigado por se inscrever!',
                            'message.action.resubscribed': 'Você está inscrito novamente!',
                            'message.action.unsubscribed': 'Você não receberá mais notificações',
                            'dialog.main.title': 'Gerenciar Notificações',
                            'dialog.main.button.subscribe': 'Inscrever-se',
                            'dialog.main.button.unsubscribe': 'Cancelar inscrição',
                            'dialog.blocked.title': 'Desbloquear Notificações',
                            'dialog.blocked.message': 'Siga as instruções para permitir notificações:'
                        },
                        prenotify: true,
                    },
                });

                // Request permission immediately on load? Or wait for user action?
                // Usually good practice to let the OneSignal Prompt handle it or do it on interaction.
                OneSignal.Slidedown.promptPush();
            } catch (error) {
                console.error("Error Initializing OneSignal", error);
            }
        };

        runOneSignal();
    }, []);

    return null;
}
