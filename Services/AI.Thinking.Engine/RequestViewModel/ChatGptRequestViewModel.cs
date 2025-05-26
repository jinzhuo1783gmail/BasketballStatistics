using AI.Thinking.Engine.Convertor;
using Newtonsoft.Json;


namespace AI.Thinking.Engine.RequestViewModel
{
    public class ChatGptRequestViewModel
    {
        public string Model { get; set; }
        public List<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }

    public class ChatMessage
    {
        public string Role { get; set; } = string.Empty;

        [JsonConverter(typeof(ChatContentConverter))]
        public object Content { get; set; } // Can be a string or a List<ChatContent>
    }

    public class ChatContent
    {
        [JsonProperty("type")]
        public string Type { get; set; }
    }

    public class ChatText : ChatContent
    {
        [JsonProperty("text")]
        public string Text { get; set; }
    }

    public class ChatImage : ChatContent
    {
        [JsonProperty("image_url")]
        public ImageUrl ImageUrl { get; set; }
    }

    public class ImageUrl
    {
        [JsonProperty("url")]
        public string Url { get; set; }
    }
}