using System.Text.Json.Serialization;

namespace MiniEventPlanManagement.Mvc.Models;


//public class MessageModel
//{
//    public MessageModel()
//    {
//    }

//    public MessageModel(bool isIsuccess, string message)
//    {
//        IsSuccess = isIsuccess;
//        Message = message;
//    }
//    public bool IsSuccess { get; set; }
//    public string Message { get; set; }
//}

public class MessageModel
{
    public MessageModel()
    {
    }

    public MessageModel(bool isIsuccess, string message, object? data = default)
    {
        IsSuccess = isIsuccess;
        Message = message;
        Data = data;
    }
    public bool IsSuccess { get; set; }
    public string Message { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object Data { get; set; }
}
