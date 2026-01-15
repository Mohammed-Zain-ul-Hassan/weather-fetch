import { google } from '@ai-sdk/google';
import { streamText, tool, stepCountIs, convertToModelMessages, smoothStream } from 'ai';
import { z } from 'zod';
import { WeatherResult } from '@/lib/types';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-2.5-flash-lite'),
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        experimental_transform: smoothStream(),
        system: `You are a helpful weather assistant. Use the weather tool to provide accurate weather information to the user. Always be polite and friendly.`,
        tools: {
            getWeather: tool({
                description: 'Get the current weather for a location',
                inputSchema: z.object({
                    location: z.string().describe('The city and state, e.g. San Francisco, CA'),
                    unit: z.enum(['metric', 'imperial']).optional().default('metric').describe('The unit to use for temperature'),
                }),
                execute: async ({ location, unit }): Promise<WeatherResult> => {
                    try {
                        const apiKey = process.env.OPENWEATHER_API_KEY;
                        if (!apiKey) {
                            return { error: 'OpenWeather API key is not configured.' };
                        }

                        const response = await fetch(
                            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                                location
                            )}&units=${unit}&appid=${apiKey}`
                        );

                        if (!response.ok) {
                            const data = await response.json();
                            return { error: data.message || 'Failed to fetch weather data.' };
                        }

                        const data = await response.json();
                        return {
                            location: data.name,
                            temperature: data.main.temp,
                            description: data.weather[0].description,
                            humidity: data.main.humidity,
                            windSpeed: data.wind.speed,
                            unit: unit === 'metric' ? '°C' : '°F',
                        };
                    } catch (error) {
                        console.error('Weather tool error:', error);
                        return { error: 'An unexpected error occurred while fetching the weather.' };
                    }
                },
            }),
        },
    });

    return result.toUIMessageStreamResponse();
}
