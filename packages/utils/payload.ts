import { Stroke } from "@tegaki/types";
import { hexToNumber, numberToHex } from "./general";

export const STROKE_SEPARATOR = "\n";
export const STROKE_POSITION_SEPARATOR = ",";

export class DecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecodeError";
  }
}

export type EncodeStroke = (strokes: Array<Stroke>) => string;
export const encodeStroke: EncodeStroke = strokes =>
  strokes.flatMap(it => it.map(it => it.map(numberToHex)).join(STROKE_POSITION_SEPARATOR)).join(STROKE_SEPARATOR);

export type DecodeStroke = (encoded: string) => Array<Stroke> | DecodeError;
export const decodeStroke: DecodeStroke = encoded => {
  try {
    return encoded.split(STROKE_SEPARATOR).map(it =>
      it.split(STROKE_POSITION_SEPARATOR).reduce((acc, it, idx) => {
        const strokeIndex = Math.floor(idx / 2);
        const positionIndex = idx % 2;
        const position = hexToNumber(it);
        if (positionIndex === 0) acc[strokeIndex] = [null!, null!];
        acc[strokeIndex][positionIndex] = position;
        return acc;
      }, [] as Stroke),
    );
  } catch (e) {
    return new DecodeError(`Failed to decode stroke: ${e}`);
  }
};
