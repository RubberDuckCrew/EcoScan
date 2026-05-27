CREATE TABLE product
(
    id                UUID          NOT NULL,
    dtype             VARCHAR(31)   NOT NULL,
    name              VARCHAR(255)  NOT NULL,
    barcode           VARCHAR(255)  NOT NULL,
    description       VARCHAR(2048) NOT NULL,
    score             INTEGER       NOT NULL,
    environment_score INTEGER       NOT NULL,
    social_score      INTEGER       NOT NULL,
    health_score      INTEGER       NOT NULL,
    justification     VARCHAR(2048) NOT NULL,
    CONSTRAINT pk_product PRIMARY KEY (id)
);

CREATE TABLE product_alternatives
(
    scanned_product_id UUID NOT NULL,
    alternatives_id    UUID NOT NULL
);

CREATE TABLE scan_history
(
    id         UUID                        NOT NULL,
    user_id    UUID                        NOT NULL,
    product_id UUID                        NOT NULL,
    scanned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_scanhistory PRIMARY KEY (id)
);

CREATE TABLE users
(
    id UUID NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE product_alternatives
    ADD CONSTRAINT uc_product_alternatives_alternatives UNIQUE (alternatives_id);

ALTER TABLE product
    ADD CONSTRAINT uc_product_barcode UNIQUE (barcode);

ALTER TABLE scan_history
    ADD CONSTRAINT FK_SCANHISTORY_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES product (id);

ALTER TABLE scan_history
    ADD CONSTRAINT FK_SCANHISTORY_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE product_alternatives
    ADD CONSTRAINT fk_proalt_on_product FOREIGN KEY (alternatives_id) REFERENCES product (id);

ALTER TABLE product_alternatives
    ADD CONSTRAINT fk_proalt_on_scanned_product FOREIGN KEY (scanned_product_id) REFERENCES product (id);
