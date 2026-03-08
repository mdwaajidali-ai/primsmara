import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cards, Card } from '@/data/cards';

export interface Deck {
  id: string;
  name: string;
  is_active: boolean;
  cards: Card[];
}

export function useDecks(userId: string | undefined) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = useCallback(async () => {
    if (!userId) return;
    const { data: deckRows } = await supabase
      .from('player_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');

    if (!deckRows) { setLoading(false); return; }

    const result: Deck[] = [];
    for (const row of deckRows) {
      const { data: cardRows } = await supabase
        .from('deck_cards')
        .select('card_id, position')
        .eq('deck_id', row.id)
        .order('position');

      const deckCards = (cardRows || [])
        .map(cr => cards.find(c => c.id === cr.card_id))
        .filter(Boolean) as Card[];

      result.push({ id: row.id, name: row.name, is_active: row.is_active, cards: deckCards });
    }
    setDecks(result);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const createDeck = useCallback(async (name: string, cardIds: number[]) => {
    if (!userId) return;
    const { data: deck } = await supabase
      .from('player_decks')
      .insert({ user_id: userId, name })
      .select()
      .single();

    if (deck) {
      const inserts = cardIds.map((cardId, i) => ({
        deck_id: deck.id,
        card_id: cardId,
        position: i,
      }));
      if (inserts.length > 0) {
        await supabase.from('deck_cards').insert(inserts);
      }
      await fetchDecks();
    }
  }, [userId, fetchDecks]);

  const saveDeck = useCallback(async (deckId: string, cardIds: number[]) => {
    await supabase.from('deck_cards').delete().eq('deck_id', deckId);
    const inserts = cardIds.map((cardId, i) => ({
      deck_id: deckId,
      card_id: cardId,
      position: i,
    }));
    if (inserts.length > 0) {
      await supabase.from('deck_cards').insert(inserts);
    }
    await fetchDecks();
  }, [fetchDecks]);

  const deleteDeck = useCallback(async (deckId: string) => {
    await supabase.from('player_decks').delete().eq('id', deckId);
    await fetchDecks();
  }, [fetchDecks]);

  const setActiveDeck = useCallback(async (deckId: string) => {
    if (!userId) return;
    // Deactivate all
    await supabase.from('player_decks').update({ is_active: false }).eq('user_id', userId);
    // Activate selected
    await supabase.from('player_decks').update({ is_active: true }).eq('id', deckId);
    await fetchDecks();
  }, [userId, fetchDecks]);

  return { decks, loading, createDeck, saveDeck, deleteDeck, setActiveDeck, refetch: fetchDecks };
}
