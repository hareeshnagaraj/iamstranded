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

-- Nearby lodging (6)
insert into public.nearby_lodging (crisis_id, name, status, status_label, available_rooms, price_range, distance_km, latitude, longitude, notes)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JW Marriott Deira', 'full', 'Full', 0, '$200-280/night', 8, 25.2716, 55.3280, 'Standby list only'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Arabian Court Hotel', 'limited', 'Limited', 3, '$120-180/night', 12, 25.2230, 55.2990, 'Gov''t subsidy for expat workers'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Deira Twin Towers', 'available', 'Available', 45, '$140-220/night', 14, 25.2680, 55.3350, 'Accepting new bookings'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Al Manara Emergency Shelter', 'shelter', 'Shelter', 25, 'Free', 18, 25.2500, 55.3100, 'UAE cabinet — register with passport'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sharjah Rotana', 'available', 'Available', 60, '$95-150/night', 28, 25.3380, 55.3900, 'Budget option, full amenities'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAK Beach Resort', 'available', 'Available', 120, '$80-140/night', 140, 25.7890, 55.9430, 'Remote, cheapest, 2.5h drive');

-- Emergency contacts (4)
insert into public.emergency_contacts (crisis_id, name, phone, url)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'US Embassy UAE', '+971-4-309-4000', null),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'UK FCO', '+44-20-7008-5000', null),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'India Embassy', '+971-4-397-1222', null),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Emirates Rebooking', null, 'https://emirates.com/rebook');

-- ═══════════════════════════════════════════════════════════════════════════
-- Turkey Earthquake (M7.8) — Gaziantep
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.crisis_events (id, slug, title, location, description, severity, is_active)
values (
  'c2d3e4f5-a6b7-8901-cdef-234567890abc',
  'turkey-earthquake',
  'Turkey Earthquake (M7.8)',
  'Gaziantep, Turkey',
  'M7.8 earthquake in southeastern Turkey — infrastructure damage, airport closures, aftershocks ongoing. ~50,000 travelers affected.',
  'critical',
  true
);

-- Turkey routes (3)
insert into public.routes (id, crisis_id, rank, title, confidence, time_estimate, cost_range, warning_text, detail, origin, destination)
values
  (
    'c1000000-0000-0000-0000-000000000001',
    'c2d3e4f5-a6b7-8901-cdef-234567890abc',
    1,
    'Drive to Adana, fly to Istanbul',
    'HIGH',
    '~8h',
    '$150-350',
    'Road damage near Osmaniye — use D400 coastal route',
    'Drive west on D400 to Adana (3h). Adana airport partially operational — domestic flights running with delays. Turkish Airlines to Istanbul, then connect internationally. Most reliable exit path.',
    'Gaziantep, Turkey',
    'Istanbul, Turkey'
  ),
  (
    'c2000000-0000-0000-0000-000000000002',
    'c2d3e4f5-a6b7-8901-cdef-234567890abc',
    2,
    'Drive to Antalya, fly via Istanbul to London',
    'MEDIUM',
    '~14h',
    '$300-700',
    '8h drive through mountain roads — check conditions',
    'Long drive west to Antalya (8h via Mersin). Antalya airport fully operational, unaffected by quake. Pegasus to Istanbul, then Turkish Airlines to London. Longer but fully operational route.',
    'Gaziantep, Turkey',
    'London, UK'
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'c2d3e4f5-a6b7-8901-cdef-234567890abc',
    3,
    'Wait for Gaziantep airport reopening',
    'LOW',
    '72h+ wait',
    '$100-250',
    'Runway damage — no confirmed reopening date',
    'Gaziantep Oguzeli Airport (GZT) runway has structural cracks from M7.8 main shock. Engineers assessing — earliest realistic reopening 5-7 days. Stay sheltered, register with embassy.',
    'Gaziantep, Turkey',
    'Istanbul, Turkey'
  );

-- Turkey route legs
insert into public.route_legs (route_id, leg_order, airport_code, airport_status, flight_code, departure_time)
values
  ('c1000000-0000-0000-0000-000000000001', 1, 'ADA', 'warning', 'TK 2038', '14:20'),
  ('c1000000-0000-0000-0000-000000000001', 2, 'IST', 'open', null, null),
  ('c2000000-0000-0000-0000-000000000002', 1, 'AYT', 'open', 'PC 1245', '09:30'),
  ('c2000000-0000-0000-0000-000000000002', 2, 'IST', 'open', 'TK 1838', '15:45'),
  ('c2000000-0000-0000-0000-000000000002', 3, 'LHR', 'open', null, null),
  ('c3000000-0000-0000-0000-000000000003', 1, 'GZT', 'closed', 'TK 2066', 'TBD'),
  ('c3000000-0000-0000-0000-000000000003', 2, 'IST', 'open', null, null);

