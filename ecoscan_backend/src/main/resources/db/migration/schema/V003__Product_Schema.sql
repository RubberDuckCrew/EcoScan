ALTER TABLE product
    ADD categories VARCHAR(255);

UPDATE product
SET categories = ''
WHERE data IS NULL;

ALTER TABLE product
    ALTER COLUMN categories SET NOT NULL;