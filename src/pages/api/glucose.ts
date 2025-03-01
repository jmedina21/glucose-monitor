import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Define a simplified response type that only contains what the frontend needs
interface SimplifiedGlucoseResponse {
    value: number;
    trend: number;
    timestamp: string;
    measurementColor: number;
    isHigh: boolean;
    isLow: boolean;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const response = await axios.get(
            "https://api.libreview.io/llu/connections/16add94a-834d-11ee-aaa7-4ef93ef95025/graph",
            {
                headers: {
                    Authorization: `Bearer ${process.env.LIBREVIEW_API_KEY}`,
                    "Content-Type": "application/json",
                    "accept-encoding": "gzip",
                    "cache-control": "no-cache",
                    connection: "keep-alive",
                    product: "llu.android",
                    version: "4.7.0",
                },
            }
        );

        // Extract only the necessary data from the response
        const apiResponse = response.data;

        if (apiResponse?.data?.connection?.glucoseItem) {
            const glucoseItem = apiResponse.data.connection.glucoseItem;

            // Create a simplified response object with only the data needed by the frontend
            const simplifiedResponse: SimplifiedGlucoseResponse = {
                value: glucoseItem.Value,
                trend: glucoseItem.TrendArrow,
                timestamp: glucoseItem.Timestamp,
                measurementColor: glucoseItem.MeasurementColor,
                isHigh: glucoseItem.isHigh,
                isLow: glucoseItem.isLow,
            };

            const glucoseGraphData = apiResponse.data.graphData;

            return res.status(200).json({
                glucose: simplifiedResponse,
                glucoseGraphData: glucoseGraphData,
            });
        } else {
            return res.status(404).json({ message: "Glucose data not found" });
        }
    } catch (error) {
        console.error("Error fetching glucose data:", error);
        return res.status(500).json({
            message: "Error fetching glucose data",
            error: error,
        });
    }
}
