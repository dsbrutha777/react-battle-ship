import { useMemo, useCallback, useState } from 'react';
import { GRID_SIZE } from '@/utility/constants';
import { getFromCharCode } from '@/utility/utils';
import { IPlayer } from '@/interfaces';
import { Direction, ShipSize, PlayerStatus } from '@/enums';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getCoordinates } from '@/utility/utils';
import { Button } from '@/components/ui/button';
import FirebaseService from '@/services/firebaseService'

function Grid({ player, opponent, size = GRID_SIZE }: { player: IPlayer, opponent: IPlayer, size: number }) {
    const firebaseService = useMemo(() => new FirebaseService(), []);
    const xAxis = useMemo(() => Array.from({ length: size }), []); // create 10 rows
    const yAxis = useMemo(() => Array.from({ length: size }), []); // create 10 columns
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
            value: ShipSize.SUBWAY
        },
        {
            label: 'Destroyer',
            value: ShipSize.DESTROYER
        },
        {
            label: 'Cruiser',
            value: ShipSize.CRUISER
        },
        {
            label: 'Battleship',
            value: ShipSize.BATTLESHIP
        }
    ]), []);
    const [direction, setDirection] = useState(Direction.HORIZONTAL);
    const [shipSize, setShipSize] = useState(ShipSize.SUBWAY);
    const nextCellCount = useMemo(() => direction === Direction.HORIZONTAL ? 1 : GRID_SIZE, [direction]);
    const [isPlacedShip, setIsPlacedShip] = useState({
        [ShipSize.SUBWAY]: false,
        [ShipSize.DESTROYER]: false,
        [ShipSize.CRUISER]: false,
        [ShipSize.BATTLESHIP]: false,
    });
    const [isReady, setIsReady] = useState<boolean>(false);
    const isPlacedShipAll = useMemo(() => Object.values(isPlacedShip).every(x => x === true), [isPlacedShip]);
    const nextShip = useCallback(() => {
        setIsPlacedShip(prevState => ({ ...prevState, [shipSize]: true }));
        setShipSize(prevState => prevState + 1);
    }, [isPlacedShip, shipSize]);
    const useIsOverRowEnd = useCallback((cellIndex: number) => {
        const rowEndIndex = Math.floor(cellIndex / GRID_SIZE) * GRID_SIZE + GRID_SIZE - 1;
        return cellIndex + shipSize - 1 > rowEndIndex;
    }, [shipSize, direction]);
    const useIsOverColumnEnd = useCallback((cellIndex: number) => {
        const columnEndIndex = (cellIndex % GRID_SIZE) + (GRID_SIZE * (GRID_SIZE - 1));
        return cellIndex + (shipSize - 1) * GRID_SIZE > columnEndIndex;
    }, [shipSize, direction]);
    const useIsOverGridEnd = useCallback((cellIndex: number) => {
        return direction === Direction.HORIZONTAL ? useIsOverRowEnd(cellIndex) : useIsOverColumnEnd(cellIndex);
    }, [direction, useIsOverRowEnd, useIsOverColumnEnd]);
    const useIsConflictWithOtherShip = useCallback((cellIndex: number) => {
        for (let i = 0; i < shipSize; i++) {
          const cell = document.querySelector(`[data-key="cell-${cellIndex + nextCellCount * i}"]`);
          if (cell && cell.classList.contains('bg-green-500')) {
            return true;
          }
        }
        return false;
    }, [shipSize, nextCellCount]);
    const updateCellClass = useCallback((cellIndex: number, isAdd: boolean) => {
        const isOverGridEnd = useIsOverGridEnd(cellIndex);
        const isConflictWithOtherShip = useIsConflictWithOtherShip(cellIndex);
        const isDisabled = isOverGridEnd || isConflictWithOtherShip;

        const currentCellElement = document.querySelector(`[data-key="cell-${cellIndex}"]`);
        if (isAdd) {
            if (currentCellElement) {
                currentCellElement.classList.remove(isDisabled ? 'cursor-pointer' : 'cursor-not-allowed');
                currentCellElement.classList.add(isDisabled ? 'cursor-not-allowed' : 'cursor-pointer');
            }
        } else {
            if (currentCellElement) {
                currentCellElement.classList.remove('cursor-pointer', 'cursor-not-allowed');
            }
        } 

        for (let i = 0; i < shipSize; i++) {
            const cellElement = document.querySelector(`[data-key="cell-${cellIndex + nextCellCount * i}"]`);
            if (cellElement) {
                if (isAdd) {
                cellElement.classList.add(isDisabled ? 'bg-red-500' : 'bg-sky-500');
                } else {
                cellElement.classList.remove(isDisabled ? 'bg-red-500' : 'bg-sky-500');
                }
            }
        }
    }, [shipSize, nextCellCount, useIsOverGridEnd, useIsConflictWithOtherShip]);
    const handleMouseEnter = useCallback((cellIndex: number) => {
        if (isPlacedShipAll) {
            return;
        }
        if (isPlacedShip[shipSize]) {
            return;
        }
        updateCellClass(cellIndex, true);
    }, [updateCellClass, isPlacedShip, isPlacedShipAll]);
    const handleMouseLeave = useCallback((cellIndex: number) => {
        if (isPlacedShipAll) {
            return;
        }
        if (isPlacedShip[shipSize]) {
            return;
        }
        updateCellClass(cellIndex, false);
    }, [updateCellClass, isPlacedShip, isPlacedShipAll]);
    const handleCellClick = useCallback(async (index: number) => {
        if (isPlacedShipAll) {
            return;
        }
        if (isPlacedShip[shipSize]) {
            return;
        }
      
        const isOverGridEnd = useIsOverGridEnd(index);
        const isConflictWithOtherShip = useIsConflictWithOtherShip(index);
        const isDisabled = isOverGridEnd || isConflictWithOtherShip;
        if (isDisabled) {
            return;
        }

        let coordinates = [];
        for (let i = 0; i < shipSize; i++) {
            const cellIndex = index + nextCellCount * i
            const cellElement = document.querySelector(`[data-key="cell-${cellIndex}"]`);
            const [xCoordinate, yCoordinate] = getCoordinates(GRID_SIZE, cellIndex);
            console.log(`放置 ${shipTypes.find(type => type.value === shipSize)?.label}, `, `座標 { x: ${xCoordinate}, y: ${yCoordinate} }`);
      
            if (cellElement) {
              cellElement.classList.remove('bg-sky-500');
              cellElement.classList.add('bg-green-500', 'font-black');
              cellElement.innerHTML = shipSize.toString();
              coordinates.push({ x: xCoordinate, y: yCoordinate });
            }
        }

        await firebaseService.setCells(player.id, coordinates, shipSize.toString());

        // next ship
        nextShip();
    }, [shipSize, direction, shipTypes, isPlacedShip, isPlacedShipAll]);
    const handleShipSizeRevert = useCallback(async () => {
        const revertShipSize = shipSize === 2 ? 2 : shipSize - 1;
        setShipSize(revertShipSize);
        setIsPlacedShip(prevState => ({ ...prevState, [revertShipSize]: false }));

        // 找到 innerHTML 值為 shipSize 的 cell
        const cells = document.querySelectorAll(`[data-key^="cell-"]`);
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell.innerHTML === revertShipSize.toString()) {
                cell.classList.remove('bg-green-500', 'font-black');
                cell.innerHTML = '';
            }
        }

        await firebaseService.removeCells(player.id, revertShipSize.toString());
    }, [shipSize]);
    const handlePlayerReady = useCallback(async () => {
        await firebaseService.setPlayerStatus(player?.id || '', PlayerStatus.READY);
        setIsReady(true);
    }, []);
    const handlePlayerUnReady = useCallback(async () => {
        await firebaseService.setPlayerStatus(player?.id || '', PlayerStatus.PREPARE);
        setIsReady(false);
    }, []);

    return(
        <div className="grid grid-rows-[100px_1fr_auto] gap-y-8">
            <div className="flex flex-col gap-4 h-full w-full justify-center items-center">
                <div className="w-full flex flex-col gap-4">
                    <ToggleGroup variant="outline" size="lg" type="single" value={shipSize.toString()}>
                        {shipTypes.map((type: { label: string, value: ShipSize }) => <ToggleGroupItem className="grow" key={`${type.label}-${type.value}`} value={type.value.toString()} disabled={isPlacedShip[type.value]}>{type.label}</ToggleGroupItem>)}
                    </ToggleGroup>
                    <ToggleGroup variant="outline" size="lg" type="single" value={direction.toString()}>
                        {directions.map((direction: { label: string, value: Direction }) => <ToggleGroupItem className="grow" key={`${direction.label}-${direction.value}`} value={direction.value.toString()} onClick={() => setDirection(direction.value)}>{direction.label}</ToggleGroupItem>)}
                    </ToggleGroup>
                </div>
            </div>
            <div className="grid grid-areas-gameBoard grid-cols-gameBoard grid-rows-gameBoard gap-4">
                <div className="grid-in-xaxis">
                    <div className="grid grid-cols-10 place-items-center w-[500px]">
                    {xAxis.map((_, index) => (<div key={`xaxis-${index}`}>{index}</div>))}
                    </div>
                </div>
                <div className="grid-in-yaxis">
                    <div className="grid grid-rows-10 place-items-center h-[500px]">
                    {yAxis.map((_, index) => (<div key={`yaxis-${getFromCharCode(index)}`}>{getFromCharCode(index)}</div>))}
                    </div>
                </div>
                <div className="relative grid-in-board">
                    {
                        isReady && <>
                            <div className="absolute w-full h-[501px] opacity-90 cursor-not-allowed bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 to-slate-950"></div>
                            <div className="absolute flex justify-center font-black text-2xl w-[250px] left-[120px] top-[220px] -rotate-12 border-double border-8 border-red-500 text-red-500 p-2">
                                R E A D Y
                            </div>
                        </>
                    }
                    <div className="grid grid-cols-10 grid-rows-10 border-2 border-solid w-[500px] h-[500px] divide-x divide-y divide-slate-500 border-slate-500 ">
                        {   
                            player?.cells.map((_, index) => (
                                <div
                                    key={`cell-${index}`}
                                    data-key={`cell-${index}`}
                                    className="flex justify-center items-center w-[50px] h-[50px]"
                                    onClick={() => handleCellClick(index)}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={() => handleMouseLeave(index)}
                                >
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-center gap-4">
                <Button variant="outline" size="lg" disabled={shipSize === ShipSize.SUBWAY} onClick={handleShipSizeRevert}>Revert</Button>
                {!isReady && <Button variant="outline" size="lg" disabled={!isPlacedShipAll} onClick={handlePlayerReady}>Ready</Button>}
                {isReady && <Button variant="outline" size="lg" disabled={!isPlacedShipAll} onClick={handlePlayerUnReady}>Unready</Button>}
            </div>
        </div>
    )
}

export { Grid };