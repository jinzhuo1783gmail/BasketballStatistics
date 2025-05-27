using AI.FamilyEdication.ThinkingEngine.EngineModel;
using AI.Thinking.Engine;
using AI.Thinking.Engine.EngineModel;
using BasketballGameStatistics.Middleware;
using BasketballGameStatistics.SqlServer.EFCore;
using BasketballGameStatisticsServices.Managers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;
    });

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var environment = builder.Environment;

var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .Build();

builder.Services.AddDbContext<BasketballGameStatisticsContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")?.Decrypt()));
builder.Services.AddControllers().AddNewtonsoftJson(options =>
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

builder.Services.AddIdentityAuthentication(configuration["JwtToken:Issuer"], configuration["JwtToken:Audience"], configuration["JwtToken:SecretKey"]);

var aiPrompt = configuration.GetSection("EngineConfig")
            .Get<EngineConfig>();

var aiAzureVoice = configuration.GetSection("AzureVoiceService")
            .Get<EngineVoiceModel>();
            
if (aiPrompt == null)
{
    throw new InvalidOperationException("prompt not found in EngineConfig section");
}

if (aiAzureVoice == null)
{
    throw new InvalidOperationException("voice config not found in EngineConfig section");
}



// Register as singleton
builder.Services.AddSingleton(aiPrompt);
builder.Services.AddSingleton(aiAzureVoice);
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddSingleton<IAIEngineAnalysis, AIEngineAnalysis>();
builder.Services.AddSingleton<IAIEngineRegister, AIEngineRegister>();
builder.Services.AddSingleton<IAIEngineVoice, AIEngineVoice>();

builder.Services.AddScoped<IClubRepository, ClubRepository>();
builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<IPlayerStatisticRepository, PlayerStatisticRepository>();

builder.Services.AddScoped<IClubManager, ClubManager>();
builder.Services.AddScoped<IGameManager, GameManager>();
builder.Services.AddScoped<IPlayerStatisticsManager, PlayerStatisticsManager>();



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});


var app = builder.Build();


app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<BasketballGameStatisticsContext>();
    var modelFromDb = dbContext.AIEngines.FirstOrDefault(e => e.EnginKey == aiPrompt.Model);  // Adjust table name

    if (modelFromDb != null)
    {
        var engineRegisterModel = new EngineRegisterModel
        {
            EnginKey = modelFromDb.EnginKey,
            ModelHigh = modelFromDb.ModelHigh,
            ModelMedium = modelFromDb.ModelMedium,
            ModelLow = modelFromDb.ModelLow,
            Endpoint = modelFromDb.Endpoint,
            ApiKey = modelFromDb.ApiKey,
 
        };

        app.Services.GetRequiredService<IHostApplicationLifetime>().ApplicationStarted.Register(() =>
        {
            // Store config in a Singleton service
            var aiEngineRegister = app.Services.GetRequiredService<IAIEngineRegister>();
            aiEngineRegister.LoadModel(engineRegisterModel);
        });
    }
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors("AllowAll");

app.MapControllers();

app.Run();


public static class ServiceCollectionExtension
{
    public static IServiceCollection AddIdentityAuthentication(this IServiceCollection services, string? issuer, string? audience, string? secretKey)
    {
        if (string.IsNullOrEmpty(secretKey))
            throw new Exception("SecretKey is not configured");
        if (string.IsNullOrEmpty(issuer))
            throw new Exception("issuer is not configured");
        if (string.IsNullOrEmpty(audience))
            throw new Exception("audience is not configured");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                };
            });

        return services;
    }
}