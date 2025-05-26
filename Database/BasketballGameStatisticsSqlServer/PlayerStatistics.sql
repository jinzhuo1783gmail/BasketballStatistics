CREATE TABLE PlayerStatistics (
    Id BigINT IDENTITY(1,1) PRIMARY KEY,
    GameId INT NOT NULL,
    Team INT NOT NULL,
    PlayerNumber INT NOT NULL,
    Point INT NULL,
    Foul INT NULL,
    Rebound INT NULL,
    Steal INT NULL,
    Block INT NULL,
    Assist INT NULL,
    MissShoot INT NULL,
    IsActive bit not NULL,
    InputText nvarchar(max) Not NULL,
    CreateTime DATETIME Not NULL,
    FOREIGN KEY (GameId) REFERENCES Games(Id)
);

go

CREATE INDEX IX_PlayerStatistics_GameTeamPlayer 
ON PlayerStatistics(GameId, Team, PlayerNumber);

go
CREATE INDEX IX_PlayerStatistics_GameTeam 
ON PlayerStatistics(GameId, Team);