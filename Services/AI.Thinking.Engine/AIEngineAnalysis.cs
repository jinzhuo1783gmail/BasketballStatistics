using AI.FamilyEdication.ThinkingEngine;
using AI.FamilyEdication.ThinkingEngine.EngineModel;
using AI.Thinking.Engine.Convertor;
using AI.Thinking.Engine.RequestViewModel;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Polly;
using System.Net.Http.Headers;
using System.Text;

namespace AI.Thinking.Engine
{
    public class AIEngineAnalysis : IAIEngineAnalysis
    {
        private readonly EngineConfig _engineConfig;
        private readonly ILogger<AIEngineAnalysis> _logger;
        private readonly HttpClient _httpClient;
        private readonly IAsyncPolicy<HttpResponseMessage> _retryPolicy;

        private readonly EngineRegisterModel _engine;

        public AIEngineAnalysis(EngineConfig engineConfig, IAIEngineRegister aiEngineRegister, ILogger<AIEngineAnalysis> logger)
        {
            _engineConfig = engineConfig;

            _engine = aiEngineRegister.Model;

            _logger = logger;

            if (_engine == null)
            {
                _logger.LogError($"{_engineConfig.Model} is not configured in the db");
                throw new Exception($"{_engineConfig.Model} is not configured in the db");
            }

            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _engine.ApiKey.Decrypt());
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _retryPolicy = Policy
                .Handle<HttpRequestException>()
                .OrResult<HttpResponseMessage>(response => !response.IsSuccessStatusCode)
                .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
        }

        public async Task<string?> GetAnswerFromAI(ChatGptRequestViewModel requestBody)
        {
            try
            {
                var settings = new JsonSerializerSettings
                {
                    ContractResolver = new DefaultContractResolver
                    {
                        NamingStrategy = new LowerCaseNamingStrategy() // Use custom lowercase naming strategy
                    },
                    Converters = new List<JsonConverter> { new ChatContentConverter() }, // Add the converter
                    Formatting = Formatting.Indented // Optional: for pretty-printed JSON
                };

                string jsonContent = JsonConvert.SerializeObject(requestBody, settings);

                StringContent content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _retryPolicy.ExecuteAsync(() => _httpClient.PostAsync(_engine.Endpoint, content));

                response.EnsureSuccessStatusCode();

                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("AI request failed! " + ex.Message);
                return null;
            }
        }

        public string GetHighModel() => _engine.ModelHigh;

        public string GetMediumModel() => _engine.ModelMedium;

        public string GetLowModel() => _engine.ModelLow;
    }
}