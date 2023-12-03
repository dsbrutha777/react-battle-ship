import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { GRID_SIZE } from "@/utility/constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast"
import { ShipSize, Direction } from '@/enums'
import { useBlocker, useParams, useNavigate } from 'react-router-dom'

import { initializeApp } from "firebase/app";
import { ref, remove, onValue, getDatabase } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

const app = initializeApp(firebaseConfig);

function GameRoom() {
  const leaveFlgRef = useRef(false);
  const db = useMemo(() => getDatabase(app), []);
  const navigate = useNavigate();
  const params = useParams();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname && nextLocation.pathname !== `/`);
  const { toast } = useToast()
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
  const [isPlacedShip, setIsPlacedShip] = useState({
    [ShipSize.SUBWAY]: false,
    [ShipSize.DESTROYER]: false,
    [ShipSize.CRUISER]: false,
    [ShipSize.BATTLESHIP]: false,
  });
  const nextCellCount = useMemo(() => direction === Direction.HORIZONTAL ? 1 : GRID_SIZE, [direction]);
  const xAxis = useMemo(() => Array.from({ length: GRID_SIZE }), []); // create 10 rows
  const yAxis = useMemo(() => Array.from({ length: GRID_SIZE }), []); // create 10 columns
  const cells = useMemo(() => Array.from({ length: GRID_SIZE * GRID_SIZE }), []); // create 100 cells

  const isAllShipPlaced = useMemo(() => Object.values(isPlacedShip).every(value => value), [isPlacedShip]);
  
  const getASCII = useCallback((index: number) => 65 + index, []);
  const getYCoordinate = useMemo(() => (index: number) => String.fromCharCode(getASCII(index)), []);

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

  const getCoordinates = (cellIndex: number) => {
    const xCoordinate = cellIndex % GRID_SIZE;
    const yCoordinate = String.fromCharCode(getASCII(Math.floor(cellIndex / GRID_SIZE)));
    return [xCoordinate, yCoordinate];
  };

  const handleCellClick = useCallback((cellIndex: number) => {
    if (isPlacedShip[shipSize]) {
      return;
    }

    const isOverGridEnd = useIsOverGridEnd(cellIndex);
    const isConflictWithOtherShip = useIsConflictWithOtherShip(cellIndex);
    const isDisabled = isOverGridEnd || isConflictWithOtherShip;
    if (isDisabled) {
      return;
    }

    const [xCoordinate, yCoordinate] = getCoordinates(cellIndex);
    console.log(`放置 ${shipTypes.find(type => type.value === shipSize)?.label}, `, `座標 { x: ${xCoordinate}, y: ${yCoordinate} }`);

    for (let i = 0; i < shipSize; i++) {
      const cellElement = document.querySelector(`[data-key="cell-${cellIndex + nextCellCount * i}"]`);
      if (cellElement) {
        cellElement.classList.remove('bg-sky-500');
        cellElement.classList.add('bg-green-500', 'font-black');
        cellElement.innerHTML = shipSize.toString();
      }
    }
    
    setIsPlacedShip((prev) => ({
      ...prev,
      [shipSize]: true,
    }));
    
    // next ship
    nextShip();
    

  }, [shipSize, nextCellCount, useIsOverGridEnd, isPlacedShip]);
  const nextShip = useCallback(() => {
    const values = Object.values(isPlacedShip); // [false, false, false, false]
    const keys = Object.keys(isPlacedShip); // ['2', '3', '4', '5']
    const nextShipSizeIndex = values.findIndex((value, index) => value === false && keys[index] !== shipSize.toString());
    if (nextShipSizeIndex !== -1) {
      setShipSize(Number(keys[nextShipSizeIndex]));
    }
  }, [isPlacedShip, shipSize]);
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
    if (isPlacedShip[shipSize]) {
      return;
    }
    updateCellClass(cellIndex, true);
  }, [updateCellClass, isPlacedShip]);
  
  const handleMouseLeave = useCallback((cellIndex: number) => {
    if (isPlacedShip[shipSize]) {
      return;
    }
    updateCellClass(cellIndex, false);
  }, [updateCellClass, isPlacedShip]);

  const handleShipPlacedRevert = useCallback(() => {
    // 找尋innerHTML為shipSize的cell
    const cells = document.querySelectorAll(`[data-key^="cell-"]`);
    cells.forEach((cell) => {
      if (cell.innerHTML === shipSize.toString()) {
        cell.classList.remove('bg-green-500', 'font-black');
        cell.innerHTML = '*';
      }
    });

    setIsPlacedShip((prev) => ({
      ...prev,
      [shipSize]: false,
    }));
  }, [shipSize]);
  const handleConfirm = useCallback(() => {
    // TODO: set client state to server
    const now = new Date();
    toast({
      title: "Let's start the game!",
      description: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    })
  }, []);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setIsAlertDialogOpen(true);
    }
  }, [blocker]);

  const handleBlockerCancelClick = useCallback((blocker: any) => {
    blocker.reset();
  }, []);
  const handleBlockerContinueClick = useCallback(async () => {
    leaveFlgRef.current = true;

    const { roomId } = params;
    const roomsRef = ref(db, `rooms/${roomId}`);
    await remove(roomsRef);
  }, []);

  useEffect(() => {
    const roomsRef = ref(db, `rooms/${params.roomId}`);
    return onValue(roomsRef, (snapshot) => {
      if (!snapshot.exists()) {
        if (!leaveFlgRef.current) {
          toast({
            title: "The room is not exist.",
            description: "Haha! Your oppenont is a coward!",
          });
        }

        leaveFlgRef.current = false; // reset this flag
        navigate('/')
      }
    });
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-col gap-4">
          <ToggleGroup variant="outline" size="lg" type="single" value={shipSize.toString()}>
            {shipTypes.map((type: { label: string, value: ShipSize }) => <ToggleGroupItem className="grow" key={`${type.label}-${type.value}`} value={type.value.toString()} onClick={() => setShipSize(type.value)}>{type.label}</ToggleGroupItem>)}
          </ToggleGroup>
          <ToggleGroup variant="outline" size="lg" type="single" value={direction.toString()}>
            {directions.map((direction: { label: string, value: Direction }) => <ToggleGroupItem className="grow" key={`${direction.label}-${direction.value}`} value={direction.value.toString()} onClick={() => setDirection(direction.value)}>{direction.label}</ToggleGroupItem>)}
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
                  className="flex justify-center items-center"
                  onClick={() => handleCellClick(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                >
                  *
                </div>
                ))
              }
            </div>
          </div>
        </div>
        <Button disabled={!isPlacedShip[shipSize]} onClick={handleShipPlacedRevert} className="bg-gradient-to-r from-sky-500 to-blue-500 font-black">Revert</Button>
        {
          isAllShipPlaced && 
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500 mt-10">I am Ready.</h1>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-500 font-black" onClick={handleConfirm}>Confirm</Button>
          </div>
        }
      </div>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Room {params.roomId}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave and remove the room?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleBlockerCancelClick(blocker)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockerContinueClick}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default GameRoom; 