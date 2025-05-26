namespace BasketballGameStatisticsServices
{
    public static class ValueExtenstion
    {
        public static bool IsValidInput(this int? input)
        {
            if (input == null || input == 0) { return false; }
            return true;
        }

        public static string ToPercentage(this decimal value, int decimalPlaces = 2)
        {
            var value100 = value * 100;
            return value100.ToString($"P{decimalPlaces}%");
        }
    }
}
