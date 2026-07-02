CREATE TABLE user_savings
(
    id                  UUID    NOT NULL,
    co2_saving          DECIMAL NOT NULL,
    car_ride_equivalent INTEGER NOT NULL,
    CONSTRAINT pk_usersavings PRIMARY KEY (id)
);
