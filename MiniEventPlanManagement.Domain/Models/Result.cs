
public class Result<T>
{
    public bool IsSuccess { get; set; }
    public bool IsError { get { return !IsSuccess; } }
    public bool IsValidationError { get { return Type == EnumRespType.ValidationError; } }
    public bool IsSystemError { get { return Type == EnumRespType.SystemError; } }
    private EnumRespType Type { get; set; }
    public T Data { get; set; }
    public string Message { get; set; }


    public static Result<T> Success(T data, string message = "Successs.")
    {
        return new Result<T>
        {
            IsSuccess = true,
            Type = EnumRespType.Success,
            Data = data,
            Message = message
        };
    }

    public static Result<T> NotFound(string message = "Data not found.")
    {
        return new Result<T>
        {
            IsSuccess = false,
            Type = EnumRespType.NotFound,
            Message = message
        };
    }

    public static Result<T> ValidationError(string message = "Validation Error")
    {
        return new Result<T>
        {
            IsSuccess = false,
            Message = message,
            Type = EnumRespType.ValidationError
        };
    }

    public static Result<T> SystemError(string message)
    {
        return new Result<T>
        {
            IsSuccess = false,
            Message = message,
            Type = EnumRespType.SystemError
        };
    }
}

public enum EnumRespType
{
    None,
    Success,
    NotFound,
    ValidationError,
    SystemError
}