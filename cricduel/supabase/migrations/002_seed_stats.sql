-- Seed batting and bowling stats for seeded players
-- Run AFTER 001_initial_schema.sql

DO $$
DECLARE
  sachin_id UUID;
  ponting_id UUID;
  lara_id UUID;
  kallis_id UUID;
  warne_id UUID;
  murali_id UUID;
  dhoni_id UUID;
  kohli_id UUID;
  abdev_id UUID;
  smith_id UUID;
  root_id UUID;
  kane_id UUID;
  wasim_id UUID;
  mcgrath_id UUID;
  imran_id UUID;
  viv_id UUID;
  gavaskar_id UUID;
  bradman_id UUID;
  rohit_id UUID;
  stokes_id UUID;
BEGIN
  SELECT id INTO sachin_id FROM players WHERE name = 'Sachin Tendulkar' LIMIT 1;
  SELECT id INTO ponting_id FROM players WHERE name = 'Ricky Ponting' LIMIT 1;
  SELECT id INTO lara_id FROM players WHERE name = 'Brian Lara' LIMIT 1;
  SELECT id INTO kallis_id FROM players WHERE name = 'Jacques Kallis' LIMIT 1;
  SELECT id INTO warne_id FROM players WHERE name = 'Shane Warne' LIMIT 1;
  SELECT id INTO murali_id FROM players WHERE name = 'Muttiah Muralitharan' LIMIT 1;
  SELECT id INTO dhoni_id FROM players WHERE name = 'MS Dhoni' LIMIT 1;
  SELECT id INTO kohli_id FROM players WHERE name = 'Virat Kohli' LIMIT 1;
  SELECT id INTO abdev_id FROM players WHERE name = 'AB de Villiers' LIMIT 1;
  SELECT id INTO smith_id FROM players WHERE name = 'Steve Smith' LIMIT 1;
  SELECT id INTO root_id FROM players WHERE name = 'Joe Root' LIMIT 1;
  SELECT id INTO kane_id FROM players WHERE name = 'Kane Williamson' LIMIT 1;
  SELECT id INTO wasim_id FROM players WHERE name = 'Wasim Akram' LIMIT 1;
  SELECT id INTO mcgrath_id FROM players WHERE name = 'Glenn McGrath' LIMIT 1;
  SELECT id INTO imran_id FROM players WHERE name = 'Imran Khan' LIMIT 1;
  SELECT id INTO viv_id FROM players WHERE name = 'Vivian Richards' LIMIT 1;
  SELECT id INTO gavaskar_id FROM players WHERE name = 'Sunil Gavaskar' LIMIT 1;
  SELECT id INTO bradman_id FROM players WHERE name = 'Don Bradman' LIMIT 1;
  SELECT id INTO rohit_id FROM players WHERE name = 'Rohit Sharma' LIMIT 1;
  SELECT id INTO stokes_id FROM players WHERE name = 'Ben Stokes' LIMIT 1;

  -- Sachin Tendulkar
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (sachin_id, 'test', 200, 329, 15921, 33, 53.79, 54.04, 51, 68, '248*'),
    (sachin_id, 'odi', 463, 452, 18426, 41, 44.83, 86.23, 49, 96, '200*')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (sachin_id, 'test', 200, 46, 54.17, 2.70, 120.3, '3/10', 0),
    (sachin_id, 'odi', 463, 154, 44.48, 5.10, 52.3, '5/32', 2)
  ON CONFLICT DO NOTHING;

  -- Ricky Ponting
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (ponting_id, 'test', 168, 287, 13378, 29, 51.85, 58.94, 41, 62, '257'),
    (ponting_id, 'odi', 375, 365, 13704, 39, 42.03, 80.39, 30, 82, '164')
  ON CONFLICT DO NOTHING;

  -- Brian Lara
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (lara_id, 'test', 131, 232, 11953, 6, 52.89, 60.51, 34, 48, '400*'),
    (lara_id, 'odi', 299, 289, 10405, 32, 40.48, 79.91, 19, 63, '169')
  ON CONFLICT DO NOTHING;

  -- Jacques Kallis
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (kallis_id, 'test', 166, 280, 13289, 40, 55.37, 46.01, 45, 58, '224'),
    (kallis_id, 'odi', 328, 314, 11579, 59, 45.41, 72.89, 17, 86, '139')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (kallis_id, 'test', 166, 292, 32.65, 2.87, 68.2, '6/54', 5),
    (kallis_id, 'odi', 328, 273, 31.79, 4.37, 43.6, '5/30', 1)
  ON CONFLICT DO NOTHING;

  -- Shane Warne
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (warne_id, 'test', 145, 199, 3154, 17, 17.32, 57.48, 0, 12, '99')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (warne_id, 'test', 145, 708, 25.41, 2.65, 57.4, '8/71', 37)
  ON CONFLICT DO NOTHING;

  -- Murali
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (murali_id, 'test', 133, 164, 1261, 59, 12.01, 51.36, 0, 0, '67'),
    (murali_id, 'odi', 350, 172, 674, 82, 7.49, 63.50, 0, 0, '33*')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (murali_id, 'test', 133, 800, 22.72, 2.47, 55.0, '9/51', 67),
    (murali_id, 'odi', 350, 534, 23.08, 3.93, 35.2, '7/30', 10)
  ON CONFLICT DO NOTHING;

  -- MS Dhoni
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (dhoni_id, 'test', 90, 144, 4876, 16, 38.09, 59.80, 6, 33, '224'),
    (dhoni_id, 'odi', 350, 297, 10773, 84, 50.57, 87.56, 10, 73, '183*'),
    (dhoni_id, 't20i', 98, 85, 1617, 42, 37.60, 126.13, 0, 2, '56')
  ON CONFLICT DO NOTHING;

  -- Virat Kohli
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (kohli_id, 'test', 113, 193, 9000, 10, 49.18, 57.55, 30, 31, '254*'),
    (kohli_id, 'odi', 292, 280, 13848, 52, 60.73, 93.49, 50, 72, '183'),
    (kohli_id, 't20i', 117, 107, 4037, 32, 53.83, 137.96, 1, 37, '122*')
  ON CONFLICT DO NOTHING;

  -- AB de Villiers
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (abdev_id, 'test', 114, 191, 8765, 18, 50.66, 56.01, 22, 46, '278*'),
    (abdev_id, 'odi', 228, 218, 9577, 39, 53.50, 101.13, 25, 53, '176'),
    (abdev_id, 't20i', 78, 75, 1672, 20, 30.40, 135.17, 0, 10, '79*')
  ON CONFLICT DO NOTHING;

  -- Steve Smith
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (smith_id, 'test', 104, 185, 9117, 18, 54.59, 55.35, 32, 37, '239'),
    (smith_id, 'odi', 128, 116, 4162, 26, 46.24, 86.98, 11, 27, '164*'),
    (smith_id, 't20i', 36, 30, 723, 9, 34.43, 128.77, 0, 3, '90')
  ON CONFLICT DO NOTHING;

  -- Joe Root
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (root_id, 'test', 145, 259, 12472, 19, 51.97, 55.33, 34, 62, '254'),
    (root_id, 'odi', 162, 155, 6207, 16, 44.65, 86.85, 16, 39, '133*'),
    (root_id, 't20i', 32, 28, 893, 8, 44.65, 125.80, 1, 7, '90*')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (root_id, 'test', 145, 65, 47.00, 2.80, 100.5, '5/8', 1)
  ON CONFLICT DO NOTHING;

  -- Kane Williamson
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (kane_id, 'test', 96, 170, 8261, 11, 51.95, 52.38, 26, 42, '251'),
    (kane_id, 'odi', 161, 151, 6554, 18, 49.28, 81.41, 13, 43, '148'),
    (kane_id, 't20i', 75, 71, 2265, 17, 41.94, 125.77, 0, 17, '95')
  ON CONFLICT DO NOTHING;

  -- Wasim Akram
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (wasim_id, 'test', 104, 147, 2898, 19, 22.64, 54.58, 3, 7, '257*'),
    (wasim_id, 'odi', 356, 280, 3717, 83, 18.88, 88.44, 1, 6, '86')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (wasim_id, 'test', 104, 414, 23.62, 2.78, 51.0, '7/119', 25),
    (wasim_id, 'odi', 356, 502, 23.52, 3.89, 36.2, '5/15', 6)
  ON CONFLICT DO NOTHING;

  -- Glenn McGrath
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (mcgrath_id, 'test', 124, 138, 641, 51, 7.36, 48.74, 0, 0, '61')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (mcgrath_id, 'test', 124, 563, 21.64, 2.49, 51.9, '8/24', 29),
    (mcgrath_id, 'odi', 250, 381, 22.02, 3.88, 34.0, '7/15', 7)
  ON CONFLICT DO NOTHING;

  -- Imran Khan
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (imran_id, 'test', 88, 126, 3807, 25, 37.69, 49.70, 6, 18, '136'),
    (imran_id, 'odi', 175, 151, 3709, 38, 32.82, 72.00, 1, 19, '102*')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (imran_id, 'test', 88, 362, 22.81, 2.54, 53.7, '8/58', 23),
    (imran_id, 'odi', 175, 182, 26.61, 3.89, 41.1, '6/14', 1)
  ON CONFLICT DO NOTHING;

  -- Vivian Richards
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (viv_id, 'test', 121, 182, 8540, 12, 50.24, 61.12, 24, 45, '291'),
    (viv_id, 'odi', 187, 167, 6721, 24, 47.00, 90.20, 11, 45, '189*')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (viv_id, 'odi', 187, 118, 35.83, 4.26, 50.5, '6/41', 2)
  ON CONFLICT DO NOTHING;

  -- Sunil Gavaskar
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (gavaskar_id, 'test', 125, 214, 10122, 16, 51.12, 51.00, 34, 45, '236*')
  ON CONFLICT DO NOTHING;

  -- Don Bradman
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (bradman_id, 'test', 52, 80, 6996, 10, 99.94, 61.00, 29, 13, '334')
  ON CONFLICT DO NOTHING;

  -- Rohit Sharma
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (rohit_id, 'test', 67, 111, 4301, 8, 41.76, 59.28, 12, 19, '212'),
    (rohit_id, 'odi', 264, 252, 10709, 37, 49.57, 89.89, 31, 55, '264'),
    (rohit_id, 't20i', 159, 156, 4231, 21, 31.34, 139.65, 4, 28, '118')
  ON CONFLICT DO NOTHING;

  -- Ben Stokes
  INSERT INTO batting_stats (player_id, format, matches, innings, runs, not_outs, average, strike_rate, hundreds, fifties, highest_score) VALUES
    (stokes_id, 'test', 105, 181, 6462, 15, 38.93, 58.57, 13, 34, '258'),
    (stokes_id, 'odi', 105, 93, 2924, 21, 40.61, 94.83, 3, 21, '102*'),
    (stokes_id, 't20i', 39, 33, 529, 10, 23.00, 133.25, 0, 2, '47*')
  ON CONFLICT DO NOTHING;
  INSERT INTO bowling_stats (player_id, format, matches, wickets, average, economy, strike_rate, best_bowling, five_wickets) VALUES
    (stokes_id, 'test', 105, 196, 32.80, 3.33, 59.1, '6/22', 4),
    (stokes_id, 'odi', 105, 74, 41.35, 5.85, 42.4, '5/61', 1)
  ON CONFLICT DO NOTHING;

END $$;

-- Initialize Elo ratings at 1500 for all player/format combinations
INSERT INTO player_ratings (player_id, format, elo_rating)
SELECT p.id, f.format, 1500
FROM players p
CROSS JOIN (VALUES ('test'), ('odi'), ('t20i')) AS f(format)
WHERE f.format::text = ANY(p.formats)
ON CONFLICT (player_id, format) DO NOTHING;
