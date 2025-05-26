using AI.Thinking.Engine.RequestViewModel;

namespace AI.Thinking.Engine
{
    public interface IAIEngineAnalysis
    {
        Task<string?> GetAnswerFromAI(ChatGptRequestViewModel requestBody);

        public string GetHighModel();

        public string GetMediumModel();

        public string GetLowModel();
    }
}