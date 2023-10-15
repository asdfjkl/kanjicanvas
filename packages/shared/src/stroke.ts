export type TegakiStroke = [TargetChar, TargetCharStrokeLength, Array<Stroke>];

export type TargetChar = string;

export type TargetCharStrokeLength = number;

export type Stroke = Array<Position>;

export type Position = [X, Y];

export type X = number;

export type Y = number;
