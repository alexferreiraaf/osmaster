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
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!user || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const q = query(
      collection(db, 'orders'), 
      where('date', '>', initialLoadTime.current)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newOrder = { id: change.doc.id, ...change.doc.data() } as Order;
          
          if (newOrder.lastUpdatedBy !== user.name) {
            console.log('Nova OS detectada para notificação sonora');
            // Som de Alerta
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
            audio.play().catch(e => console.log('Audio playback failed (browser restriction)', e));

            // Notificação Visual
            if (Notification.permission === 'granted') {
              new Notification('Nova OS Recebida!', {
                body: `Cliente: ${newOrder.client}\nServiço: ${newOrder.service}`,
              });
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);
}