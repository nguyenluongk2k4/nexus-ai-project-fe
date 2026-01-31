/**
 * QuizProgressChart Component
 * Simple SVG line chart showing quiz score progression
 */

import React from 'react';
import type { QuizHistoryItem } from '../../../quiz/domain/entities/Quiz';

interface QuizProgressChartProps {
    attempts: QuizHistoryItem[];
    height?: number;
}

export function QuizProgressChart({ attempts, height = 120 }: QuizProgressChartProps) {
    if (attempts.length === 0) {
        return (
            <div className="flex items-center justify-center h-20 text-slate-400 text-sm">
                Chưa có dữ liệu để hiển thị
            </div>
        );
    }

    // Sort by date ascending for chart
    const sortedAttempts = [...attempts]
        .filter(a => a.score !== undefined)
        .sort((a, b) => {
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return dateA - dateB;
        })
        .slice(-10); // Last 10 attempts

    if (sortedAttempts.length === 0) {
        return null;
    }

    const width = 280;
    const padding = { top: 20, right: 15, bottom: 30, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate points
    const maxScore = 100;
    const minScore = 0;
    const points = sortedAttempts.map((a, i) => ({
        x: padding.left + (i / Math.max(sortedAttempts.length - 1, 1)) * chartWidth,
        y: padding.top + (1 - ((a.score || 0) - minScore) / (maxScore - minScore)) * chartHeight,
        score: a.score || 0,
        date: a.completedAt ? new Date(a.completedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : ''
    }));

    // Create path
    const pathD = points.length === 1
        ? `M ${points[0].x} ${points[0].y}`
        : points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Pass line at 70%
    const passLineY = padding.top + (1 - 0.7) * chartHeight;

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
                {/* Background grid */}
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-axis labels */}
                {[0, 50, 100].map(val => (
                    <text
                        key={val}
                        x={padding.left - 8}
                        y={padding.top + (1 - val / 100) * chartHeight + 4}
                        fontSize="10"
                        fill="#94a3b8"
                        textAnchor="end"
                    >
                        {val}%
                    </text>
                ))}

                {/* Pass threshold line */}
                <line
                    x1={padding.left}
                    y1={passLineY}
                    x2={padding.left + chartWidth}
                    y2={passLineY}
                    stroke="#22c55e"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.5"
                />
                <text x={padding.left + chartWidth + 2} y={passLineY + 3} fontSize="9" fill="#22c55e">
                    Pass
                </text>

                {/* Area under curve */}
                {points.length > 1 && (
                    <path
                        d={`${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`}
                        fill="url(#scoreGradient)"
                    />
                )}

                {/* Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill={p.score >= 70 ? '#22c55e' : '#ef4444'}
                            stroke="white"
                            strokeWidth="2"
                        />
                        {/* Show score on hover - static for now */}
                        {i === points.length - 1 && (
                            <text
                                x={p.x}
                                y={p.y - 10}
                                fontSize="10"
                                fill="#8b5cf6"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {p.score.toFixed(0)}%
                            </text>
                        )}
                    </g>
                ))}

                {/* X-axis labels (first and last) */}
                {points.length > 0 && (
                    <>
                        <text
                            x={points[0].x}
                            y={height - 5}
                            fontSize="9"
                            fill="#94a3b8"
                            textAnchor="middle"
                        >
                            {points[0].date}
                        </text>
                        {points.length > 1 && (
                            <text
                                x={points[points.length - 1].x}
                                y={height - 5}
                                fontSize="9"
                                fill="#94a3b8"
                                textAnchor="middle"
                            >
                                {points[points.length - 1].date}
                            </text>
                        )}
                    </>
                )}
            </svg>
        </div>
    );
}
