# Dockerfile for Render deployment - Backend only
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY Backend/VehicleBackend/*.csproj ./Backend/VehicleBackend/
WORKDIR /src/Backend/VehicleBackend
RUN dotnet restore

# Copy source code and build
WORKDIR /src
COPY Backend/VehicleBackend/ ./Backend/VehicleBackend/
WORKDIR /src/Backend/VehicleBackend
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variable for port
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "VehicleBackend.dll"]
