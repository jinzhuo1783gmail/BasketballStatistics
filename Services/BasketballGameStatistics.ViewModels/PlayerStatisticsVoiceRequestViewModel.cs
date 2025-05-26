namespace BasketballGameStatistics.ViewModels
{
    public class PlayerStatisticsVoiceRequestViewModel
    {
        public required int GameId { get; set; }

        public required string VoiceBase64 { get; set; }

        public required string Language { get; set; }
    }
}
