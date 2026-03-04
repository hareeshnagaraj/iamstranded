-- iamstranded seed data — UAE airspace closure scenario

-- Crisis event
insert into public.crisis_events (id, slug, title, location, description, severity, is_active)
values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'uae-airspace-closure',
  'UAE & Middle East Airspace Closures',
  'Dubai, UAE',
  'Iran strikes — 12+ airports closed across UAE, Qatar, Bahrain, Israel. ~90,000 passengers/day affected.',
  'critical',
  true
);

-- Routes (3 ranked options)
insert into public.routes (id, crisis_id, rank, title, confidence, time_estimate, cost_range, warning_text, detail, origin, destination)
values
  (
    'b1000000-0000-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    1,
    'Drive to Muscat, fly via Istanbul to Athens',
    'HIGH',
    '~18h',
    '$450-800',
    'Check Oman visa for Indian passport',
    'Drive Al Nahda to Muscat via Hatta border (4h, less congested than Al Ain). Muscat fully operational. Turkish Airlines to Istanbul, 3h layover, Aegean morning flight to Athens. Highest-confidence: all segments operating, avoids closed airspace.',
    'Al Nahda, Dubai',
    'Athens, Greece'
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    2,
    'Drive to Muscat, direct to Athens',
    'MEDIUM',
    '~12h',
    '$600-1100',
    'Limited seats — sells out fast',
    'Same Muscat drive, connecting to Olympic Air direct service. Faster but limited availability. Check immediately — selling out within hours during crisis.',
    'Al Nahda, Dubai',
    'Athens, Greece'
  ),
  (
    'b3000000-0000-0000-0000-000000000003',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    3,
    'Wait for DXB reopening, direct Emirates',
    'LOW',
    '48-72h wait',
    '$300-500',
    'No confirmed reopening date',
    'Emirates suspended until at least Tue afternoon. Earliest realistic reopening ~Mar 5 per NOTAM data. Rebooking waivers active through Mar 18, no change fees. Lowest effort, highest uncertainty.',
    'Al Nahda, Dubai',
    'Athens, Greece'
  );

-- Route legs
-- Route 1: MCT -> IST -> ATH
insert into public.route_legs (route_id, leg_order, airport_code, airport_status, flight_code, departure_time)
values
  ('b1000000-0000-0000-0000-000000000001', 1, 'MCT', 'open', 'TK 773', '22:40'),
  ('b1000000-0000-0000-0000-000000000001', 2, 'IST', 'open', 'A3 991', '06:15+1'),
  ('b1000000-0000-0000-0000-000000000001', 3, 'ATH', 'open', null, null);

-- Route 2: MCT -> ATH
insert into public.route_legs (route_id, leg_order, airport_code, airport_status, flight_code, departure_time)
values
  ('b2000000-0000-0000-0000-000000000002', 1, 'MCT', 'open', 'OA 264', '01:30'),
  ('b2000000-0000-0000-0000-000000000002', 2, 'ATH', 'open', null, null);

-- Route 3: DXB -> ATH
insert into public.route_legs (route_id, leg_order, airport_code, airport_status, flight_code, departure_time)
values
  ('b3000000-0000-0000-0000-000000000003', 1, 'DXB', 'closed', 'EK 209', 'TBD'),
  ('b3000000-0000-0000-0000-000000000003', 2, 'ATH', 'open', null, null);

-- Nearby airports (7)
insert into public.nearby_airports (crisis_id, airport_code, airport_name, status, status_label, distance_km, latitude, longitude)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'DXB', 'Dubai International', 'closed', 'Closed', 15, 25.2532, 55.3657),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SHJ', 'Sharjah International', 'closed', 'Closed', 22, 25.3285, 55.5172),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AUH', 'Abu Dhabi Zayed Intl', 'closed', 'Closed', 140, 24.4431, 54.6511),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'MCT', 'Muscat International', 'open', 'Open', 450, 23.5933, 58.2844),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SLL', 'Salalah', 'open', 'Open', 1100, 17.0387, 54.0914),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BAH', 'Bahrain International', 'warning', 'Partial', 530, 26.2708, 50.6336),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'DOH', 'Hamad International', 'closed', 'Closed', 490, 25.2731, 51.6081);

-- Intel feed (5 items)
insert into public.intel_feed (crisis_id, category, message, source, source_url)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'flight', 'Emirates confirms DXB suspension extended to Tuesday 4 Mar afternoon. Rebooking waivers active through March 18.', 'Emirates official, AP', 'https://www.emirates.com/notices'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ground', 'Travelers reporting 3-4h drive to Muscat from Dubai via Hatta. Al Ain border less congested. Car rental limited — book now.', 'X/Twitter aggregated (12 reports)', null),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'accommodation', 'UAE government confirms hotel costs covered for stranded travelers. Contact hotel front desk to extend stay.', 'CNN, The National', 'https://www.cnn.com/middleeast'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'embassy', 'US Embassy advises shelter in place. Register with STEP program for evacuation updates. Consular services limited hours.', 'US State Department', 'https://travel.state.gov/uae'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'safety', 'Missile debris in industrial areas east of Sharjah. Avoid Al Nahda industrial zone after dark.', 'UAE Civil Defense', null);

-- Emergency contacts (4)
insert into public.emergency_contacts (crisis_id, name, phone, url)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'US Embassy UAE', '+971-4-309-4000', null),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'UK FCO', '+44-20-7008-5000', null),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'India Embassy', '+971-4-397-1222', null),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Emirates Rebooking', null, 'https://emirates.com/rebook');
