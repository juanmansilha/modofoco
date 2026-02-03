"use client";

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalSetup() {
    useEffect(() => {
        const runOneSignal = async () => {
            try {
                await OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "b07caf1d-c550-4072-8f07-7cd960fa45c1",
                    allowLocalhostAsSecureOrigin: true, // Needed for simple dev environments if not https
                    autoRegister: true, // Tries to auto-prompt
                    notifyButton: {
                        enable: true,
                        size: 'medium',
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
                            'dialog.blocked.message': 'Siga as instruções para permitir notificações:',
                            'message.action.subscribing': 'Inscrevendo-se...',
                            'message.prenotify': 'Clique para se inscrever nas notificações'
                        },
                        prenotify: true,
                    },
                }).then(() => {
                    console.log("✅ OneSignal Initialized Successfully");
                    // Check subscription status
                    if (OneSignal.User && OneSignal.User.PushSubscription) {
                        console.log("✅ OneSignal Subscription ID:", OneSignal.User.PushSubscription.id);
                        console.log("✅ OneSignal Opted In:", OneSignal.User.PushSubscription.optedIn);
                    }
                });

                // Force prompt again just in case
                OneSignal.Slidedown.promptPush();
            } catch (error) {
                console.error("Error Initializing OneSignal", error);
            }
        };

        runOneSignal();
    }, []);

    return null;
}
