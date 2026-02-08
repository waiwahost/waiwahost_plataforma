ALTER TABLE inmuebles ALTER COLUMN comision TYPE DECIMAL(10,2) USING NULLIF(comision, '')::numeric;
