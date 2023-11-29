import { useCallback, useMemo, useState } from "react";
import { GRID_SIZE } from "@/utility/constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

enum ShipType {
  SUBWAY = 2,
  DESTROYER = 3,
  CRUISER = 4,
  BATTLESHIP = 5,
}
enum Direction {
  HORIZONTAL = 1,
  VERTICAL = 2,
}

function GameRoom() {
  const directions = useMemo(() => ([
    {
      label: 'Horizontal',
      value: Direction.HORIZONTAL
    },
    {
      label: 'Vertical',
      value: Direction.VERTICAL
    }
  ]), []);
  const shipTypes = useMemo(() => ([
    {
      label: 'Subway',
      value: ShipType.SUBWAY
    },
    {
      label: 'Destroyer',
      value: ShipType.DESTROYER
    },
    {
      label: 'Cruiser',
      value: ShipType.CRUISER
    },
    {
      label: 'Battleship',
      value: ShipType.BATTLESHIP
    }
  ]), []);
  
  const [direction, setDirection] = useState(Direction.HORIZONTAL);
  const [shipSize, setShipSize] = useState(ShipType.SUBWAY);
  const nextCellCount = useMemo(() => direction === Direction.HORIZONTAL ? 1 : GRID_SIZE, [direction]);
  const xAxis = useMemo(() => Array.from({ length: GRID_SIZE }), []); // create 10 rows
  const yAxis = useMemo(() => Array.from({ length: GRID_SIZE }), []); // create 10 columns
  const cells = useMemo(() => Array.from({ length: GRID_SIZE * GRID_SIZE }), []); // create 100 cells
  
  const getASCII = useCallback((index: number) => 65 + index, []);
  const getYCoordinate = useMemo(() => (index: number) => String.fromCharCode(getASCII(index)), []);

  // calculate functions
  const getCoordinates = (cellIndex: number) => {
    const xCoordinate = cellIndex % GRID_SIZE;
    const yCoordinate = String.fromCharCode(getASCII(Math.floor(cellIndex / GRID_SIZE)));
    return [xCoordinate, yCoordinate];
  };

  // interactive functions
  const handleCellClick = useCallback((cellIndex: number) => {
    const [xCoordinate, yCoordinate] = getCoordinates(cellIndex);
    console.log(`x: ${xCoordinate}, y: ${yCoordinate}`);
  }, [shipSize]);

  const updateCellClass = useCallback((cellIndex: number, isAdd: boolean) => {
    for (let i = 1; i < shipSize; i++) {
      const cell = document.querySelector(`[data-key="cell-${cellIndex + nextCellCount * i}"]`);
      if (cell) {
        if (isAdd) {
          cell.classList.add('bg-sky-500');
        } else {
          cell.classList.remove('bg-sky-500');
        }
      }
    }
  }, [shipSize, nextCellCount]);
  const handleMouseEnter = useCallback((cellIndex: number) => {
    updateCellClass(cellIndex, true);
  }, [updateCellClass]);
  
  const handleMouseLeave = useCallback((cellIndex: number) => {
    updateCellClass(cellIndex, false);
  }, [updateCellClass]);

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="flex flex-col gap-4">
        <ToggleGroup variant="outline" size="lg" type="single" value={shipSize}>
          {shipTypes.map((type: { label: string, value: ShipType }) => <ToggleGroupItem className="grow" key={`${type.label}-${type.value}`} value={type.value} onClick={() => setShipSize(type.value)}>{type.label}</ToggleGroupItem>)}
        </ToggleGroup>
        <ToggleGroup variant="outline" size="lg" type="single" value={direction}>
          {directions.map((direction: { label: string, value: Direction }) => <ToggleGroupItem className="grow" key={`${direction.label}-${direction.value}`} value={direction.value} onClick={() => setDirection(direction.value)}>{direction.label}</ToggleGroupItem>)}
        </ToggleGroup>
      </div>
      <div className="grid grid-areas-gameBoard grid-cols-gameBoard grid-rows-gameBoard gap-4">
        <div className="grid-in-xaxis">
          <div className="grid grid-cols-10 place-items-center w-[500px]">
            {xAxis.map((_, index) => (<div key={`xaxis-${index}`}>{index}</div>))}
          </div>
        </div>
        <div className="grid-in-yaxis">
          <div className="grid grid-rows-10 place-items-center h-[500px]">
            {yAxis.map((_, index) => (<div key={`yaxis-${getYCoordinate(index)}`}>{getYCoordinate(index)}</div>))}
          </div>
        </div>
        <div className="grid-in-board">
          <div className="grid grid-cols-10 grid-rows-10 border-2 border-solid w-[500px] h-[500px] divide-x divide-y divide-slate-500 border-slate-500 ">
            {
            cells.map((_, index) => (
              <div
                key={`cell-${index}`}
                data-key={`cell-${index}`}
                className="flex justify-center items-center hover:bg-sky-500 cursor-pointer"
                onClick={() => handleCellClick(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                {index}
              </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameRoom; 