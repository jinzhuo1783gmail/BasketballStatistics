using AI.Thinking.Engine.RequestViewModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;


namespace AI.Thinking.Engine.Convertor
{
    public class ChatContentConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            // This converter is only for "content", which can be string or list
            return objectType == typeof(object);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
        {
            // Load JSON token
            var token = JToken.Load(reader);

            // Case 1: If it's a string, return it as is
            if (token.Type == JTokenType.String)
            {
                return token.ToString();
            }

            // Case 2: If it's an array, deserialize into a List<ChatContent>
            if (token.Type == JTokenType.Array)
            {
                var result = new List<ChatContent>();

                foreach (var item in token)
                {
                    var type = item["type"]?.ToString()?.ToLower();

                    ChatContent? content = type switch
                    {
                        "text" => item.ToObject<ChatText>(serializer),
                        "image_url" => item.ToObject<ChatImage>(serializer),
                        _ => throw new JsonSerializationException($"Unknown Type: {type}")
                    };

                    if (content != null)
                    {
                        result.Add(content);
                    }
                }

                return result;
            }

            throw new JsonSerializationException("Unexpected JSON structure for Content property.");
        }

        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
        {
            // Case 1: If it's a string, write it directly
            if (value is string stringValue)
            {
                writer.WriteValue(stringValue);
                return;
            }

            // Case 2: If it's a list of ChatContent, serialize it normally
            serializer.Serialize(writer, value);
        }
    }
}
