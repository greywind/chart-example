import { Meta, Story } from '@storybook/react/types-6-0';
import React from "react";
import { Point } from 'Src/types';
import Chart from '.';

export default {
    title: 'Components/Chart',
    component: Chart,
} as Meta;

export const ChartWithThreeValues: Story = () => <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 8 }, { x: 3, y: 15 }]} />;

const thousandPointsData: Point[] = [];
let lastValue = 0;
for (let x = 0; x < 1000; x++) {
    lastValue = lastValue + Math.floor(Math.random() * 21) - 10;
    thousandPointsData.push({ x, y: lastValue });
}
export const ChartWithThousandValues: Story = () => <Chart data={thousandPointsData} />;

const millionPointsData: Point[] = [];
lastValue = 0;
for (let x = 0; x < 1000000; x++) {
    lastValue = lastValue + Math.floor(Math.random() * 21) - 10;
    millionPointsData.push({ x, y: lastValue });
}
export const ChartWithMillionValues: Story = () => <Chart data={millionPointsData} />;
