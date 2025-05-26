CREATE TABLE Games (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClubId INT NOT NULL,
    GameDescription NVARCHAR(max) Not NULL,
    Venue NVARCHAR(200) NOT NULL,
    MatchDate DATETIME NULL,
    CreateDate DATETIME NULL,
    CreateBy NVARCHAR(100) NULL,
    IsActive bit Not Null,
    Instruction NVARCHAR(max) Not NULL,
    FOREIGN KEY (ClubId) REFERENCES Club(Id)
);
