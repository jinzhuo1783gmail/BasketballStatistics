﻿CREATE TABLE Club (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClubName NVARCHAR(255) NOT NULL,
    ClubAddress NVARCHAR(MAX) NULL,
    Phone NVARCHAR(50) NULL,
    Email NVARCHAR(255) NULL
);