-- Turkey airports (6)
insert into public.nearby_airports (crisis_id, airport_code, airport_name, status, status_label, distance_km, latitude, longitude)
values
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'GZT', 'Gaziantep Oguzeli', 'closed', 'Closed', 20, 36.9472, 37.4787),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'HTY', 'Hatay Airport', 'closed', 'Destroyed', 120, 36.3628, 36.2822),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'ADA', 'Adana Sakirpasa', 'warning', 'Delays', 220, 36.9822, 35.2804),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'AYT', 'Antalya Airport', 'open', 'Open', 560, 36.8987, 30.8005),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'ESB', 'Ankara Esenboga', 'open', 'Open', 580, 40.1281, 32.9951),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'IST', 'Istanbul Airport', 'open', 'Open', 850, 41.2753, 28.7519);

-- Turkey lodging (5)
insert into public.nearby_lodging (crisis_id, name, status, status_label, available_rooms, price_range, distance_km, latitude, longitude, notes)
values
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'AFAD Emergency Camp', 'shelter', 'Shelter', 200, 'Free', 5, 37.0660, 37.3781, 'Government emergency shelter — bring ID'),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'Hilton Garden Inn Gaziantep', 'limited', 'Limited', 8, '$60-100/night', 3, 37.0594, 37.3825, 'Structural inspection passed — limited capacity'),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'Divan Gaziantep', 'closed', 'Closed', 0, null, 4, 37.0612, 37.3750, 'Structural damage — evacuated'),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'Adana HiltonSA', 'available', 'Available', 80, '$70-130/night', 220, 36.9912, 35.3250, 'Fully operational, accepting crisis evacuees'),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'Red Crescent Tent City', 'shelter', 'Shelter', 500, 'Free', 8, 37.0800, 37.4000, 'Turkish Red Crescent — families prioritized');

-- Turkey intel feed (5)
insert into public.intel_feed (crisis_id, category, message, source, source_url)
values
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'safety', 'M5.2 aftershock reported 15km NE of Gaziantep. Stay away from damaged structures. More aftershocks expected.', 'USGS, AFAD', 'https://earthquake.usgs.gov'),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'ground', 'D400 highway to Adana open but single lane near Osmaniye due to bridge damage. Expect 2h delays.', 'Turkey Highways Authority', null),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'flight', 'Turkish Airlines offering free rebooking for all southeastern Turkey departures through next week.', 'Turkish Airlines', 'https://www.turkishairlines.com'),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'embassy', 'US Consulate Adana operating on emergency hours. All non-essential staff evacuated. Register via STEP.', 'US State Department', 'https://travel.state.gov'),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'accommodation', 'AFAD deploying 10,000 additional tents to Gaziantep region. Registration at any government building.', 'AFAD Turkey', null);

-- Turkey emergency contacts (4)
insert into public.emergency_contacts (crisis_id, name, phone, url)
values
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'AFAD Emergency', '122', null),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'US Consulate Adana', '+90-322-346-6262', null),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'UK Embassy Ankara', '+90-312-455-3344', null),
  ('c2d3e4f5-a6b7-8901-cdef-234567890abc', 'Turkish Airlines Crisis', '+90-212-444-0849', 'https://www.turkishairlines.com');

-- ═══════════════════════════════════════════════════════════════════════════
-- Kenya Civil Unrest & Protests — Nairobi
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.crisis_events (id, slug, title, location, description, severity, is_active)
values (
  'd3e4f5a6-b7c8-9012-defa-345678901bcd',
  'kenya-unrest',
  'Kenya Civil Unrest & Protests',
  'Nairobi, Kenya',
  'Widespread protests across Nairobi over tax bill — road blockades, tear gas, airport disruptions. ~15,000 travelers affected.',
  'high',
  true
);

-- Kenya routes (3)
insert into public.routes (id, crisis_id, rank, title, confidence, time_estimate, cost_range, warning_text, detail, origin, destination)
values
  (
    'd1000000-0000-0000-0000-000000000001',
    'd3e4f5a6-b7c8-9012-defa-345678901bcd',
    1,
    'Fly NBO during overnight window to London',
    'HIGH',
    '~9h',
    '$400-800',
    'Protests subside after dark — arrive airport by 9PM',
    'JKIA operating with disruptions during daytime but overnight flights largely unaffected. Kenya Airways red-eye to London departs 23:55. Reach airport via Southern Bypass (avoids CBD). Best window: after 8PM when protests wind down.',
    'Nairobi, Kenya',
    'London, UK'
  ),
  (
    'd2000000-0000-0000-0000-000000000002',
    'd3e4f5a6-b7c8-9012-defa-345678901bcd',
    2,
    'Drive to Mombasa, fly via Muscat to London',
    'MEDIUM',
    '~20h',
    '$500-1000',
    '6h drive on A109 — check road conditions',
    'Drive to Mombasa via A109 Mombasa Road (6h, generally clear of protests). Moi International Airport (MBA) fully operational. Oman Air via Muscat to London. Longer but avoids all Nairobi disruption.',
    'Nairobi, Kenya',
    'London, UK'
  ),
  (
    'd3000000-0000-0000-0000-000000000003',
    'd3e4f5a6-b7c8-9012-defa-345678901bcd',
    3,
    'Wait for NBO normalization, fly direct BA',
    'LOW',
    '24-48h wait',
    '$350-650',
    'Protest timeline unpredictable',
    'British Airways has suspended daytime departures but maintaining standby schedule. If protests de-escalate, flights resume within 24h. Lowest cost but highest uncertainty. Stay near airport — avoid CBD entirely.',
    'Nairobi, Kenya',
    'London, UK'
  );

