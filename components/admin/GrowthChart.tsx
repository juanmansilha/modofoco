"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "Jan", users: 400, pro: 240 },
    { name: "Feb", users: 300, pro: 139 },
    { name: "Mar", users: 200, pro: 980 },
    { name: "Apr", users: 278, pro: 390 },
    { name: "May", users: 189, pro: 480 },
    { name: "Jun", users: 239, pro: 380 },
    { name: "Jul", users: 349, pro: 430 },
];

export function GrowthChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    tick={{ fill: "#71717a" }}
                    axisLine={{ stroke: "#27272a" }}
                />
                <YAxis
                    stroke="#71717a"
                    tick={{ fill: "#71717a" }}
                    axisLine={{ stroke: "#27272a" }}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5" }}
                    itemStyle={{ color: "#f4f4f5" }}
                />
                <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Usuários"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
