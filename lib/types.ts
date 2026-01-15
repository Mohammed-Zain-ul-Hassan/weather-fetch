export interface WeatherResult {
    location?: string;
    temperature?: number;
    description?: string;
    humidity?: number;
    windSpeed?: number;
    unit?: string;
    error?: string;
}
