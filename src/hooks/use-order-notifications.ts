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
    if (!user || typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const q = query(collection(db, 'orders'), where('date', '>', initialLoadTime.current));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newOrder = { id: change.doc.id, ...change.doc.data() } as Order;
          
          if (newOrder.lastUpdatedBy !== user.name) {
             const notification = new Notification('Nova OS Criada!', {
                body: `Cliente: ${newOrder.client} | Serviço: ${newOrder.service}`,
                icon: '/icons/icon-192x192.png',
                tag: newOrder.id,
             });
             notification.onclick = () => {
                window.focus();
                window.location.href = `/orders/${newOrder.id}`;
             }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);
}
