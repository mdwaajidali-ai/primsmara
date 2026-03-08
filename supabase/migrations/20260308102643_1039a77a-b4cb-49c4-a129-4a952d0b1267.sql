-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 500,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create player_collections table
CREATE TABLE public.player_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id)
);

ALTER TABLE public.player_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collection" ON public.player_collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own collection" ON public.player_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collection" ON public.player_collections FOR UPDATE USING (auth.uid() = user_id);

-- Create player_decks table
CREATE TABLE public.player_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Deck',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.player_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own decks" ON public.player_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own decks" ON public.player_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own decks" ON public.player_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own decks" ON public.player_decks FOR DELETE USING (auth.uid() = user_id);

-- Create deck_cards table
CREATE TABLE public.deck_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.player_decks(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.deck_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deck cards" ON public.deck_cards FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.player_decks WHERE id = deck_cards.deck_id AND user_id = auth.uid()));
CREATE POLICY "Users can add to their own deck cards" ON public.deck_cards FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.player_decks WHERE id = deck_cards.deck_id AND user_id = auth.uid()));
CREATE POLICY "Users can update their own deck cards" ON public.deck_cards FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.player_decks WHERE id = deck_cards.deck_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their own deck cards" ON public.deck_cards FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.player_decks WHERE id = deck_cards.deck_id AND user_id = auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_player_decks_updated_at BEFORE UPDATE ON public.player_decks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player_' || LEFT(NEW.id::text, 8))
  );
  
  -- Give new players 5 random starter cards
  INSERT INTO public.player_collections (user_id, card_id, quantity)
  SELECT NEW.id, card_id, 1
  FROM (SELECT generate_series(1, 20) AS card_id ORDER BY random() LIMIT 5) starter_cards;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();