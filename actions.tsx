'use server';

import { WeatherData } from "./types/weather";
import { prisma } from "@/lib/prisma";
import { Favorite } from "./types/favorite";

const READ_ONLY_MSG =
    "Gagal menyimpan. Di Vercel database SQLite bersifat read-only, jalankan fitur ini di lokal.";

export async function WeatherSearch(city: string): Promise<{
    data?: WeatherData;
    error?: string;
}> {
    try {
        if (!city.trim()) {
            return { error: "City name is required" };
        }

        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPEN_WEATHER_API_KEY}`
        );

        const data = await res.json();

        console.log("API Status:", res.status);
        console.log("API Response:", data);

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch weather data");
        }

        console.log("Weather data:", data);

        return { data };

    } catch (error) {
        console.error("Error fetching weather data:", error);

        return {
            error: (error as Error).message || "An error occurred"
        };
    }
}

// READ
export async function getFavorites(): Promise<Favorite[]> {
    return prisma.favorite.findMany({
        orderBy: { id: "desc" },
        select: { id: true, city: true, note: true },
    });
}

// CREATE
export async function addFavorite(city: string, note: string): Promise<{ error?: string }> {
    try {
        const exists = await prisma.favorite.findUnique({ where: { city } });
        if (exists) return { error: `${city} sudah ada di favorit` };

        await prisma.favorite.create({ data: { city, note: note.trim() } });
        return {};
    } catch {
        return { error: READ_ONLY_MSG };
    }
}

// UPDATE
export async function updateFavorite(id: number, note: string): Promise<{ error?: string }> {
    try {
        await prisma.favorite.update({ where: { id }, data: { note: note.trim() } });
        return {};
    } catch {
        return { error: READ_ONLY_MSG };
    }
}

// DELETE
export async function deleteFavorite(id: number): Promise<{ error?: string }> {
    try {
        await prisma.favorite.delete({ where: { id } });
        return {};
    } catch {
        return { error: READ_ONLY_MSG };
    }
}