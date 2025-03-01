"use client";

import { useState, useEffect } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Droplet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";
import axios from "axios";

type GlucoseLevel = "normal" | "high" | "low";

interface GlucoseData {
    value: number;
    trend: number;
    timestamp: string;
    level: GlucoseLevel;
    isHigh: boolean;
    isLow: boolean;
}

interface GlucoseGraphData {
    FactoryTimestamp: string;
    Timestamp: string;
    type: number;
    ValueInMgPerDl: number;
    MeasurementColor: number;
    GlucoseUnits: number;
    Value: number;
    isHigh: boolean;
    isLow: boolean;
}

export default function GlucoseMonitor() {
    const [currentData, setCurrentData] = useState<GlucoseData | null>(null);
    const [glucoseGraphData, setGlucoseGraphData] = useState<
        GlucoseGraphData[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGlucose() {
            try {
                setLoading(true);
                setError(null);

                // Call our Next.js API route
                const response = await axios.get("/api/glucose");

                // The response is now already simplified
                const glucoseData = response.data.glucose;
                const glucoseGraphData = response.data.glucoseGraphData;

                // Update the state with the simplified data
                setCurrentData({
                    value: glucoseData.value,
                    trend: glucoseData.trend,
                    timestamp: glucoseData.timestamp,
                    level: determineLevel(glucoseData.value),
                    isHigh: glucoseData.isHigh,
                    isLow: glucoseData.isLow,
                });

                setGlucoseGraphData(glucoseGraphData);
            } catch (error) {
                console.error("Error fetching glucose data:", error);
                setError(
                    "Failed to fetch glucose data. Please try again later."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchGlucose();

        // Set up polling to fetch data every 60 seconds
        const interval = setInterval(() => {
            fetchGlucose();
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

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

    // Format timestamp for tooltip
    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <p className="text-gray-200">
                        {formatTime(payload[0].payload.Timestamp)}
                    </p>
                    <p className="text-green-400 font-bold">
                        {payload[0].value} mg/dL
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
            <Card className="w-full max-w-2xl bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <Droplet className="h-5 w-5 text-blue-400 mr-2" />
                            <span className="text-gray-400 text-sm">
                                Glucose Monitor
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex flex-col items-center">
                                <span
                                    className={`text-6xl font-bold ${getValueColor()}`}
                                >
                                    {currentData.value}
                                </span>
                                <span className="text-gray-400 mt-1">
                                    mg/dL
                                </span>
                            </div>

                            <div className="h-16 w-px bg-gray-700 mx-2"></div>

                            <div className="flex flex-col items-center">
                                <span
                                    className={`text-6xl font-bold ${getValueColor()}`}
                                >
                                    {(currentData.value / 18).toFixed(1)}
                                </span>
                                <span className="text-gray-400 mt-1">
                                    mmol/L
                                </span>
                            </div>

                            <div className="h-16 w-px bg-gray-700 mx-2"></div>

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
                    </div>

                    <div className="mt-4 h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={glucoseGraphData}
                                margin={{
                                    top: 5,
                                    right: 10,
                                    left: 10,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.1)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="Timestamp"
                                    tickFormatter={formatTime}
                                    stroke="#6B7280"
                                    tick={{ fill: "#9CA3AF" }}
                                />
                                <YAxis
                                    domain={[60, 200]}
                                    stroke="#6B7280"
                                    tick={{ fill: "#9CA3AF" }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine
                                    y={180}
                                    stroke="#EF4444"
                                    strokeDasharray="3 3"
                                />
                                <ReferenceLine
                                    y={70}
                                    stroke="#3B82F6"
                                    strokeDasharray="3 3"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Value"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={{ fill: "#10B981", strokeWidth: 2 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
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
