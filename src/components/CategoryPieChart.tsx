import { Card } from "antd";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type CategoryStat = {
    category: string;
    amount: number;
    percentage: number;
    color: string;
};

export default function CategoryPieChart({
    title,
    data,
}: {
    title: string;
    data: CategoryStat[];
}) {
    return (
        <Card title={title}>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                            `${name} ${((percent as number) * 100).toFixed(1)}%`
                        }

                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString("vi-VN")} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
}
