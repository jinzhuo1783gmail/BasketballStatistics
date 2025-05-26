CREATE TABLE [dbo].[AIEngines]
(
	[Id] BIGINT NOT NULL PRIMARY KEY IDENTITY (1, 1), 
    [EnginKey] VARCHAR(100) NOT NULL, 
    [ModelHigh] VARCHAR(100) NOT NULL, 
    [ModelMedium] VARCHAR(100) NOT NULL, 
    [ModelLow] VARCHAR(100) NOT NULL, 
    [Endpoint] VARCHAR(max) NOT NULL, 
    [ApiKey] VARCHAR(max) NOT NULL, 
)
go

CREATE NONCLUSTERED INDEX IX_AIEngines_EnginKey
ON [dbo].[AIEngines] ([EnginKey]);

