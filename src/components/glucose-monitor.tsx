import { useState, useEffect } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Battery, Droplet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

type TrendDirection = "up" | "down" | "stable";
type GlucoseLevel = "normal" | "high" | "low";

interface GlucoseData {
    value: number;
    trend: number;
    timestamp: string;
    level: GlucoseLevel;
    isHigh: boolean;
    isLow: boolean;
}

export default function GlucoseMonitor() {
    const [currentData, setCurrentData] = useState<GlucoseData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchGlucose() {
        try {
            setLoading(true);
            setError(null);

            // Call our Next.js API route
            const response = await axios.get("/api/glucose");

            // The response is now already simplified
            const glucoseData = response.data;

            // Update the state with the simplified data
            setCurrentData({
                value: glucoseData.value,
                trend: glucoseData.trend,
                timestamp: glucoseData.timestamp,
                level: determineLevel(glucoseData.value),
                isHigh: glucoseData.isHigh,
                isLow: glucoseData.isLow,
            });
        } catch (error) {
            console.error("Error fetching glucose data:", error);
            setError("Failed to fetch glucose data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    // Helper function to determine trend direction based on API response
    const TrendArrow = () => {
        switch (currentData?.trend) {
            case 5:
                return <ArrowUp className="h-8 w-8 text-red-500" />;
            case 4:
                return (
                    <div className="h-8 w-8 text-red-400 transform rotate-45">
                        <ArrowUp className="h-8 w-8" />
                    </div>
                );
            case 1:
                return (
                    <div className="h-8 w-8 text-blue-400 transform rotate-45">
                        <ArrowDown className="h-8 w-8" />
                    </div>
                );
            case 2:
                return <ArrowDown className="h-8 w-8 text-blue-500" />;
            default:
                return <ArrowRight className="h-8 w-8 text-green-400" />;
        }
    };

    // Helper function to determine glucose level
    function determineLevel(value: number): GlucoseLevel {
        if (value > 140) return "high";
        if (value < 70) return "low";
        return "normal";
    }

    useEffect(() => {
        fetchGlucose();

        // Set up polling to fetch data every 5 minutes
        const interval = setInterval(() => {
            fetchGlucose();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // Get color based on glucose level
    const getValueColor = () => {
        switch (currentData?.level) {
            case "high":
                return "text-red-400";
            case "low":
                return "text-blue-400";
            default:
                return "text-green-400";
        }
    };

    if (!currentData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
                <div className="text-center text-gray-400 mt-2">
                    Loading data...
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
            <Card className="w-full max-w-md bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <Droplet className="h-5 w-5 text-blue-400 mr-2" />
                            <span className="text-gray-400 text-sm">
                                Glucose Monitor
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="flex items-center justify-center gap-4">
                            <span
                                className={`text-6xl font-bold ${getValueColor()}`}
                            >
                                {currentData.value}
                            </span>
                            <div className="flex flex-col items-center">
                                <TrendArrow />
                                <span className="text-gray-400 text-xs mt-1">
                                    {currentData.trend === 5 ||
                                    currentData.trend === 4
                                        ? "Rising"
                                        : currentData.trend === 1 ||
                                          currentData.trend === 2
                                        ? "Falling"
                                        : "Stable"}
                                </span>
                            </div>
                        </div>
                        <span className="text-gray-400 mt-2">mg/dL</span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-800">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Last updated</span>
                            <span className="text-gray-300">
                                {new Date(
                                    currentData.timestamp
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-400">Status</span>
                            <span className={`font-medium ${getValueColor()}`}>
                                {currentData.level === "normal"
                                    ? "Normal"
                                    : currentData.level === "high"
                                    ? "High"
                                    : "Low"}
                            </span>
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center text-gray-400 mt-2">
                            Loading data...
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-400 mt-2">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
