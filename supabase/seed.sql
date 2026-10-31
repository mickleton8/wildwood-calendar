-- =============================================================================
-- Seed Data: North Wildwood Entertainment District Cohort
-- =============================================================================

insert into public.venues (id, slug, name, neighborhood, address, cross_street, lat, lng, website_url, facebook_url, instagram_handle, phone, is_year_round)
values
  ('11111111-1111-1111-1111-111111111101', 'anglesea-pub', 'Anglesea Pub', 'North Wildwood (Anglesea)', '116 W 1st Ave, North Wildwood, NJ', '1st & Olde New Jersey Ave', 39.0074, -74.7942, 'https://angleseapub.com', 'https://facebook.com/angleseapub', '@angleseapub', '(609) 729-1133', true),
  ('11111111-1111-1111-1111-111111111102', 'owens-pub', 'Owen''s Pub', 'North Wildwood', '119 E 17th Ave, North Wildwood, NJ', '17th & New Jersey Ave', 38.9968, -74.7995, 'https://owens.pub/', 'https://facebook.com/owenspub', '@owenspubnw', '(609) 729-7290', true),
  ('11111111-1111-1111-1111-111111111103', 'keenans-irish-pub', 'Keenan''s Irish Pub', 'North Wildwood (Olde NJ Ave)', '113 Olde New Jersey Ave, North Wildwood, NJ', 'Walnut & Olde New Jersey Ave', 39.0065, -74.7931, 'https://keenansirishpub.com', 'https://facebook.com/keenansnw', '@keenansnw', '(609) 729-3344', false),
  ('11111111-1111-1111-1111-111111111104', 'joe-joes-place', 'Joe Joe''s Place', 'North Wildwood', '2201 Delaware Ave, North Wildwood, NJ', '22nd & Delaware Ave', 38.9932, -74.8055, null, 'https://facebook.com/joejoesplace', '@joejoesplacenw', '(609) 522-5646', true),
  ('11111111-1111-1111-1111-111111111105', 'flip-flopz', 'Flip Flopz Beach Bar & Grill', 'North Wildwood (Olde NJ Ave)', '106 W Spruce Ave, North Wildwood, NJ', 'Spruce & Olde New Jersey Ave', 39.0059, -74.7928, 'https://flipflopzbeachbar.com', 'https://facebook.com/flipflopz', '@flipflopznw', '(609) 522-3350', false),
  ('11111111-1111-1111-1111-111111111106', 'mudhen-brewing', 'MudHen Brewing Company', 'Wildwood Border', '127 W Rio Grande Ave, Wildwood, NJ', 'Rio Grande & New Jersey Ave', 38.9835, -74.8195, 'https://mudhenbrew.com', 'https://facebook.com/mudhenbrew', '@mudhenbrew', '(609) 846-7918', true),
  ('11111111-1111-1111-1111-111111111107', 'tavern-on-the-bay', 'Tavern on the Bay', 'North Wildwood (Anglesea)', '800 N New York Ave, North Wildwood, NJ', 'Hereford Inlet Bayfront', 39.0108, -74.7960, 'https://tavernonthebayresort.com', 'https://facebook.com/tavernonthebay', '@tavernonthebaynj', '(609) 522-6244', true),
  ('11111111-1111-1111-1111-111111111108', 'old-city-pub', 'Old City Pub', 'North Wildwood (Olde NJ Ave)', '1408 New Jersey Ave, North Wildwood, NJ', '14th & New Jersey Ave', 38.9989, -74.7982, 'https://oldcitypubnw.com', 'https://facebook.com/oldcitypub', '@oldcitypubnw', '(609) 854-3686', true)
on conflict (slug) do nothing;

-- Seed Recurring Happy Hours & Weekly Specials
insert into public.recurring_rules (id, venue_id, category, title, days_of_week, start_time, end_time, end_time_label, deals_summary, tags, notes)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'happy_hour', 'Anglesea Pub Afternoon Happy Hour', '{1,2,3,4,5}', '15:00', '18:00', null, '["$3.50 Domestic Pints", "$5 Guinness Imperial Pints (Thu)", "$7 Jameson Orange Crushes", "$8 Pub Pretzel & Beer Cheese"]'::jsonb, '{"draft_beer","crushes","half_price_apps"}', 'Bar area & high-tops'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'happy_hour', 'Owen''s Locals Happy Hour & Wing Special', '{1,2,3,4,5}', '16:00', '19:00', null, '["$2.75 Miller Lite & Yuengling Drafts", "75¢ Jumbo Wings (Eat-in w/ Beverage)", "$6 House Cocktails", "$7 Roast Beef Sandwiches"]'::jsonb, '{"draft_beer","wings","burgers_sandwiches"}', 'Cash or card; eat-in at bar'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'happy_hour', 'Keenan''s Patio & Crush Happy Hour', '{5,6}', '15:00', '19:00', null, '["$6 Fresh Squeezed Orange & Grapefruit Crushes", "$3.50 Miller Lite Bottles", "1/2 Price Loaded Tots & Flatbreads"]'::jsonb, '{"crushes","cans_bottles","half_price_apps","outdoor_deck"}', 'Shoulder season Fri/Sat schedule'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'daily_special', 'Joe Joe''s Buck-a-Shuck & Prime Rib', '{4,5}', '16:00', '21:00', null, '["$1.25 Cape May Salts Oysters & Clams", "$3 Domestic Mugs", "$22 Queen Cut Prime Rib Dinner"]'::jsonb, '{"oysters_clams","draft_beer"}', 'Until sold out'),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111106', 'happy_hour', 'MudHen Craft & Smokehouse Happy Hour', '{1,2,3,4,5}', '15:00', '18:00', null, '["$2 Off All House Craft Pints", "$8 Smoked Brisket Sliders", "$7 Smoked Wings", "$6 House Sangria"]'::jsonb, '{"draft_beer","wings","burgers_sandwiches"}', 'Available in Biergarten & Main Bar'),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111107', 'happy_hour', 'Sunset Bayfront Raw Bar & Cocktail Hour', '{3,4,5,6,0}', '16:00', '18:30', null, '["$1.50 Little Neck Clams & Oysters", "$8 Espresso Martinis", "$6 House Wine Pours", "$9 Crab Dip Skillet"]'::jsonb, '{"oysters_clams","cocktails","wine","outdoor_deck"}', 'Downstairs Bay Bar')
on conflict (id) do nothing;

-- Materialize the next 30 days of recurring rules
select public.materialize_recurring_rules(current_date, 30);
