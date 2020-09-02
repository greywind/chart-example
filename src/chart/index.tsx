import React, { FC, MouseEventHandler, useCallback, useMemo, useRef, useState, WheelEventHandler } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Point } from "Src/types";

export interface Props {
    data: Point[];
};

interface ZoomInfo {
    scale: number;
    middlePoint: number;
}

interface DragInfo {
    isDragging: boolean;
    lastPositionX: number;
}

function calculateZoomInfo(scale: number, middlePoint: number, width: number, min: number, max: number): ZoomInfo {
    const maxMiddlePoint = Math.floor(max - (max - min) / 2 / scale);
    const minMiddlePoint = Math.ceil(min + (max - min) / 2 / scale);
    if (middlePoint > maxMiddlePoint)
        middlePoint = maxMiddlePoint
    else if (middlePoint < minMiddlePoint)
        middlePoint = minMiddlePoint;
    return {
        scale,
        middlePoint
    }
}

const Chart: FC<Props> = props => {

    const canvasWidth = 600;
    const yAxisOffset = 65;

    const [zoomInfo, setZoomInfo] = useState<ZoomInfo>({
        scale: 1,
        middlePoint: props.data.length / 2
    });
    const [dragInfo, setDragInfo] = useState<DragInfo>({
        isDragging: false,
        lastPositionX: 0,
    });

    const maxZoom = useMemo(() => Math.max(Math.floor(props.data.length / 10), 1), [props.data.length]);
    const minValue = useMemo(() => props.data.reduce((result, p) => result > p.y ? p.y : result, 0), [props.data]);
    const maxValue = useMemo(() => props.data.reduce((result, p) => result < p.y ? p.y : result, 0), [props.data]);

    const startPoint = Math.floor(zoomInfo.middlePoint - (props.data.length / 2 / zoomInfo.scale));
    const endPoint = Math.ceil(zoomInfo.middlePoint + (props.data.length / 2 / zoomInfo.scale));

    const data = useMemo(() => {
        console.time("calculate data");
        if (props.data.length < canvasWidth)
            return props.data;

        const result: Point[] = [];

        if (props.data.length < canvasWidth)
            return props.data;

        result.push(props.data[0])
        const step = (props.data.length / zoomInfo.scale - 2) / (canvasWidth - 2) * 5;
        let currentStep = {
            index: 1,
            sumX: 0,
            sumY: 0,
            count: 0
        };
        for (let i = 1; i < props.data.length - 1; i++) {
            const stepIndex = Math.floor((i - 1) / step) + 1;
            if (stepIndex === currentStep.index) {
                currentStep.sumX += props.data[i].x;
                currentStep.sumY += props.data[i].y;
                currentStep.count++;
                continue;
            }
            result.push({ x: Math.round(currentStep.sumX / currentStep.count), y: Math.round(currentStep.sumY / currentStep.count) });
            currentStep = {
                index: stepIndex,
                sumX: props.data[i].x,
                sumY: props.data[i].y,
                count: 1
            };
        }
        result.push({ x: Math.round(currentStep.sumX / currentStep.count), y: Math.round(currentStep.sumY / currentStep.count) });
        result.push(props.data[props.data.length - 1]);
        console.timeEnd("calculate data");
        return result;
    }, [props.data, zoomInfo.scale]);

    const onWheel = useCallback<WheelEventHandler>(e => {
        e.stopPropagation();
        if (dragInfo.isDragging)
            return;
        const wrapperRect = wrapperRef.current?.getBoundingClientRect();
        if (!wrapperRect)
            return;
        const mouseOffset = e.clientX - wrapperRect.left - yAxisOffset;
        const newMiddlePoint = Math.round(mouseOffset / canvasWidth * (endPoint - startPoint) + startPoint);
        if (e.deltaY > 0) {
            setZoomInfo(zoomInfo => {
                if (zoomInfo.scale === 1)
                    return zoomInfo;
                return calculateZoomInfo(zoomInfo.scale / 2, newMiddlePoint, canvasWidth, 0, props.data.length);
            });
            return;
        }
        if (e.deltaY < 0)
            setZoomInfo(zoomInfo => {
                if (zoomInfo.scale > maxZoom)
                    return zoomInfo;
                return calculateZoomInfo(zoomInfo.scale * 2, newMiddlePoint, canvasWidth, 0, props.data.length);
            });
    }, [dragInfo.isDragging, endPoint, maxZoom, props.data.length, startPoint]);

    const onMouseDown = useCallback<MouseEventHandler>(e => {
        e.stopPropagation();
        e.preventDefault();
        const wrapperRect = wrapperRef.current?.getBoundingClientRect();
        if (!wrapperRect)
            return;
        if (e.clientX < wrapperRect.left + yAxisOffset)
            return;
        setDragInfo({ isDragging: true, lastPositionX: e.clientX });
    }, []);
    const onMouseUp = useCallback<MouseEventHandler>(e => {
        e.stopPropagation();
        e.preventDefault();
        setDragInfo(dragInfo => {
            if (!dragInfo.isDragging)
                return dragInfo;
            return {
                isDragging: false,
                lastPositionX: 0,
            }
        })
    }, []);
    const onMouseMove = useCallback<MouseEventHandler>(e => {
        e.stopPropagation();
        e.preventDefault();
        if (!dragInfo.isDragging)
            return;
        const deltaX = e.clientX - dragInfo.lastPositionX;
        if (deltaX === 0)
            return;
        setZoomInfo(zoomInfo => {
            const offset = deltaX / canvasWidth * props.data.length / zoomInfo.scale;
            return calculateZoomInfo(zoomInfo.scale, zoomInfo.middlePoint - offset, canvasWidth, 0, props.data.length);
        });
        setDragInfo({ isDragging: true, lastPositionX: e.clientX });
    }, [dragInfo.isDragging, dragInfo.lastPositionX, props.data.length]);

    const wrapperRef = useRef<HTMLDivElement>(null);

    return <div
        ref={wrapperRef}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
    >
        <LineChart
            width={canvasWidth + yAxisOffset}
            height={400}
            data={data.filter(d => d.x >= startPoint && d.x <= endPoint)}
        >
            <Tooltip />
            <XAxis dataKey="x" domain={[startPoint, endPoint]} />
            <YAxis dataKey="y" domain={[minValue, maxValue]} />
            <Line dataKey="y" type="monotone" isAnimationActive={false} dot={false} />
        </LineChart>
    </div>
};

export default Chart;