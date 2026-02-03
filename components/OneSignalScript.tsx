"use client";
import Script from 'next/script';

export default function OneSignalScript() {
    return (
        <>
            <Script
                src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
                strategy="afterInteractive"
            />
            <Script id="onesignal-init" strategy="afterInteractive">
                {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "b07caf1d-c550-4072-8f07-7cd960fa45c1"}",
              allowLocalhostAsSecureOrigin: true,
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
            });
            
            // Force Prompt
            OneSignal.Slidedown.promptPush();
            
            console.log("✅ OneSignal Script Loaded & Init Called");
          });
        `}
            </Script>
        </>
    );
}
