'use client';

import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/components/auth/auth-provider';
import type { Order } from '@/lib/types';

export function useOrderNotifications() {
  const { user } = useAuth();
  const initialLoadTime = useRef<Timestamp>(Timestamp.now());

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Permissão de notificação:', permission);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!user || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Ouvinte em tempo real para ordens criadas após o carregamento da página
    const q = query(
      collection(db, 'orders'), 
      where('date', '>', initialLoadTime.current)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newOrder = { id: change.doc.id, ...change.doc.data() } as Order;
          
          // Só notifica se foi outra pessoa que criou
          if (newOrder.lastUpdatedBy !== user.name) {
            console.log('Nova OS detectada:', newOrder.id);

            // Alerta sonoro
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
            audio.play().catch(e => {
              console.log('Áudio bloqueado pelo navegador. Interaja com a página primeiro.', e);
            });

            // Notificação de sistema
            if (Notification.permission === 'granted') {
              const notification = new Notification('Nova OS Master!', {
                body: `Cliente: ${newOrder.client} | Serviço: ${newOrder.service}`,
                icon: '/icons/icon-192x192.png',
                tag: newOrder.id,
              });

              notification.onclick = () => {
                window.focus();
                window.location.href = `/orders/${newOrder.id}`;
              };
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);
}
