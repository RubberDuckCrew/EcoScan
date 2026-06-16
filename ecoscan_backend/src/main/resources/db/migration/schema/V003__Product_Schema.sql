ALTER TABLE product
    ADD categories VARCHAR(255);

ALTER TABLE product
    ALTER COLUMN categories SET NOT NULL;