ALTER TABLE product
    ADD COLUMN data TEXT;

UPDATE product
    SET data = '{}'
    WHERE data IS NULL;

ALTER TABLE product
    ALTER COLUMN data SET NOT NULL;