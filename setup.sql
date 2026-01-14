-- -----------------------------------------------------------------------------
-- 0. Cleanup existing objects
-- -----------------------------------------------------------------------------
drop table if exists public.products cascade;
drop table if exists public.services cascade;
drop table if exists public.tests cascade;
-- Keeping site_content and blogs if they are used by other parts of the app, 
-- but ensuring services/tests are clean.

-- -----------------------------------------------------------------------------
-- 1. Table: services
-- -----------------------------------------------------------------------------
create table public.services (
  id text primary key,
  service_type text not null,
  unit text,
  price numeric default 0,
  qty numeric default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.services enable row level security;

create policy "Services are viewable by everyone"
  on public.services for select
  using ( true );

create policy "Allow public management of services"
  on public.services for all
  using ( true )
  with check ( true );

-- -----------------------------------------------------------------------------
-- 2. Table: tests
-- -----------------------------------------------------------------------------
create table public.tests (
  id text primary key,
  test_type text not null,
  materials text,
  "group" text, -- "group" is a reserved keyword, so quote it
  test_method_specification text,
  num_days numeric default 0,
  price numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tests enable row level security;

create policy "Tests are viewable by everyone"
  on public.tests for select
  using ( true );

create policy "Allow public management of tests"
  on public.tests for all
  using ( true )
  with check ( true );

-- -----------------------------------------------------------------------------
-- 3. Insert sample data
-- -----------------------------------------------------------------------------

-- Sample Services
insert into public.services (id, service_type, unit, price, qty) values
('S1','Mobilization of rig equipment & personnel with all other necessary accessories for carrying out investigations at site and demobilization after completion (Per Rig Per Site Location) including other incidental expenses.','LS',25000,1),
('S2','Drilling and Handling (Shifting) Charges from one bore hole to another bore hole.','LS',2000,22),
('S3','Boring/ Drilling 100/150mm dia boreholes in all kinds of soil and taking necessary soil samples upto a depth of 10 m.','Per Meter',1200,184),
('S4','Boring/ Drilling in refusal strata/ Weathered Rock/ Soft rock using NX size TC bit and taking necessary rock samples as per client scope.','Per Meter',1200,184),
('S5','Boring/ Drilling in Hard rock using Diamond bit and taking necessary rock samples as per client scope.','Per Meter',2500,46),
('S6','Drilling 10 m to 15 m','Per Meter',500,1),
('S7','Drilling 10 m to 15 m','Per Meter',1000,1),
('S8','Drilling 15 m to 20 m','Per Meter',1500,1),
('S9','Laboratory Tests on soil - Determination of moisture content','Per Bore hole/ Per sample',500,10),
('S10','Laboratory Tests on soil - Determination of Specific Gravity','Per Bore hole/ Per sample',500,10),
('S11','Laboratory Tests on soil - Grain size Analysis (Sieve and Hydrometer)','Per Bore hole/ Per sample',1500,10),
('S12','Laboratory Tests on soil - Determination of Liquid limit and Plastic limit','Per Bore hole/ Per sample',1800,10),
('S13','Laboratory Tests on soil - Determination of Shrinkage limit','Per Bore hole/ Per sample',1400,10),
('S14','Laboratory Tests on soil - Standard Proctor Compaction Test','Per Bore hole/ Per sample',2000,10),
('S15','Laboratory Tests on soil - Swell Pressure and Free Swell Index','Per Bore hole/ Per sample',2000,10),
('S16','Laboratory Tests on soil - Lab CBR Test','Per Bore hole/ Per sample',2000,10),
('S17','Laboratory Tests on UDS/DS Sample - Bulk Density and Moisture Content','Per Bore hole/ Per sample',500,10),
('S18','Laboratory Tests on UDS/DS Sample - Relative Density for sand','Per Bore hole/ Per sample',500,10),
('S19','Laboratory Tests on UDS/DS Sample - Unconfined Compression Test','Per Bore hole/ Per sample',1500,10),
('S20','Laboratory Tests on UDS/DS Sample - Triaxial Test (UU/CU/CD)','Per Bore hole/ Per sample',1800,10),
('S21','Laboratory Tests on UDS/DS Sample - Direct Shear Test','Per Bore hole/ Per sample',1400,10),
('S22','Laboratory Tests on UDS/DS Sample - Consolidation Test','Per Bore hole/ Per sample',2000,10),
('S23','Laboratory Tests on UDS/DS Sample - Lab Permeability Test','Per Bore hole/ Per sample',2000,11),
('S24','Laboratory Tests on Rock Sample - Moisture Content, Porosity and Density','Per Bore hole/ Per sample',500,10),
('S25','Laboratory Tests on Rock Sample - Specific gravity','Per Bore hole/ Per sample',500,10),
('S26','Laboratory Tests on Rock Sample - Hardness','Per Bore hole/ Per sample',1500,10),
('S27','Laboratory Tests on Rock Sample - Slake Durability','Per Bore hole/ Per sample',1800,10),
('S28','Laboratory Tests on Rock Sample - Unconfined Compressive Strength (Saturated and In-situ water content)','Per Bore hole/ Per sample',1400,10),
('S29','Laboratory Tests on Rock Sample - Point Load Strength','Per Bore hole/ Per sample',2000,10),
('S30','Laboratory Tests on Rock Sample - Deformability Test','Per Bore hole/ Per sample',2000,10),
('S31','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - pH Value','Per Bore hole/ Per sample',500,10),
('S32','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Carbonates','Per Bore hole/ Per sample',500,10),
('S33','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Sulphates (SO3 & SO4)','Per Bore hole/ Per sample',1500,10),
('S34','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Chlorides','Per Bore hole/ Per sample',1800,10),
('S35','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Turbidity and Odour (Only for ground water)','Per Bore hole/ Per sample',2000,10),
('S36','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Sulphides','Per Bore hole/ Per sample',2000,10),
('S37','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Alkalinity','Per Bore hole/ Per sample',500,10),
('S38','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Redox Potential','Per Bore hole/ Per sample',500,10),
('S39','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Soluble Salts','Per Bore hole/ Per sample',1500,10),
('S40','Laboratory Tests (Chemical) on Subsoil/Groundwater Sample - Organic Matter','Per Bore hole/ Per sample',1800,10),
('S41','Electrical Resistivity Test (ERT)','Per Point',15000,3),
('S42','Field Permeability Test','Per Point',6000,3),
('S43','Field California Bearing Ratio (CBR) Test','Per Point',10000,3),
('S44','Dynamic Cone Penetration Test (DCPT)','Per Point',10000,3),
('S45','Submission of Geotechnical Investigation report along with recommendations of type and depth of foundations, precautionary measures and recommendations.','LS',25000,1),
('S46','Medical, safety and Labour Accommodation and food including any to and fro travel expenses.','LS',25000,1);

insert into public.services (id, service_type, unit, price, qty) values
('S47','Transportation and Mobilization of Hand operated Auger Equipments, SPT Equipments, UDS setup, men to Project Site and withdrawing of the same after completion of all field investigations works.','LS',30000,1),
('S48','Boring 150/100mm dia bore holes up to 6.0 m depth in all type of strata or N value >50, whichever is met earlier, including conducting Standard Penetration Test at every 1.00 / 1.50m interval or change of strata whichever are earlier, collecting Undisturbed and disturbed soil samples.','Per Borehole',22000,5),
('S49','Conducting the following Laboratory Tests (as per IS codes)','LS',15000,1),
('S50','Laboratory Test – Determination of Natural Moisture content as per IS 2720 (Part 2):1973','Included',0,1),
('S51','Laboratory Test – Determination of Specific Gravity as per IS 2720 (Part 3/Sec 1):1980','Included',0,1),
('S52','Laboratory Test – Determination of Particle Size analysis (Grain size & Hydrometer Method) as per IS 2720 (Part 4):1985','Included',0,1),
('S53','Laboratory Test – Determination of Liquid limit and Plastic limit as per IS 2720 (Part 5):1985','Included',0,1),
('S54','Laboratory Test – Conducting Direct Shear Tests as per IS 2720 (Part 13):1986','Included',0,1),
('S55','Submission of Technical Report with relevant locations regarding SBC of Soil, Type and Depth of Foundations and Improvements to Foundation soil if any.','LS',10000,1);

insert into public.services (id, service_type, unit, price, qty) values
('S56','Mobilization of rig equipment & personnel with all other necessary accessories for carrying out investigations at site and demobilization after completion (Per Rig Per Site Location) including other incidental expenses.','LS',25000,1),
('S57','Drilling and Handling (Shifting) Charges from one bore hole to another bore hole.','LS',2000,22),
('S58','Boring/ Drilling 100/150mm dia boreholes in all kinds of soil/ refusal strata/ Weathered Rock/ Soft rock using NX size TC bit / 1.0 m in Hard rock using Diamond bit and taking necessary soil/ rock samples upto a depth of 10 m.','Per Meter',3000,184),
('S59','Drilling 10 m to 15 m','Per Meter',3500,1),
('S60','Drilling 10 m to 15 m','Per Meter',4000,1),
('S61','Drilling 15 m to 20 m','Per Meter',4500,1),
('S62','Laboratory Tests on soil - Determination of moisture content','Per Bore hole/ Per sample',500,10),
('S63','Laboratory Tests on soil - Determination of Specific Gravity','Per Bore hole/ Per sample',500,10),
('S64','Laboratory Tests on soil - Grain size Analysis (Sieve and Hydrometer)','Per Bore hole/ Per sample',500,10),
('S65','Laboratory Tests on soil - Determination of Liquid limit and Plastic limit','Per Bore hole/ Per sample',500,10),
('S66','Laboratory Tests on soil - Determination of Shrinkage limit','Per Bore hole/ Per sample',500,10),
('S67','Laboratory Tests on soil - Standard Proctor Compaction Test','Per Bore hole/ Per sample',500,10),
('S68','Laboratory Tests on soil - Swell Pressure and Free Swell Index','Per Bore hole/ Per sample',500,10),
('S69','Laboratory Tests on soil - Lab CBR Test','Per Bore hole/ Per sample',500,10),
('S70','Laboratory Tests on UDS/DS Sample - Bulk Density and Moisture Content','Per Bore hole/ Per sample',500,10),
('S71','Laboratory Tests on UDS/DS Sample - Relative Density for sand','Per Bore hole/ Per sample',500,10),
('S72','Laboratory Tests on UDS/DS Sample - Unconfined Compression Test','Per Bore hole/ Per sample',500,10),
('S73','Laboratory Tests on UDS/DS Sample - Triaxial Test (UU/CU/CD)','Per Bore hole/ Per sample',500,10),
('S74','Laboratory Tests on UDS/DS Sample - Direct Shear Test','Per Bore hole/ Per sample',500,10),
('S75','Laboratory Tests on UDS/DS Sample - Consolidation Test','Per Bore hole/ Per sample',500,10),
('S76','Laboratory Tests on UDS/DS Sample - Lab Permeability Test','Per Bore hole/ Per sample',500,11),
('S77','Laboratory Tests on Rock Sample - Moisture Content, Porosity and Density','Per Bore hole/ Per sample',500,10),
('S78','Laboratory Tests on Rock Sample - Specific gravity','Per Bore hole/ Per sample',500,10),
('S79','Laboratory Tests on Rock Sample - Hardness','Per Bore hole/ Per sample',500,10),
('S80','Laboratory Tests on Rock Sample - Slake Durability','Per Bore hole/ Per sample',500,10),
('S81','Laboratory Tests on Rock Sample - Unconfined Compressive Strength (Saturated and In-situ water content)','Per Bore hole/ Per sample',500,10),
('S82','Laboratory Tests on Rock Sample - Point Load Strength','Per Bore hole/ Per sample',500,10),
('S83','Laboratory Tests on Rock Sample - Deformability Test','Per Bore hole/ Per sample',500,10),
('S84','Submission of Geotechnical Investigation report along with recommendations of type and depth of foundations, precautionary measures and recommendations.','LS',5000,1);


-- Sample Tests
insert into public.tests (id, test_type, materials, "group", test_method_specification, num_days, price) values
('T1', 'Organic Impurities Analysis', 'Aggregate (Coarse)', 'Chemical', 'IS2385 (Part2)', 6, 3000),
('T2', 'Sieve Analysis', 'Aggregate (Coarse)', 'Physical', 'IS2386 (Part1)', 2, 500);
