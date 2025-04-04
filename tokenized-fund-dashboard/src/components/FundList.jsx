import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function FundList({ funds }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {funds.map((fund) => (
        <div
          key={fund.id}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
        >
          <div>
            <h3 className="font-bold">{fund.name}</h3>
            <p className="text-sm text-gray-500">{fund.description}</p>
            <div className="mt-2">
              <span className="font-semibold">${fund.currentPrice}</span>
              <span
                className={`ml-2 text-sm ${
                  fund.priceChange >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {fund.priceChange >= 0 ? "+" : ""}
                {fund.priceChange}%
              </span>
            </div>
          </div>
          <ResponsiveContainer width={100} height={40}>
            <LineChart data={fund.yieldHistory.slice(-5)}>
              <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
} 