-- CricDuel: Initial schema migration

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  photo_url TEXT,
  cricinfo_id INTEGER,
  dob DATE,
  batting_style TEXT,
  bowling_style TEXT,
  formats TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batting_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('test','odi','t20i')),
  matches INTEGER DEFAULT 0,
  innings INTEGER DEFAULT 0,
  runs INTEGER DEFAULT 0,
  not_outs INTEGER DEFAULT 0,
  average DECIMAL(6,2),
  strike_rate DECIMAL(6,2),
  hundreds INTEGER DEFAULT 0,
  fifties INTEGER DEFAULT 0,
  highest_score TEXT,
  UNIQUE(player_id, format)
);

CREATE TABLE IF NOT EXISTS bowling_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('test','odi','t20i')),
  matches INTEGER DEFAULT 0,
  wickets INTEGER DEFAULT 0,
  average DECIMAL(6,2),
  economy DECIMAL(4,2),
  strike_rate DECIMAL(6,2),
  best_bowling TEXT,
  five_wickets INTEGER DEFAULT 0,
  UNIQUE(player_id, format)
);

CREATE TABLE IF NOT EXISTS player_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('test','odi','t20i')),
  elo_rating INTEGER DEFAULT 1500,
  UNIQUE(player_id, format)
);

CREATE TABLE IF NOT EXISTS player_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  player1_id UUID REFERENCES players(id),
  player2_id UUID REFERENCES players(id),
  winner_id UUID REFERENCES players(id),
  format TEXT NOT NULL CHECK (format IN ('test','odi','t20i')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_players_formats ON players USING gin(formats);
CREATE INDEX IF NOT EXISTS idx_players_country ON players(country);
CREATE INDEX IF NOT EXISTS idx_batting_stats_player ON batting_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_bowling_stats_player ON bowling_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_ratings_format ON player_ratings(format, elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_player_votes_user ON player_votes(user_id);

-- RLS Policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE batting_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowling_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_votes ENABLE ROW LEVEL SECURITY;

-- Public read access for players, stats, ratings
CREATE POLICY "Players are publicly readable" ON players FOR SELECT USING (true);
CREATE POLICY "Batting stats are publicly readable" ON batting_stats FOR SELECT USING (true);
CREATE POLICY "Bowling stats are publicly readable" ON bowling_stats FOR SELECT USING (true);
CREATE POLICY "Ratings are publicly readable" ON player_ratings FOR SELECT USING (true);

-- Authenticated users can upsert ratings
CREATE POLICY "Authenticated users can upsert ratings" ON player_ratings
  FOR ALL USING (auth.role() = 'authenticated');

-- Users can insert and read their own votes
CREATE POLICY "Users can insert their own votes" ON player_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own votes" ON player_votes
  FOR SELECT USING (auth.uid() = user_id);

-- Seed data: 20 cricket legends
INSERT INTO players (name, country, country_code, photo_url, batting_style, bowling_style, formats) VALUES
('Sachin Tendulkar', 'India', 'IN', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313600/313697.jpg', 'Right-hand bat', 'Right-arm off break', ARRAY['test','odi']),
('Ricky Ponting', 'Australia', 'AU', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313600/313600.jpg', 'Right-hand bat', 'Right-arm medium', ARRAY['test','odi']),
('Brian Lara', 'West Indies', 'WI', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313700/313780.jpg', 'Left-hand bat', 'Right-arm medium', ARRAY['test','odi']),
('Jacques Kallis', 'South Africa', 'ZA', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313700/313714.jpg', 'Right-hand bat', 'Right-arm fast-medium', ARRAY['test','odi']),
('Shane Warne', 'Australia', 'AU', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313700/313787.jpg', 'Right-hand bat', 'Right-arm leg break', ARRAY['test']),
('Muttiah Muralitharan', 'Sri Lanka', 'LK', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313700/313741.jpg', 'Right-hand bat', 'Right-arm off break', ARRAY['test','odi']),
('MS Dhoni', 'India', 'IN', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313600/313667.jpg', 'Right-hand bat', 'Right-arm medium', ARRAY['test','odi','t20i']),
('Virat Kohli', 'India', 'IN', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/354700/354706.jpg', 'Right-hand bat', 'Right-arm medium', ARRAY['test','odi','t20i']),
('AB de Villiers', 'South Africa', 'ZA', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313600/313609.jpg', 'Right-hand bat', 'Right-arm medium', ARRAY['test','odi','t20i']),
('Steve Smith', 'Australia', 'AU', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313800/313810.jpg', 'Right-hand bat', 'Right-arm leg break', ARRAY['test','odi','t20i']),
('Joe Root', 'England', 'GB', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/354800/354884.jpg', 'Right-hand bat', 'Right-arm off break', ARRAY['test','odi','t20i']),
('Kane Williamson', 'New Zealand', 'NZ', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/354700/354799.jpg', 'Right-hand bat', 'Right-arm off break', ARRAY['test','odi','t20i']),
('Wasim Akram', 'Pakistan', 'PK', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313800/313820.jpg', 'Left-hand bat', 'Left-arm fast', ARRAY['test','odi']),
('Glenn McGrath', 'Australia', 'AU', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313700/313730.jpg', 'Right-hand bat', 'Right-arm fast-medium', ARRAY['test','odi']),
('Imran Khan', 'Pakistan', 'PK', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313700/313704.jpg', 'Right-hand bat', 'Right-arm fast', ARRAY['test','odi']),
('Vivian Richards', 'West Indies', 'WI', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313700/313768.jpg', 'Right-hand bat', 'Right-arm off break', ARRAY['test','odi']),
('Sunil Gavaskar', 'India', 'IN', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/313600/313676.jpg', 'Right-hand bat', 'Right-arm medium', ARRAY['test']),
('Don Bradman', 'Australia', 'AU', NULL, 'Right-hand bat', 'Right-arm medium', ARRAY['test']),
('Rohit Sharma', 'India', 'IN', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/354700/354762.jpg', 'Right-hand bat', 'Right-arm off break', ARRAY['test','odi','t20i']),
('Ben Stokes', 'England', 'GB', 'https://img1.hscicdn.com/image/upload/f_auto,t_gn_lt_16_9/lsci/db/PICTURES/CMS/354800/354878.jpg', 'Left-hand bat', 'Right-arm fast-medium', ARRAY['test','odi','t20i'])
ON CONFLICT DO NOTHING;
