CREATE TABLE product
(
    id                VARCHAR(255)                NOT NULL,
    dtype             VARCHAR(31)                 NOT NULL,
    name              VARCHAR(255)                NOT NULL,
    image_url         VARCHAR(255)                NOT NULL,
    description       VARCHAR(2048)               NOT NULL,
    score             INTEGER                     NOT NULL,
    environment_score INTEGER                     NOT NULL,
    social_score      INTEGER                     NOT NULL,
    health_score      INTEGER                     NOT NULL,
    justification     VARCHAR(2048)               NOT NULL,
    scanned_date      TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_product PRIMARY KEY (id)
);

CREATE TABLE scan_history
(
    id         UUID                        NOT NULL,
    user_id    UUID                        NOT NULL,
    product_id VARCHAR(255)                NOT NULL,
    saved_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_scanhistory PRIMARY KEY (id)
);

ALTER TABLE scan_history
    ADD CONSTRAINT FK_SCANHISTORY_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES product (id);