-- Kenya route legs
insert into public.route_legs (route_id, leg_order, airport_code, airport_status, flight_code, departure_time)
values
  ('d1000000-0000-0000-0000-000000000001', 1, 'NBO', 'warning', 'KQ 100', '23:55'),
  ('d1000000-0000-0000-0000-000000000001', 2, 'LHR', 'open', null, null),
  ('d2000000-0000-0000-0000-000000000002', 1, 'MBA', 'open', 'WY 352', '03:10'),
  ('d2000000-0000-0000-0000-000000000002', 2, 'MCT', 'open', 'WY 101', '10:30'),
  ('d2000000-0000-0000-0000-000000000002', 3, 'LHR', 'open', null, null),
  ('d3000000-0000-0000-0000-000000000003', 1, 'NBO', 'warning', 'BA 065', 'TBD'),
  ('d3000000-0000-0000-0000-000000000003', 2, 'LHR', 'open', null, null);

-- Kenya airports (5)
insert into public.nearby_airports (crisis_id, airport_code, airport_name, status, status_label, distance_km, latitude, longitude)
values
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'WIL', 'Wilson Airport', 'closed', 'Closed', 6, -1.3214, 36.8148),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'NBO', 'Jomo Kenyatta Intl', 'warning', 'Disrupted', 18, -1.3192, 36.9278),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'KIS', 'Kisumu Airport', 'open', 'Open', 340, -0.0862, 34.7289),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'MBA', 'Moi International', 'open', 'Open', 480, -4.0348, 39.5942),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'DAR', 'Julius Nyerere Intl', 'open', 'Open', 660, -6.8781, 39.2026);

-- Kenya lodging (4)
insert into public.nearby_lodging (crisis_id, name, status, status_label, available_rooms, price_range, distance_km, latitude, longitude, notes)
values
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'Hilton Nairobi', 'limited', 'Limited', 12, '$120-200/night', 2, -1.2864, 36.8236, 'CBD location — access may be restricted during protests'),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'Ole Sereni Hotel', 'available', 'Available', 40, '$100-180/night', 10, -1.3375, 36.8489, 'Near JKIA, away from protest zones'),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'Crowne Plaza Nairobi', 'available', 'Available', 55, '$90-160/night', 8, -1.3090, 36.8142, 'Upper Hill — generally calm area'),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'JKIA Transit Hotel', 'available', 'Available', 20, '$60-90/night', 18, -1.3200, 36.9260, 'Inside airport perimeter — safest option for early flights');

-- Kenya intel feed (5)
insert into public.intel_feed (crisis_id, category, message, source, source_url)
values
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'safety', 'Tear gas deployed on Moi Avenue and Kenyatta Avenue. Avoid Nairobi CBD entirely. Use Southern Bypass for airport access.', 'Kenya Police, Reuters', 'https://www.reuters.com'),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'flight', 'Kenya Airways cancels 8 daytime departures. Red-eye flights (after 10PM) still operating. Check rebooking portal.', 'Kenya Airways', 'https://www.kenya-airways.com'),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'ground', 'Uber and Bolt suspended in Nairobi CBD. Services available in Westlands, Kilimani, and airport area.', 'Uber Kenya, local reports', null),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'embassy', 'US Embassy Nairobi closed to public. Emergency services via phone only. Avoid Gigiri area after 2PM.', 'US Embassy Nairobi', 'https://ke.usembassy.gov'),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'accommodation', 'Hotels near JKIA offering crisis rates for stranded travelers. Ole Sereni and JKIA Transit best positioned.', 'Local hotel associations', null);

-- Kenya emergency contacts (4)
insert into public.emergency_contacts (crisis_id, name, phone, url)
values
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'Kenya Emergency', '999', null),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'US Embassy Nairobi', '+254-20-363-6000', null),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'UK High Commission', '+254-20-287-3000', null),
  ('d3e4f5a6-b7c8-9012-defa-345678901bcd', 'Kenya Airways Support', '+254-20-327-4747', 'https://www.kenya-airways.com');
