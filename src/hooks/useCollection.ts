import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cards, Card } from '@/data/cards';

export interface CollectionEntry {
  card_id: number;
  quantity: number;
}

export function useCollection(userId: string | undefined) {
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollection = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('player_collections')
      .select('card_id, quantity')
      .eq('user_id', userId);
    if (data) setCollection(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const ownedCards: Card[] = collection
    .map(e => cards.find(c => c.id === e.card_id))
    .filter(Boolean) as Card[];

  const ownsCard = (cardId: number) => collection.some(e => e.card_id === cardId);

  const addCards = useCallback(async (cardIds: number[]) => {
    if (!userId) return;
    for (const cardId of cardIds) {
      const existing = collection.find(e => e.card_id === cardId);
      if (existing) {
        await supabase
          .from('player_collections')
          .update({ quantity: existing.quantity + 1 })
          .eq('user_id', userId)
          .eq('card_id', cardId);
      } else {
        await supabase
          .from('player_collections')
          .insert({ user_id: userId, card_id: cardId });
      }
    }
    await fetchCollection();
  }, [userId, collection, fetchCollection]);

  return { collection, ownedCards, ownsCard, addCards, loading, refetch: fetchCollection };
}
